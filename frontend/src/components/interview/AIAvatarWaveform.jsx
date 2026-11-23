import React from 'react';
import { Bot, Sparkles, Volume2, HelpCircle } from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export default function AIAvatarWaveform({
  interviewerName = 'Alex (Principal Architect)',
  status = 'SPEAKING', // 'SPEAKING' | 'LISTENING' | 'EVALUATING' | 'IDLE'
  audioLevel = 0.5,
  currentQuestionText = ''
}) {
  const statusConfig = {
    SPEAKING: {
      label: 'Asking Question',
      color: 'indigo',
      badgeClass: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
      avatarRing: 'ring-4 ring-indigo-500/30'
    },
    LISTENING: {
      label: 'Listening to your answer...',
      color: 'emerald',
      badgeClass: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
      avatarRing: 'ring-4 ring-emerald-500/30'
    },
    EVALUATING: {
      label: 'Analyzing answer depth...',
      color: 'amber',
      badgeClass: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
      avatarRing: 'ring-4 ring-amber-500/30 animate-pulse'
    },
    IDLE: {
      label: 'Ready',
      color: 'slate',
      badgeClass: 'bg-slate-800 border-slate-700 text-slate-400',
      avatarRing: 'ring-1 ring-slate-700'
    }
  }[status] || {
    label: 'AI Interviewer',
    color: 'indigo',
    badgeClass: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
    avatarRing: 'ring-2 ring-indigo-500'
  };

  return (
    <div className="relative w-full h-full min-h-[380px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex flex-col justify-between p-6">
      {/* Top Header: AI Persona info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-100">{interviewerName}</h4>
            <p className="text-[11px] font-mono text-slate-400">AI Senior Interview Panel</p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${statusConfig.badgeClass}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
          {statusConfig.label}
        </div>
      </div>

      {/* Center: Animated Avatar Presence & Soundwave */}
      <div className="flex flex-col items-center justify-center my-auto py-6 space-y-5 text-center">
        <div className="relative">
          <div className={`w-28 h-28 rounded-3xl bg-slate-800/80 border border-slate-700 flex items-center justify-center shadow-2xl transition-all duration-300 ${statusConfig.avatarRing}`}>
            <Bot className="w-14 h-14 text-indigo-400" />
          </div>
          {status === 'SPEAKING' && (
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-600 rounded-full text-white shadow-lg animate-bounce">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Audio Visualizer Waves */}
        <div className="w-48">
          <AudioVisualizer
            level={status === 'SPEAKING' ? audioLevel : 0.15}
            isActive={status === 'SPEAKING'}
            color={statusConfig.color}
            barCount={20}
          />
        </div>

        {/* Live Question Prompter Preview */}
        {currentQuestionText && (
          <div className="max-w-md px-4 py-3 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300 line-clamp-3 leading-relaxed">
              "{currentQuestionText}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Bar: Guidelines */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Speech-to-Speech Synchronized
        </span>
        <span className="font-mono text-[11px]">Turn-Based AI</span>
      </div>
    </div>
  );
}
