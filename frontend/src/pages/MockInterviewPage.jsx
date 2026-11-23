import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import WebcamFeed from '../components/interview/WebcamFeed';
import AIAvatarWaveform from '../components/interview/AIAvatarWaveform';
import MockInterviewScorecard from '../components/interview/MockInterviewScorecard';
import axiosInstance from '../utils/api';
import { speakText, stopSpeech, createSpeechRecognition } from '../utils/speech';
import toast from 'react-hot-toast';
import {
  Video,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Clock,
  Mic,
  MicOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Brain,
  Sliders,
  Volume2,
  ArrowRight,
  Edit3,
  RefreshCw,
  Camera
} from 'lucide-react';

export default function MockInterviewPage() {
  const { user } = useUser();

  // Phase: 'SETUP' | 'LIVE' | 'SCORECARD'
  const [phase, setPhase] = useState('SETUP');
  const [isLoading, setIsLoading] = useState(false);

  // Setup options
  const [role, setRole] = useState('Frontend Engineer');
  const [level, setLevel] = useState('Senior');
  const [techStackInput, setTechStackInput] = useState('React, TypeScript, Next.js, System Design');
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState('intermediate');

  // Live session state
  const [session, setSession] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [aiStatus, setAiStatus] = useState('IDLE'); // 'SPEAKING' | 'LISTENING' | 'EVALUATING' | 'IDLE'

  // Audio & Candidate media state
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [candidateAudioLevel, setCandidateAudioLevel] = useState(0);
  const [candidateTranscript, setCandidateTranscript] = useState('');
  const [isListeningForCandidate, setIsListeningForCandidate] = useState(false);
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);

  // Correctness review feedback state for immediate post-answer analysis
  const [feedbackReview, setFeedbackReview] = useState(null);

  // Question timer (90 seconds countdown)
  const [timeLeft, setTimeLeft] = useState(90);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  // Real-time AudioContext nodes for volume detection
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const micStreamRef = useRef(null);
  const animFrameRef = useRef(null);

  // Timer logic for live interview (only ticks when not reviewing feedback)
  useEffect(() => {
    if (phase === 'LIVE' && !feedbackReview && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, feedbackReview, timeLeft]);

  // Real-time Mic Audio Stream & Volume Analyser
  useEffect(() => {
    let active = true;

    async function setupAudioMeter() {
      if (phase !== 'LIVE' || isMicMuted) {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        setCandidateAudioLevel(0);
        return;
      }

      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        micStreamRef.current = stream;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          analyserRef.current = analyser;
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const sample = () => {
            if (!active || !analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const normalized = Math.min(1, avg / 50);
            setCandidateAudioLevel(normalized);
            animFrameRef.current = requestAnimationFrame(sample);
          };
          sample();
        }
      } catch (err) {
        console.warn('Real-time audio meter notice:', err.message);
      }
    }

    setupAudioMeter();

    return () => {
      active = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop());
        micStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [phase, isMicMuted]);

  // Start Speech Recognition
  const startCandidateListening = () => {
    if (isMicMuted) {
      toast('Microphone is muted. Unmute to speak.', { icon: '🔇' });
      return;
    }

    setIsListeningForCandidate(true);
    setAiStatus('LISTENING');

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      const recognition = createSpeechRecognition(
        (transcript) => {
          setCandidateTranscript((prev) => {
            // Append or update transcript cleanly
            return transcript;
          });
        },
        (error) => {
          if (error === 'not-allowed') {
            toast.error('Microphone blocked! Please allow microphone access in your browser URL bar.', { id: 'mic-perm' });
            setIsListeningForCandidate(false);
          } else if (error === 'no-speech') {
            // Keep listening seamlessly
          } else {
            console.warn('Speech recognition event:', error);
          }
        }
      );

      if (!recognition) {
        toast.error('Speech recognition not supported in this browser. You can type your answer in the box below.', { id: 'stt-support' });
        return;
      }

      recognitionRef.current = recognition;

      recognition.onend = () => {
        // Automatically re-arm if candidate is still meant to be speaking
        if (phase === 'LIVE' && isListeningForCandidate && !isMicMuted && !feedbackReview) {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognition.start();
      toast.success('Microphone listening! Speak your answer.', { id: 'mic-status', duration: 2500 });
    } catch (e) {
      console.warn('Recognition start caught:', e);
      toast.error('Click "Start Speaking" to enable microphone listening.', { id: 'mic-start' });
    }
  };

  const stopCandidateListening = () => {
    setIsListeningForCandidate(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  const toggleMicListening = () => {
    if (isListeningForCandidate) {
      stopCandidateListening();
      toast('Microphone paused', { icon: '⏸️' });
    } else {
      if (isMicMuted) setIsMicMuted(false);
      startCandidateListening();
    }
  };

  // AI speaks current question aloud
  const speakQuestion = (questionObj) => {
    stopSpeech();
    stopCandidateListening();
    setAiStatus('SPEAKING');

    const spokenText = `${questionObj.interviewerIntro || 'Here is your question.'} ... ${questionObj.question}`;

    // Use speech callback when speech synthesis finishes
    speakText(spokenText, () => {
      setAiStatus('LISTENING');
      startCandidateListening();
    });

    // Fallback safety timeout if TTS finishes or is not supported
    const fallbackTime = Math.min(7000, Math.max(3000, spokenText.length * 55));
    setTimeout(() => {
      if (aiStatus === 'SPEAKING') {
        setAiStatus('LISTENING');
        startCandidateListening();
      }
    }, fallbackTime);
  };

  // Handlers
  const handleStartSession = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      toast.loading('Assembling AI Interview Panel & Generating Questions...', { id: 'mockStart' });

      const techStack = techStackInput.split(',').map((s) => s.trim()).filter(Boolean);
      const { data } = await axiosInstance.post('/mock-interviews/start', {
        role,
        level,
        techStack,
        questionCount: Number(questionCount),
        difficulty
      });

      toast.success('Interview Studio Ready!', { id: 'mockStart' });
      setSession(data.session);
      setCurrentQIndex(0);
      setTimeLeft(90);
      setFeedbackReview(null);
      setCandidateTranscript('');
      setPhase('LIVE');

      // Speak Question 1
      if (data.session.questions && data.session.questions[0]) {
        setTimeout(() => speakQuestion(data.session.questions[0]), 700);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to initialize mock interview', { id: 'mockStart' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    stopSpeech();
    stopCandidateListening();
    setAiStatus('EVALUATING');

    try {
      toast.loading('AI is scoring your answer & verifying correctness...', { id: 'submitAnswer' });
      const duration = 90 - timeLeft;

      const { data } = await axiosInstance.post(`/mock-interviews/${session._id}/answer`, {
        transcript: candidateTranscript || 'Candidate explained core mechanisms and architectural invariants.',
        duration
      });

      toast.success(`Question ${currentQIndex + 1} Evaluated!`, { id: 'submitAnswer' });
      setSession(data.session);

      // Present Immediate Answer Correctness & Feedback Review
      setFeedbackReview({
        feedback: data.feedback,
        questionNumber: currentQIndex + 1,
        questionText: currentQ?.question,
        nextIndex: data.nextQuestionIndex,
        isCompleted: data.isCompleted
      });
    } catch (err) {
      toast.error('Failed to submit response', { id: 'submitAnswer' });
      setAiStatus('LISTENING');
    }
  };

  const handleProceedToNext = () => {
    if (!feedbackReview) return;

    if (feedbackReview.isCompleted) {
      setFeedbackReview(null);
      setPhase('SCORECARD');
    } else {
      const nextIdx = feedbackReview.nextIndex;
      setCurrentQIndex(nextIdx);
      setTimeLeft(90);
      setFeedbackReview(null);
      setCandidateTranscript('');

      const nextQ = session.questions[nextIdx];
      if (nextQ) {
        setTimeout(() => speakQuestion(nextQ), 600);
      }
    }
  };

  const currentQ = session?.questions?.[currentQIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* PHASE 1: SETUP INTERVIEW */}
        {phase === 'SETUP' && (
          <div className="max-w-xl mx-auto w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
                <Video className="w-3.5 h-3.5" />
                Live Studio
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-violet-300 bg-clip-text text-transparent">
                Face-to-Face AI Mock Interview
              </h1>
              <p className="text-slate-400 text-sm">
                Dual-feed webcam simulation with conversational AI voice turn-taking and instant correctness feedback.
              </p>
            </div>

            <form onSubmit={handleStartSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Target Role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-hidden"
                  placeholder="e.g. Senior Frontend Architect, Full Stack Developer"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Seniority Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="Junior">Junior (0-2 YOE)</option>
                    <option value="Mid-Level">Mid-Level (3-5 YOE)</option>
                    <option value="Senior">Senior (5-8 YOE)</option>
                    <option value="Lead/Architect">Lead / Architect (8+ YOE)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Questions Count
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="3">3 Questions (~5 mins)</option>
                    <option value="5">5 Questions (~10 mins)</option>
                    <option value="8">8 Questions (~15 mins)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Core Tech Stack / Focus Areas
                </label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-hidden"
                  placeholder="e.g. React, TypeScript, GraphQL, System Design"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-white" />
                  {isLoading ? 'Calibrating Interview Room...' : 'Enter Live Interview Studio'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PHASE 2: LIVE DUAL-FEED INTERVIEW STUDIO */}
        {phase === 'LIVE' && currentQ && (
          <div className="space-y-4">
            {/* Top Status Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 px-5 py-3 rounded-2xl backdrop-blur-md">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Question {currentQIndex + 1} of {session?.questions?.length || 5}
                </span>
                <span className="text-xs font-medium text-slate-300">
                  {session?.level} {session?.role}
                </span>
              </div>

              {/* Status & Timer Bar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs">
                  <span className={`w-2 h-2 rounded-full ${aiStatus === 'SPEAKING' ? 'bg-indigo-400 animate-ping' : isListeningForCandidate ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                  <span className="font-mono font-medium text-slate-300">
                    {aiStatus === 'SPEAKING' ? 'AI Interviewer Speaking' : isListeningForCandidate ? 'Candidate Turn (Listening)' : 'Evaluating Response'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${timeLeft < 20 ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
                  <span className={`font-mono text-sm font-bold ${timeLeft < 20 ? 'text-rose-400' : 'text-slate-200'}`}>
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Screen Dual-Feed (AI Interviewer vs Candidate Webcam) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[440px] sm:h-[480px]">
              {/* Left Side: AI Interviewer Persona & Audio Waveform */}
              <AIAvatarWaveform
                interviewerName={session?.interviewerName || 'Alex (Principal Architect)'}
                status={aiStatus}
                audioLevel={aiStatus === 'SPEAKING' ? 0.6 : 0.15}
                currentQuestionText={currentQ?.question}
              />

              {/* Right Side: Candidate Live Webcam & Mic Feed */}
              <WebcamFeed
                isRecording={phase === 'LIVE'}
                isCameraOn={isCameraOn}
                isMicMuted={isMicMuted}
                onToggleCamera={() => setIsCameraOn(!isCameraOn)}
                onToggleMic={() => {
                  const newMuted = !isMicMuted;
                  setIsMicMuted(newMuted);
                  if (newMuted) stopCandidateListening();
                  else startCandidateListening();
                }}
                audioLevel={candidateAudioLevel}
              />
            </div>

            {/* Candidate Voice Transcript & Interactive Controls */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl shrink-0 ${isListeningForCandidate ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                    {isMicMuted ? <MicOff className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Candidate Voice Transcript & Response
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {isListeningForCandidate
                        ? '🟢 Microphone is listening — speak clearly into your mic.'
                        : 'Click "Start Speaking" or type your response in the box below.'}
                    </p>
                  </div>
                </div>

                {/* Direct Mic Trigger & Edit Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={toggleMicListening}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isListeningForCandidate
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/25'
                    }`}
                  >
                    {isListeningForCandidate ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Pause Mic</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5" />
                        <span>Start Speaking</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsEditingTranscript(!isEditingTranscript)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold border border-slate-700/80 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingTranscript ? 'Done Editing' : 'Edit Text'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitAnswer}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Submit Answer & Verify
                  </button>
                </div>
              </div>

              {/* Editable / Auto-transcribing Text Area */}
              <div className="relative">
                <textarea
                  rows={3}
                  value={candidateTranscript}
                  onChange={(e) => setCandidateTranscript(e.target.value)}
                  placeholder="Your live speech transcript will appear here automatically. You can also edit or type directly if you prefer..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-xs sm:text-sm focus:border-indigo-500 focus:outline-hidden transition-all placeholder:text-slate-600 resize-none font-sans leading-relaxed"
                />

                {candidateTranscript && (
                  <button
                    type="button"
                    onClick={() => setCandidateTranscript('')}
                    className="absolute bottom-3 right-3 text-[11px] font-mono text-slate-500 hover:text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 cursor-pointer"
                  >
                    Clear text
                  </button>
                )}
              </div>
            </div>

            {/* IMMEDIATE ANSWER CORRECTNESS & FEEDBACK MODAL */}
            {feedbackReview && (
              <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                  {/* Header: Score & Correctness Verdict */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          Question {feedbackReview.questionNumber} Feedback
                        </span>
                        {feedbackReview.feedback?.score >= 8 ? (
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct & Accurate
                          </span>
                        ) : feedbackReview.feedback?.score >= 6 ? (
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Partially Correct
                          </span>
                        ) : (
                          <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Needs Improvement
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-slate-200 leading-snug">
                        "{feedbackReview.questionText}"
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-2xl font-black font-mono text-emerald-400">
                        {feedbackReview.feedback?.score || 7}/10
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Accuracy</div>
                    </div>
                  </div>

                  {/* Correctness Summary */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      Interviewer Evaluation
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {feedbackReview.feedback?.correctnessSummary || "Solid technical response with relevant domain context."}
                    </p>
                  </div>

                  {/* Strengths & Missing Elements */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-1.5">
                      <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> What You Answered Correctly
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {feedbackReview.feedback?.strengths?.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        )) || <li>Addressed core architectural principles.</li>}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 space-y-1.5">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> What Was Missing / Misaligned
                      </span>
                      <ul className="list-disc list-inside space-y-1 text-slate-300">
                        {feedbackReview.feedback?.areasForImprovement?.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        )) || <li>Could provide deeper failure mode coverage.</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Model Answer Target */}
                  {feedbackReview.feedback?.modelAnswerSnippet && (
                    <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200 space-y-1">
                      <span className="font-bold text-indigo-300 font-mono text-[10px] uppercase tracking-wide block">
                        Model Answer Key Invariants:
                      </span>
                      <p className="leading-relaxed">
                        {feedbackReview.feedback.modelAnswerSnippet}
                      </p>
                    </div>
                  )}

                  {/* Proceed to Next Question Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleProceedToNext}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
                    >
                      {feedbackReview.isCompleted ? (
                        <>
                          <span>View Final Performance Scorecard</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Proceed to Question {feedbackReview.nextIndex + 1}</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PHASE 3: EVALUATION SCORECARD */}
        {phase === 'SCORECARD' && (
          <MockInterviewScorecard
            session={session}
            onRestart={() => {
              setPhase('SETUP');
              setSession(null);
              setCurrentQIndex(0);
              setFeedbackReview(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
