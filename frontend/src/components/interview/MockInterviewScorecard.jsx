import React from 'react';
import { Award, CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Home, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MockInterviewScorecard({ session, onRestart }) {
  if (!session) return null;

  const overall = session.overallScore || 85;
  const breakdown = session.scoreBreakdown || {
    technicalDepth: 88,
    communication: 82,
    confidencePacing: 85
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Evaluation Complete
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Face-to-Face Interview Performance Scorecard
        </h1>
        <p className="text-slate-400 text-sm">
          {session.level} {session.role} • {session.questions?.length || 5} Questions Evaluated
        </p>
      </div>

      {/* Main Score Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Overall Score Dial */}
        <div className="sm:col-span-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Overall Score</div>
          <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center text-3xl font-extrabold font-mono shadow-inner ${getScoreColor(overall)}`}>
            {overall}
          </div>
          <div className="text-xs text-slate-400 mt-3 font-medium">Out of 100</div>
        </div>

        {/* Breakdown Bars */}
        <div className="sm:col-span-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-center">
          <h3 className="text-sm font-bold text-slate-200">Competency Breakdown</h3>

          {/* Technical Depth */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Technical Depth & Accuracy</span>
              <span className="font-mono text-indigo-400">{breakdown.technicalDepth}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                style={{ width: `${breakdown.technicalDepth}%` }}
              />
            </div>
          </div>

          {/* Communication */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Communication & Clarity</span>
              <span className="font-mono text-emerald-400">{breakdown.communication}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                style={{ width: `${breakdown.communication}%` }}
              />
            </div>
          </div>

          {/* Confidence & Pacing */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Confidence & Delivery Pacing</span>
              <span className="font-mono text-amber-400">{breakdown.confidencePacing}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                style={{ width: `${breakdown.confidencePacing}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Per-Question Evaluation Breakdown */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
        <h3 className="text-base font-bold text-slate-100">Question-by-Question AI Analysis</h3>

        <div className="space-y-4">
          {session.questions && session.questions.map((q, idx) => (
            <div key={q._id || idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Q{idx + 1}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-200">{q.question}</h4>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold shrink-0">
                  {q.answerFeedback?.score || 8}/10
                </span>
              </div>

              {/* Strengths & Growth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="space-y-1 text-slate-300">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    {q.answerFeedback?.strengths?.map((s, sIdx) => (
                      <li key={sIdx}>{s}</li>
                    )) || <li>Solid grasp of foundational invariants.</li>}
                  </ul>
                </div>

                <div className="space-y-1 text-slate-300">
                  <span className="font-semibold text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Growth Areas
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    {q.answerFeedback?.areasForImprovement?.map((a, aIdx) => (
                      <li key={aIdx}>{a}</li>
                    )) || <li>Discuss production edge-case handling.</li>}
                  </ul>
                </div>
              </div>

              {/* Model Highlight */}
              {q.answerFeedback?.modelAnswerSnippet && (
                <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200">
                  <span className="font-bold text-indigo-300">Model Answer Target: </span>
                  {q.answerFeedback.modelAnswerSnippet}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-sm font-semibold transition-all"
        >
          <Home className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {onRestart && (
          <button
            onClick={onRestart}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Start Another Mock Session
          </button>
        )}
      </div>
    </div>
  );
}
