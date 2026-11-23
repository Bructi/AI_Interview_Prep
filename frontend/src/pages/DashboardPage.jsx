import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import CreateSessionModal from '../components/CreateSessionModal';
import axiosInstance from '../utils/api';
import {
  Plus,
  Briefcase,
  Trash2,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/sessions');
      setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load interview sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchSessions();
  }, [user, navigate]);

  const handleDeleteSession = async (e, sessionId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this interview prep session?')) return;

    try {
      await axiosInstance.delete(`/sessions/${sessionId}`);
      toast.success('Session deleted');
      setSessions(sessions.filter((s) => s._id !== sessionId));
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.topicsToFocus?.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-600 selection:text-white">
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-white via-indigo-50/40 to-pink-50/40 border border-indigo-100/90 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wider uppercase text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/80 px-3 py-1 rounded-full mb-3 font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" />
                ✦ HONE CAREER WORKSPACES
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                Step into your technical interview workspaces, practice staff-level invariants, or sharpen concepts in the AI Learning Hub.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/learning')}
                className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-bold text-xs px-4 py-2.5 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-pink-500" />
                Learning Hub
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-purple-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Prep Session
              </button>
            </div>
          </div>
        </div>

        {/* Action & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Workspaces</h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {sessions.length} {sessions.length === 1 ? 'workspace' : 'workspaces'} configured
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by role or topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs animate-pulse h-44 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                </div>
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          /* Session Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <div
                key={session._id}
                onClick={() => navigate(`/prep/${session._id}`)}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 p-6 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
              >
                {/* Subtle colorful top accent border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />

                <div>
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 text-indigo-700 border border-purple-200/70 shadow-2xs">
                      <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                      {session.experience}
                    </span>

                    <button
                      onClick={(e) => handleDeleteSession(e, session._id)}
                      title="Delete session"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 tracking-tight">
                    {session.role}
                  </h3>

                  {session.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-normal">
                      {session.description}
                    </p>
                  )}

                  {session.topicsToFocus && session.topicsToFocus.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {session.topicsToFocus.map((topic, i) => (
                        <span
                          key={i}
                          className="font-mono text-[10px] font-semibold px-2 py-0.5 bg-indigo-50/70 text-indigo-700 rounded-full border border-indigo-200/60 shadow-2xs"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                    <span>Open Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-sm border border-zinc-200 p-12 text-center max-w-md mx-auto">
            <div className="w-10 h-10 rounded-xs bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 mx-auto mb-3">
              <Layers className="w-5 h-5 text-zinc-900" />
            </div>
            <h3 className="text-sm font-bold text-zinc-950 mb-1">No Prep Sessions Found</h3>
            <p className="text-xs text-zinc-500 mb-6">
              Create your first interview session to begin generating targeted questions.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2.5 rounded-sm shadow-xs cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create First Session
            </button>
          </div>
        )}
      </main>

      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSessionCreated={(newSession) => {
          setSessions([newSession, ...sessions]);
          navigate(`/prep/${newSession._id}`);
        }}
      />
    </div>
  );
};

export default DashboardPage;
