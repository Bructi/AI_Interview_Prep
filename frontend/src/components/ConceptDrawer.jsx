import React from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const ConceptDrawer = ({ isOpen, onClose, question, explanation, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Technical Concept Breakdown</h3>
                <p className="font-mono text-[11px] text-slate-500">Architectural principles, mechanics, and failure modes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Question Banner */}
          <div className="px-6 py-3.5 bg-indigo-50/40 border-b border-indigo-100/70">
            <span className="font-mono text-[10px] font-bold text-indigo-700 uppercase tracking-widest block mb-1">
              Context Question
            </span>
            <p className="text-xs font-semibold text-slate-900 line-clamp-2">
              {question?.question}
            </p>
          </div>

          {/* Body Content with rich markdown rendering */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mb-3" />
                <h4 className="text-xs font-bold text-slate-900">Synthesizing Concise Breakdown</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mt-1">
                  Extracting core system invariants, trade-offs, and implementation idioms...
                </p>
              </div>
            ) : explanation ? (
              <div className="prose-clean">
                <MarkdownRenderer content={explanation} />
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs font-mono">
                No explanation available.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-950 bg-white border border-slate-300 rounded-md shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptDrawer;
