import React, { useState } from "react";
import {
  ChevronDown,
  Pin,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
  Clock
} from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";
import { speakText, stopSpeech } from "../utils/speech";

const QnACard = ({ question, index, onPin, onLearnMore }) => {
  const [isOpen, setIsOpen] = useState(index === 0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isDeepDiveOpen, setIsDeepDiveOpen] = useState(false);

  const handleToggleVoice = (e) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      stopSpeech();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      const cleanAnswer = question.answer
        ? question.answer.replace(/[*#`_]/g, "")
        : "";
      speakText(`${question.question}. Answer: ${cleanAnswer}`);
      setTimeout(() => setIsPlayingAudio(false), 15000);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 shadow-xs overflow-hidden ${
        question.isPinned
          ? "border-amber-300 bg-amber-50/15 ring-1 ring-amber-200/50"
          : isOpen
            ? "border-indigo-200/80 ring-1 ring-indigo-500/10"
            : "border-slate-200/80 hover:border-slate-300"
      }`}
    >
      {/* Question Header Accordion Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-4 flex items-start justify-between gap-4 cursor-pointer select-none hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-start gap-3.5 flex-1">
          <span className="shrink-0 font-mono w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center mt-0.5 border border-indigo-200/70 shadow-2xs">
            Q{index + 1}
          </span>
          <div className="flex-1 space-y-1.5">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
              {question.question}
            </h3>

            {/* Micro Badges Hierarchy */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Core Invariant
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Clock className="w-3 h-3 text-indigo-500" /> ~15s Digest
              </span>
              {question.isPinned && (
                <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-300">
                  <Pin className="w-3 h-3 fill-amber-500 text-amber-600" />
                  Pinned
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleToggleVoice}
            title={isPlayingAudio ? "Stop Voice" : "Listen with AI Voice"}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              isPlayingAudio
                ? "bg-purple-100 border-purple-300 text-purple-700 shadow-xs animate-pulse"
                : "border-slate-200 text-slate-400 hover:text-purple-600 hover:bg-purple-50/60"
            }`}
          >
            {isPlayingAudio ? (
              <VolumeX className="w-3.5 h-3.5" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          <button
            onClick={() => onPin(question._id)}
            title={question.isPinned ? "Unpin question" : "Pin to top"}
            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
              question.isPinned
                ? "bg-amber-50 border-amber-300 text-amber-700 shadow-2xs"
                : "border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-amber-50/60"
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${question.isPinned ? "fill-amber-500 text-amber-600" : ""}`} />
          </button>

          {onLearnMore && (
            <button
              onClick={() => onLearnMore(question)}
              title="Explain technical concept"
              className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span className="hidden sm:inline">Learn More</span>
            </button>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-slate-900" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Accordion Body: 3-Bullet Micro-Breakdown */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3.5 animate-in fade-in duration-200">
          <div className="text-sm text-slate-700 leading-relaxed space-y-3">
            {/* Structured Bullet Breakdown */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wide">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                Bite-Sized Architectural Breakdown
              </div>
              <MarkdownRenderer content={question.answer} />
            </div>

            {/* Progressive Disclosure Toggle for Deep Dive */}
            <div className="pt-1 flex items-center justify-between">
              <button
                onClick={() => setIsDeepDiveOpen(!isDeepDiveOpen)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isDeepDiveOpen ? "Hide Extended Deep Dive" : "Show Full Technical Deep Dive"}
              </button>

              {onLearnMore && (
                <button
                  onClick={() => onLearnMore(question)}
                  className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                >
                  Concept Drawer ↗
                </button>
              )}
            </div>

            {isDeepDiveOpen && (
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 text-xs text-indigo-900 space-y-2 animate-in fade-in">
                <span className="font-bold uppercase tracking-wider block text-[10px] text-indigo-700 font-mono">
                  Advanced Production Nuance
                </span>
                <p className="leading-relaxed">
                  When designing for high throughput, ensure eventual consistency windows are guarded by idempotent retries and strict circuit breakers.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QnACard;
