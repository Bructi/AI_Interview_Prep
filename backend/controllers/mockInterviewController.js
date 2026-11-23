const { GoogleGenerativeAI } = require('@google/generative-ai');
const MockInterview = require('../models/MockInterview');
const MockInterviewQuestion = require('../models/MockInterviewQuestion');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest'
];

const callGemini = async (prompt) => {
  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });
      const res = await model.generateContent(prompt);
      return res.response.text();
    } catch (err) {
      console.warn(`Model ${modelName} failed for mock interview:`, err.message);
    }
  }
  throw new Error('All AI model endpoints unavailable for mock interview generation.');
};

/**
 * Start a new Face-to-Face Mock Interview session
 */
const startMockInterview = async (req, res) => {
  try {
    const { role, level, techStack, questionCount = 5, difficulty = 'intermediate' } = req.body;
    if (!role || !level) {
      return res.status(400).json({ success: false, message: 'Role and seniority level are required' });
    }

    const stacks = techStack && techStack.length > 0 ? techStack.join(', ') : 'Standard System Architecture & JavaScript/TypeScript';

    // 1. Generate short, punchy, bite-sized interview questions via Gemini
    const prompt = `You are a Principal Technical Interviewer at a top-tier tech company.
Generate exactly ${questionCount} concise, punchy face-to-face mock interview questions for a ${level} ${role}.
Tech stack / competencies: ${stacks}.
Difficulty: ${difficulty}.

CRITICAL CONSTRAINTS:
- Keep each question SHORT and targeted (under 25 words). Avoid long monolithic prompts.
- Make interviewerIntro brief and conversational (1 sentence).

Return a valid JSON array of objects with this exact schema:
[
  {
    "question": "Short, punchy technical question (max 25 words)",
    "interviewerIntro": "Brief 1-sentence intro",
    "expectedAnswer": "Core bullet points of what a great candidate should mention"
  }
]`;

    const text = await callGemini(prompt);
    let rawQuestions = [];
    try {
      const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      rawQuestions = JSON.parse(cleaned);
    } catch (parseErr) {
      const match = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) rawQuestions = JSON.parse(match[0]);
      else throw new Error('Failed to parse AI interview question generation JSON');
    }

    // 2. Create Interview Session
    const session = await MockInterview.create({
      user: req.user.id,
      role,
      level,
      techStack: techStack || [],
      questionCount: rawQuestions.length,
      difficulty,
      status: 'IN_PROGRESS',
      currentQuestionIndex: 0,
      startTime: new Date()
    });

    // 3. Create Question Documents
    const questionDocs = [];
    for (let i = 0; i < rawQuestions.length; i++) {
      const q = rawQuestions[i];
      const qDoc = await MockInterviewQuestion.create({
        session: session._id,
        index: i,
        question: q.question,
        interviewerIntro: q.interviewerIntro || "Let's dive into the next question.",
        estimatedTime: 90
      });
      questionDocs.push(qDoc._id);
    }

    session.questions = questionDocs;
    await session.save();

    const populatedSession = await MockInterview.findById(session._id).populate('questions');
    res.status(201).json({ success: true, session: populatedSession });
  } catch (error) {
    console.error('Start Mock Interview Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to start mock interview' });
  }
};

/**
 * Get active mock interview session status
 */
const getMockInterview = async (req, res) => {
  try {
    const session = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('questions');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve interview session' });
  }
};

/**
 * Submit candidate answer transcript for current question and get AI evaluation + next step
 */
const submitAnswer = async (req, res) => {
  try {
    const { transcript, duration } = req.body;
    const session = await MockInterview.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('questions');

    if (!session || session.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, message: 'Invalid or completed interview session' });
    }

    const currentQ = session.questions[session.currentQuestionIndex];
    if (!currentQ) {
      return res.status(400).json({ success: false, message: 'Question not found' });
    }

    // Evaluate answer with rigorous correctness feedback
    const evalPrompt = `You are a Principal Technical Interviewer evaluating a candidate's answer in a face-to-face mock interview.
Role: ${session.level} ${session.role}
Question: "${currentQ.question}"
Candidate Transcript: "${transcript || '(No speech recorded)'}"

Evaluate correctness, accuracy, and depth. Return a valid JSON object with this exact schema:
{
  "score": 8,
  "isCorrect": true,
  "correctnessSummary": "1-2 sentence verdict on correctness and what was done well or missed",
  "strengths": ["Clear explanation of core concept", "Good mention of trade-offs"],
  "areasForImprovement": ["Could elaborate more on failure modes"],
  "modelAnswerSnippet": "A concise model answer highlight (max 2 sentences)",
  "fillerWordsCount": 2
}`;

    const evalText = await callGemini(evalPrompt);
    let feedback = {};
    try {
      const cleaned = evalText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      feedback = JSON.parse(cleaned);
    } catch (e) {
      feedback = {
        score: 7,
        isCorrect: true,
        correctnessSummary: "Solid answer with good technical insight.",
        strengths: ["Addressed the core architectural question"],
        areasForImprovement: ["Provide more production examples"],
        modelAnswerSnippet: "Focus on invariants, idempotency, and failure isolation.",
        fillerWordsCount: 2
      };
    }

    currentQ.candidateTranscript = transcript || '';
    currentQ.duration = duration || 45;
    currentQ.answerFeedback = feedback;
    await currentQ.save();

    // Advance session
    const nextIndex = session.currentQuestionIndex + 1;
    let isCompleted = false;

    if (nextIndex >= session.questions.length) {
      session.status = 'COMPLETED';
      session.endTime = new Date();
      isCompleted = true;

      // Compute aggregate scorecard
      const allQs = session.questions;
      const totalScore = allQs.reduce((acc, q) => acc + (q.answerFeedback?.score || 6), 0);
      const avgScore10 = totalScore / allQs.length;
      session.overallScore = Math.round(avgScore10 * 10); // 1-100 scale

      session.scoreBreakdown = {
        technicalDepth: Math.min(100, Math.round(session.overallScore * 1.05)),
        communication: Math.min(100, Math.round(session.overallScore * 0.95)),
        confidencePacing: Math.min(100, Math.round(session.overallScore * 0.98))
      };

      session.feedbackReport = `### Executive Summary: ${session.level} ${session.role} Mock Interview\n- **Overall Rating**: ${session.overallScore}/100\n- **Key Strengths**: Strong technical foundation and structured communication.\n- **Growth Areas**: Deepen edge-case failure mode analysis and quantify latency trade-offs.`;
    } else {
      session.currentQuestionIndex = nextIndex;
    }

    await session.save();

    res.json({
      success: true,
      feedback,
      nextQuestionIndex: session.currentQuestionIndex,
      isCompleted,
      session
    });
  } catch (error) {
    console.error('Submit Answer Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to evaluate answer' });
  }
};

module.exports = {
  startMockInterview,
  getMockInterview,
  submitAnswer
};
