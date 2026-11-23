import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronRight,
  RotateCcw,
  Award,
  Plus,
  Trash2,
  BookOpen,
  Loader2
} from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import axiosInstance from '../../utils/api';
import toast from 'react-hot-toast';

const QuizView = ({ quizzes, onQuizzesUpdated, documents, sessions, selectedDocId }) => {
  const [selectedQuiz, setSelectedQuiz] = useState(quizzes[0] || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionIdx]: selectedOptionIdx }
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generator modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [sourceType, setSourceType] = useState(selectedDocId ? 'document' : 'topic');
  const [targetDocId, setTargetDocId] = useState(selectedDocId || '');
  const [targetSessionId, setTargetSessionId] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);

  useEffect(() => {
    if (quizzes.length > 0 && (!selectedQuiz || !quizzes.some((q) => q._id === selectedQuiz._id))) {
      setSelectedQuiz(quizzes[0]);
      resetQuizState();
    }
  }, [quizzes]);

  const resetQuizState = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setUserAnswers({});
    setIsQuizCompleted(false);
  };

  const questions = selectedQuiz?.questions || [];
  const currentQ = questions[currentQuestionIndex] || null;

  const handleSelectOption = (optionIndex) => {
    if (selectedOption !== null || isQuizCompleted) return; // Prevent re-selection
    setSelectedOption(optionIndex);
    setShowExplanation(true);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Complete Quiz
      setIsQuizCompleted(true);
      // Calculate score
      let correct = 0;
      questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctAnswerIndex) correct++;
      });
      const percent = Math.round((correct / questions.length) * 100);

      try {
        await axiosInstance.put(`/learning/quizzes/${selectedQuiz._id}/score`, {
          score: percent
        });
        if (onQuizzesUpdated) onQuizzesUpdated();
      } catch (err) {
        console.warn('Failed to persist quiz score:', err);
      }
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      toast.loading('Synthesizing rigorous technical evaluation quiz...', { id: 'quizGenToast' });

      const payload = { count: questionCount };
      if (sourceType === 'document') payload.documentId = targetDocId;
      else if (sourceType === 'session') payload.sessionId = targetSessionId;
      else payload.topic = customTopic;

      const { data } = await axiosInstance.post('/learning/quizzes/generate', payload);

      toast.success(`Generated quiz with ${data.quiz.questions?.length || questionCount} questions!`, {
        id: 'quizGenToast'
      });
      setShowGenModal(false);
      setSelectedQuiz(data.quiz);
      resetQuizState();
      if (onQuizzesUpdated) onQuizzesUpdated();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate quiz', { id: 'quizGenToast' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Delete this quiz?')) return;
    try {
      await axiosInstance.delete(`/learning/quizzes/${quizId}`);
      toast.success('Quiz deleted');
      if (selectedQuiz?._id === quizId) {
        setSelectedQuiz(null);
        resetQuizState();
      }
      if (onQuizzesUpdated) onQuizzesUpdated();
    } catch (err) {
      toast.error('Failed to delete quiz');
    }
  };

  // Score calculations
  const totalCorrect = questions.reduce((acc, q, idx) => {
    return userAnswers[idx] === q.correctAnswerIndex ? acc + 1 : acc;
  }, 0);
  const scorePercent = questions.length > 0 ? Math.round((totalCorrect / questions.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar: Quizzes List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Technical Quizzes
            </h4>
            <button
              onClick={() => setShowGenModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Quiz</span>
            </button>
          </div>

          {quizzes.length > 0 ? (
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {quizzes.map((quiz) => {
                const isSelected = selectedQuiz?._id === quiz._id;

                return (
                  <div
                    key={quiz._id}
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      resetQuizState();
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/30 ring-1 ring-indigo-500/20'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {quiz.title}
                      </h5>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteQuiz(quiz._id);
                        }}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded hover:bg-rose-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{quiz.questions?.length || 0} questions</span>
                      {quiz.lastScore !== null && quiz.lastScore !== undefined && (
                        <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Score: {quiz.lastScore}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
              <HelpCircle className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">No quizzes generated</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "New Quiz" to test your engineering depth.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Quiz View */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 min-h-[640px] flex flex-col justify-between">
          {selectedQuiz && questions.length > 0 ? (
            isQuizCompleted ? (
              /* FINAL SCORE SUMMARY CARD */
              <div className="flex flex-col items-center justify-center my-auto py-12 text-center max-w-md mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center mb-4 shadow-xs">
                  <Award className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1">Assessment Complete!</h3>
                <p className="text-xs text-slate-500 mb-6 font-mono">
                  {selectedQuiz.title}
                </p>

                <div className="w-full bg-slate-50 border border-slate-200/80 rounded-xl p-6 mb-6 shadow-2xs">
                  <div className="text-4xl font-extrabold text-slate-900 font-mono mb-1">
                    {scorePercent}%
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    {totalCorrect} of {questions.length} Questions Correct
                  </div>
                  <div className="mt-3">
                    <span
                      className={`inline-block font-mono text-[11px] font-bold px-3 py-1 rounded-full uppercase ${
                        scorePercent >= 80
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : scorePercent >= 60
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {scorePercent >= 80
                        ? 'Architectural Mastery'
                        : scorePercent >= 60
                        ? 'Solid Competency'
                        : 'Review Recommended'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetQuizState}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Quiz</span>
                  </button>
                  <button
                    onClick={() => setShowGenModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>New Quiz</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE QUIZ QUESTION RUNNER */
              <div className="flex flex-col h-full justify-between">
                {/* Header Info */}
                <div>
                  <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200/80 mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {selectedQuiz.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </p>
                    </div>

                    <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-md">
                      Score: {totalCorrect} / {currentQuestionIndex + (selectedOption !== null ? 1 : 0)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{
                        width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                      }}
                    />
                  </div>
                </div>

                {/* Question & Options */}
                <div className="my-auto py-2 space-y-5">
                  <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-5 shadow-2xs">
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full uppercase mb-2 inline-block">
                      Technical Assessment
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {currentQ.question}
                    </h4>
                  </div>

                  {/* Options List */}
                  <div className="space-y-2.5">
                    {currentQ.options.map((opt, optIdx) => {
                      const isChosen = selectedOption === optIdx;
                      const isCorrect = optIdx === currentQ.correctAnswerIndex;
                      const hasAnswered = selectedOption !== null;

                      let buttonStyle = 'border-slate-200/90 bg-white hover:border-indigo-400 hover:bg-slate-50/60 text-slate-800';

                      if (hasAnswered) {
                        if (isCorrect) {
                          buttonStyle = 'border-emerald-400 bg-emerald-50/80 text-emerald-900 ring-1 ring-emerald-500/30';
                        } else if (isChosen && !isCorrect) {
                          buttonStyle = 'border-rose-400 bg-rose-50/80 text-rose-900 ring-1 ring-rose-500/30';
                        } else {
                          buttonStyle = 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={hasAnswered}
                          onClick={() => handleSelectOption(optIdx)}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer shadow-2xs ${buttonStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md font-mono text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                              hasAnswered && isCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : hasAnswered && isChosen && !isCorrect
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>

                          <span className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                            {opt}
                          </span>

                          {hasAnswered && isCorrect && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                          )}
                          {hasAnswered && isChosen && !isCorrect && (
                            <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Architectural Explanation Card */}
                  {showExplanation && (
                    <div className="p-4 rounded-xl border border-indigo-200/80 bg-indigo-50/40 text-slate-800 text-xs sm:text-sm leading-relaxed animate-in fade-in duration-200 shadow-2xs">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-indigo-700 uppercase mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Architectural Rationale</span>
                      </div>
                      <MarkdownRenderer content={currentQ.explanation} />
                    </div>
                  )}
                </div>

                {/* Next Button Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                  <span className="font-mono text-xs text-slate-400">
                    {selectedOption === null ? 'Select an answer to reveal rationale' : 'Ready for next question'}
                  </span>

                  <button
                    onClick={handleNextQuestion}
                    disabled={selectedOption === null}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span>
                      {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'View Results'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <HelpCircle className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No Quiz Selected</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Select a quiz from the sidebar or generate an interactive MCQ test.
              </p>
              <button
                onClick={() => setShowGenModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Quiz
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Generate Technical Quiz</h3>
            <p className="text-xs text-slate-500 mb-4">
              AI creates multiple-choice questions with instant evaluations and architectural explanations.
            </p>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Source Material
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSourceType('document')}
                    className={`py-2 px-3 rounded-lg border font-medium text-center ${
                      sourceType === 'document'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('session')}
                    className={`py-2 px-3 rounded-lg border font-medium text-center ${
                      sourceType === 'session'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('topic')}
                    className={`py-2 px-3 rounded-lg border font-medium text-center ${
                      sourceType === 'topic'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Custom Topic
                  </button>
                </div>
              </div>

              {sourceType === 'document' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Document
                  </label>
                  <select
                    value={targetDocId}
                    onChange={(e) => setTargetDocId(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="">Choose a document...</option>
                    {documents.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.title} ({d.fileType})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sourceType === 'session' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Workspace
                  </label>
                  <select
                    value={targetSessionId}
                    onChange={(e) => setTargetSessionId(e.target.value)}
                    required
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="">Choose a workspace...</option>
                    {sessions.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.role} - {s.experience}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {sourceType === 'topic' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Engineering Topic
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Database Sharding & Indexing, React Reconciliation"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Count
                </label>
                <div className="flex gap-2">
                  {[3, 5, 10].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setQuestionCount(cnt)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border font-mono font-semibold ${
                        questionCount === cnt
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cnt} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs disabled:opacity-60"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Synthesizing Quiz...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Quiz</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizView;
