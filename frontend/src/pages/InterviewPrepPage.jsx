import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import QnACard from '../components/QnACard';
import ConceptDrawer from '../components/ConceptDrawer';
import axiosInstance from '../utils/api';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Trash2,
  Briefcase,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const InterviewPrepPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Concept Drawer State
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [conceptExplanation, setConceptExplanation] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(`/sessions/${id}`);
      setSession(data.session);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load session details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [id]);

  // Pin question toggle
  const handlePin = async (questionId) => {
    try {
      const { data } = await axiosInstance.put(`/questions/${questionId}/pin`);
      setQuestions((prevQuestions) => {
        const updated = prevQuestions.map((q) =>
          q._id === questionId ? { ...q, isPinned: data.question.isPinned } : q
        );
        return updated.sort((a, b) => {
          if (a.isPinned === b.isPinned) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return a.isPinned ? -1 : 1;
        });
      });
      toast.success(data.question.isPinned ? 'Question pinned to top' : 'Question unpinned');
    } catch (err) {
      toast.error('Failed to update pin state');
    }
  };

  // Open Concept Drawer
  const handleLearnMore = async (question) => {
    setSelectedQuestion(question);
    setDrawerOpen(true);
    setConceptExplanation('');

    if (question.note) {
      setConceptExplanation(question.note);
      return;
    }

    try {
      setDrawerLoading(true);
      const { data } = await axiosInstance.post('/ai/generate-explanation', {
        question: question.question,
        answer: question.answer
      });
      setConceptExplanation(data.explanation);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate concept explanation');
    } finally {
      setDrawerLoading(false);
    }
  };

  // Load more questions
  const handleLoadMoreQuestions = async () => {
    if (!session) return;
    try {
      setLoadingMore(true);
      toast.loading('Interviewer is preparing next evaluation questions...', { id: 'loadMoreToast' });

      const { data: aiData } = await axiosInstance.post('/ai/generate-questions', {
        role: session.role,
        experience: session.experience,
        topicsToFocus: session.topicsToFocus,
        count: 5
      });

      if (aiData.questions && aiData.questions.length > 0) {
        const { data: bulkData } = await axiosInstance.post('/questions/add-bulk', {
          sessionId: session._id,
          questions: aiData.questions
        });
        const addedQuestions = bulkData.questions || [];
        setQuestions((prev) => [...prev, ...addedQuestions]);
        toast.success(`Received ${addedQuestions.length} evaluation questions`, { id: 'loadMoreToast' });
      } else {
        toast.error('No new questions returned', { id: 'loadMoreToast' });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to retrieve more questions', { id: 'loadMoreToast' });
    } finally {
      setLoadingMore(false);
    }
  };

  // Delete session
  const handleDelete = async () => {
    if (!window.confirm('Delete this interview session? All questions will be removed.')) return;
    try {
      await axiosInstance.delete(`/sessions/${id}`);
      toast.success('Session deleted');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-950 animate-spin mb-3" />
        <p className="font-mono text-xs text-zinc-600">Connecting to interview workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-600 selection:text-white">
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Navigation & Controls */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600 hover:text-indigo-600 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Workspaces
          </Link>

          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 font-mono text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Workspace
          </button>
        </div>

        {/* Clean Modern Session Header Card */}
        <div className="bg-gradient-to-r from-white via-indigo-50/40 to-pink-50/30 rounded-2xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-indigo-700 bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200/80 px-3 py-1 rounded-full shadow-2xs">
                  <Briefcase className="w-3.5 h-3.5 text-indigo-600" />
                  {session?.experience}
                </span>
                <span className="font-mono text-[11px] text-slate-500 bg-white/80 border border-slate-200 px-2.5 py-0.5 rounded-full">
                  Workspace: {session?._id?.slice(-8)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                {session?.role}
              </h1>
              {session?.description && (
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed mb-4">
                  {session.description}
                </p>
              )}

              {/* Topics chips */}
              {session?.topicsToFocus && session.topicsToFocus.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {session.topicsToFocus.map((topic, i) => (
                    <span
                      key={i}
                      className="font-mono text-[11px] font-semibold px-2.5 py-0.5 bg-indigo-50/80 border border-indigo-200/60 text-indigo-700 rounded-full shadow-2xs"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick stats counter & Learning Hub Action */}
            <div className="flex sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
              <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 text-center min-w-[110px] shadow-2xs">
                <span className="block font-mono text-2xl font-extrabold text-slate-900">
                  {questions.length}
                </span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
                  Questions
                </span>
              </div>

              <Link
                to={`/learning?sessionId=${session?._id}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                Study in Hub
              </Link>
            </div>
          </div>
        </div>

        {/* Questions Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">
            Questions & Architectural Solutions
          </h2>
          <span className="font-mono text-xs text-zinc-500">
            {questions.filter((q) => q.isPinned).length} pinned
          </span>
        </div>

        {/* Questions Accordion List */}
        {questions.length > 0 ? (
          <div className="space-y-3 mb-8">
            {questions.map((q, idx) => (
              <QnACard
                key={q._id}
                question={q}
                index={idx}
                onPin={handlePin}
                onLearnMore={handleLearnMore}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-sm border border-zinc-200 p-12 text-center my-6">
            <BookOpen className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider mb-1">
              No Questions in Workspace
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mb-6">
              Initialize technical interview questions below.
            </p>
          </div>
        )}

        {/* Load More Button */}
        <div className="flex justify-center pb-12">
          <button
            onClick={handleLoadMoreQuestions}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Concise Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                <span>Generate Next Questions</span>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Concept Drawer */}
      <ConceptDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        question={selectedQuestion}
        explanation={conceptExplanation}
        loading={drawerLoading}
      />
    </div>
  );
};

export default InterviewPrepPage;
