import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import {
  Zap,
  ArrowRight,
  BookOpen,
  Layers,
  Cpu,
  Sparkles,
  Terminal,
  Shield,
  Flame
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('system');

  const handleCtaClick = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setIsSignupOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16 text-center flex flex-col items-center">
        {/* Subtle Background Glow Accent */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-4xl h-72 bg-gradient-to-tr from-indigo-200/40 via-purple-100/30 to-pink-100/30 blur-3xl pointer-events-none -z-10" />

        {/* Authentic Craftsmanship Tag Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 border border-purple-200/80 text-purple-800 font-mono text-xs font-semibold mb-6 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" />
          <span>✦ Authentic Technical Craft &amp; Engineering Mastery</span>
        </div>

        {/* High-Contrast Bold Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] max-w-4xl">
          Master Real Interviews.{' '}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            Speak with Natural Authority.
          </span>
        </h1>

        {/* Humanized Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mt-5 mb-8 font-normal">
          Move past robotic jargon and canned answers. Hone delivers authentic engineering mentorship: calibrate to staff-level invariants, ground discussion in your uploaded technical documents, and speak with the genuine conviction interviewers trust.
        </p>

        {/* High-Contrast CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto mb-14">
          <button
            onClick={handleCtaClick}
            className="w-full sm:w-auto h-12 px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-purple-500/25 inline-flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{user ? 'Open Studio Workspaces' : 'Start Honing for Free'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          {!user && (
            <button
              onClick={() => setIsLoginOpen(true)}
              className="w-full sm:w-auto h-12 px-7 bg-white hover:bg-slate-100/80 text-slate-800 font-semibold text-sm rounded-xl border border-slate-300 transition-all cursor-pointer shadow-2xs"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Clean Terminal Preview Box */}
        <div className="w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl text-left text-slate-100 overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50" />
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50" />
              <span className="ml-2 font-mono text-xs text-slate-300 font-medium">hone-studio — live evaluation terminal</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-purple-500/40 text-[11px] font-mono text-pink-300 font-semibold shadow-2xs">
              LIVE PREVIEW
            </span>
          </div>

          {/* Interactive Navigation Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
            <button
              onClick={() => setActiveTab('system')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === 'system'
                  ? 'bg-slate-900 border-indigo-500 text-white shadow-xs'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="font-mono text-xs text-indigo-400 font-semibold mb-0.5">01 / System Design</div>
              <div className="text-xs font-bold text-white">Distributed Caching</div>
            </button>
            <button
              onClick={() => setActiveTab('concurrency')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === 'concurrency'
                  ? 'bg-slate-900 border-indigo-500 text-white shadow-xs'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="font-mono text-xs text-indigo-400 font-semibold mb-0.5">02 / Concurrency</div>
              <div className="text-xs font-bold text-white">Locks &amp; Deadlocks</div>
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-slate-900 border-indigo-500 text-white shadow-xs'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <div className="font-mono text-xs text-indigo-400 font-semibold mb-0.5">03 / Learning Hub</div>
              <div className="text-xs font-bold text-white">Grounded PDF Ingestion</div>
            </button>
          </div>

          {/* Terminal Screen Content */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-200 leading-relaxed min-h-[140px]">
            {activeTab === 'system' && (
              <div>
                <p className="text-indigo-300 font-semibold mb-2">Q: How do you handle cache invalidation in high-write microservices?</p>
                <p className="text-slate-200 mb-2">
                  <strong className="text-emerald-400 font-semibold">Core Concept</strong>: Implement write-through caching combined with asynchronous event-driven invalidation via Kafka to prevent stale reads.
                </p>
                <p className="text-slate-300">
                  <strong className="text-indigo-300 font-semibold">Key Mechanisms</strong>: <code className="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700">TTL expiration</code>, <code className="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700">Redis pub/sub</code>, <code className="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700">Versioning</code>
                </p>
              </div>
            )}
            {activeTab === 'concurrency' && (
              <div>
                <p className="text-indigo-300 font-semibold mb-2">Q: Compare optimistic vs pessimistic locking in distributed SQL transactions.</p>
                <p className="text-slate-200 mb-2">
                  <strong className="text-emerald-400 font-semibold">Core Concept</strong>: Optimistic locking assumes low conflict and validates row version identifiers at commit; pessimistic locks rows immediately.
                </p>
                <p className="text-slate-300">
                  <strong className="text-indigo-300 font-semibold">Key Mechanisms</strong>: <code className="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700">SELECT ... FOR UPDATE</code>, <code className="bg-slate-950 text-indigo-300 px-1.5 py-0.5 rounded border border-slate-700">version_id checksum</code>
                </p>
              </div>
            )}
            {activeTab === 'ai' && (
              <div>
                <p className="text-indigo-300 font-semibold mb-2">AI Learning Assistant: PDF Document Grounding</p>
                <p className="text-slate-200 mb-2">
                  <strong className="text-emerald-400 font-semibold">Active Engine</strong>: Upload technical papers, specs, or study guides up to 25MB. Instantly extract key architectural concepts into 3D flashcards and quizzes.
                </p>
                <p className="text-slate-300">
                  <strong className="text-indigo-300 font-semibold">Status</strong>: <span className="text-emerald-400 font-semibold">Operational in AI Learning Hub ✓</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Grid Section with Clean Contrast */}
      <section className="py-16 bg-white border-t border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Architected for Maximum Interview Signal
            </h2>
            <p className="text-slate-600 mt-2 text-sm leading-relaxed">
              Target high-yield topics without fluff. Designed to help you clear senior engineering rounds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 border border-indigo-200/70">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Seniority Calibration</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Calibrate questions from junior implementation fundamentals to staff-level distributed systems trade-offs and failure modes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 border border-purple-200/70">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">AI Document Grounding</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Upload technical whitepapers and resumes. Chat with grounded AI, generate smart revision cheatsheets, and review 3D flashcards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 border border-emerald-200/70">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Interactive Quizzes &amp; MCQs</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Test your architectural knowledge with instant evaluation, score tracking, and detailed explanations of system invariants.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Light Footer */}
      <footer className="py-8 bg-slate-100 border-t border-slate-200 text-xs text-slate-600 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
              H
            </div>
            <span className="font-bold text-slate-900">Hone Studio</span>
            <span className="text-slate-500">• Human-Crafted Career &amp; Technical Interview Studio</span>
          </div>
          <span className="font-mono text-[11px] text-slate-500 font-semibold">VERSION 2.5.0 (HUMANIZED)</span>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToSignup={() => {
          setIsLoginOpen(false);
          setIsSignupOpen(true);
        }}
      />
      <SignupModal
        isOpen={isSignupOpen}
        onClose={() => setIsSignupOpen(false)}
        onSwitchToLogin={() => {
          setIsSignupOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
};

export default LandingPage;
