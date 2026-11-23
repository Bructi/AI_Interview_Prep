import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import axiosInstance from '../utils/api';
import toast from 'react-hot-toast';

const POPULAR_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Engineer',
  'React Developer',
  'Node.js Developer',
  'DevOps Engineer',
  'System Architect',
  'Data Engineer'
];

const EXPERIENCE_LEVELS = [
  'Junior (0-2 years)',
  'Mid-Level (2-5 years)',
  'Senior (5-8 years)',
  'Lead / Architect (8+ years)'
];

const CreateSessionModal = ({ isOpen, onClose, onSessionCreated }) => {
  const [role, setRole] = useState('Frontend Developer');
  const [experience, setExperience] = useState('Mid-Level (2-5 years)');
  const [topicInput, setTopicInput] = useState('');
  const [topics, setTopics] = useState(['React', 'JavaScript', 'Performance']);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddTopic = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = topicInput.trim().replace(/^,+|,+$/g, '');
      if (trimmed && !topics.includes(trimmed)) {
        setTopics([...topics, trimmed]);
        setTopicInput('');
      }
    }
  };

  const handleRemoveTopic = (tToRemove) => {
    setTopics(topics.filter((t) => t !== tToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role || !experience) {
      toast.error('Please specify target role and experience');
      return;
    }

    try {
      setLoading(true);
      const { data: sessionData } = await axiosInstance.post('/sessions/create', {
        role,
        experience,
        topicsToFocus: topics,
        description
      });

      const newSession = sessionData.session;
      toast.success('Workspace created. Preparing interview evaluation...');

      try {
        const { data: aiData } = await axiosInstance.post('/ai/generate-questions', {
          role,
          experience,
          topicsToFocus: topics,
          count: 5
        });

        if (aiData.questions && aiData.questions.length > 0) {
          await axiosInstance.post('/questions/add-bulk', {
            sessionId: newSession._id,
            questions: aiData.questions
          });
        }
      } catch (aiErr) {
        console.warn('Evaluation questions notice:', aiErr);
      }

      onSessionCreated(newSession);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-sm shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 flex justify-between items-start border-b border-zinc-100 bg-white">
          <div>
            <div className="font-mono text-[10px] tracking-wider uppercase text-zinc-500 mb-1">
              Interview Evaluation Setup
            </div>
            <h2 className="text-base font-semibold text-zinc-950 tracking-tight">
              New Technical Assessment Workspace
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Specify your target role, seniority parameters, and core competencies
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-900 rounded-xs transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Target Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600">
              Target Role
            </label>
            <input
              type="text"
              list="role-options"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer"
              className="h-10 px-3 bg-white border border-zinc-200 rounded-sm text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors"
              required
            />
            <datalist id="role-options">
              {POPULAR_ROLES.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>

          {/* Experience Level */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600">
              Seniority Level
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="h-10 px-3 bg-white border border-zinc-200 rounded-sm text-xs text-zinc-900 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors cursor-pointer"
            >
              {EXPERIENCE_LEVELS.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
            </select>
          </div>

          {/* Topics to Focus */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600">
              Focus Competencies (Press Enter to add)
            </label>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-1">
                {topics.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 bg-zinc-100 text-zinc-800 rounded-xs border border-zinc-200"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTopic(t)}
                      className="text-zinc-400 hover:text-zinc-900 cursor-pointer font-bold leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={handleAddTopic}
              placeholder="e.g. System Design, Concurrency, Performance..."
              className="h-10 px-3 bg-white border border-zinc-200 rounded-sm text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-600">
              Evaluation Context & Scope (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Focus on high-throughput microservices architecture and distributed state"
              className="p-2.5 bg-white border border-zinc-200 rounded-sm text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 flex items-center justify-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white font-medium text-xs rounded-sm transition-colors cursor-pointer disabled:opacity-60 shadow-xs mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-300" />
                Assembling Interview Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                Initialize Interview Assessment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateSessionModal;
