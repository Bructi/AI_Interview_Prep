import React, { useState } from 'react';
import ProfileModal from '../components/ProfileModal';
import { useUser } from '../context/UserContext';
import { getAssetUrl } from '../utils/assetUrl';
import {
  User,
  Mail,
  Briefcase,
  MapPin,
  Sparkles,
  Flame,
  Zap,
  Award,
  Layers,
  Code,
  Globe,
  Edit3
} from 'lucide-react';

const GithubIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const LinkedinIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.84 6.2a1.62 1.62 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63a1.63 1.63 0 0 0 1.63-1.63A1.62 1.62 0 0 0 7.84 6.2z" />
  </svg>
);

const ProfilePage = () => {
  const { user } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const avatarSrc = user?.profileImageUrl
    ? user.profileImageUrl.startsWith('http')
      ? user.profileImageUrl
      : getAssetUrl(user.profileImageUrl)
    : null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* Profile Hero Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col gap-6">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-indigo-600/30 border-2 border-indigo-500/50 flex items-center justify-center overflow-hidden shadow-xl shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={user?.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-3xl text-indigo-300 font-mono">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {user?.name}
                  </h1>
                  <span className="px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold">
                    {user?.level || 'Senior Architect'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium mt-1">
                  {user?.title || 'Senior Full-Stack & Distributed Systems Engineer'}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {user?.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {user?.location || 'San Francisco, CA'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          {/* Gamification Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400/10 text-amber-400">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{user?.streakCount || 7}d</div>
                <div className="text-[10px] text-slate-400 font-medium">Daily Streak</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-400/10 text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{user?.xp || 450} XP</div>
                <div className="text-[10px] text-slate-400 font-medium">Engineer Score</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-400/10 text-purple-400">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{user?.sessionsCompleted || 4}</div>
                <div className="text-[10px] text-slate-400 font-medium">Sessions Done</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-400/10 text-emerald-400">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white">{user?.questionsAnswered || 28}</div>
                <div className="text-[10px] text-slate-400 font-medium">Questions Evaluated</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Bio & Tech Stack */}
          <div className="md:col-span-2 flex flex-col gap-6">
            {/* Bio Card */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col gap-3 shadow-sm">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Professional Summary &amp; Bio
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {user?.bio ||
                  'Passionate engineer specialized in scalable cloud architectures, high-performance distributed systems, and real-time APIs.'}
              </p>
            </div>

            {/* Core Competencies */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col gap-3.5 shadow-sm">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <Code className="w-4 h-4 text-indigo-400" />
                Core Technical Stack &amp; Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {user?.skills && user.skills.length > 0 ? (
                  user.skills.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))
                ) : (
                  ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Distributed Systems', 'Go', 'MongoDB'].map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Links & Target Criteria */}
          <div className="flex flex-col gap-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col gap-4 shadow-sm">
              <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                Target Role &amp; Seniority
              </h3>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Target Role</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                  {user?.targetRole || 'Senior Software Engineer'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Seniority Level</span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block">
                  {user?.experienceLevel || 'Senior (5-8 yrs)'}
                </span>
              </div>
            </div>

            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col gap-3 shadow-sm">
              <h3 className="text-sm font-bold text-white pb-2 border-b border-slate-800">
                Profiles &amp; Links
              </h3>
              <div className="flex flex-col gap-2.5">
                {user?.githubUrl && (
                  <a
                    href={user.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-indigo-400 transition-colors"
                  >
                    <GithubIcon className="w-4 h-4 text-slate-500" />
                    <span className="truncate">{user.githubUrl}</span>
                  </a>
                )}
                {user?.linkedinUrl && (
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-indigo-400 transition-colors"
                  >
                    <LinkedinIcon className="w-4 h-4 text-slate-500" />
                    <span className="truncate">{user.linkedinUrl}</span>
                  </a>
                )}
                {user?.portfolioUrl && (
                  <a
                    href={user.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-xs text-slate-300 hover:text-indigo-400 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-slate-500" />
                    <span className="truncate">{user.portfolioUrl}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} />
    </div>
  );
};

export default ProfilePage;
