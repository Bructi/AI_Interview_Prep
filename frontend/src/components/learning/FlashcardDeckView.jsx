import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  CheckCircle2,
  Shuffle,
  Plus,
  Trash2,
  Layers,
  Loader2,
  Award
} from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import axiosInstance from '../../utils/api';
import toast from 'react-hot-toast';

const FlashcardDeckView = ({ decks, onDecksUpdated, documents, sessions, selectedDocId }) => {
  const [selectedDeck, setSelectedDeck] = useState(decks[0] || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Deck generation dialog state
  const [showGenModal, setShowGenModal] = useState(false);
  const [sourceType, setSourceType] = useState(selectedDocId ? 'document' : 'topic');
  const [targetDocId, setTargetDocId] = useState(selectedDocId || '');
  const [targetSessionId, setTargetSessionId] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [cardCount, setCardCount] = useState(8);

  // Sync selectedDeck when decks change
  useEffect(() => {
    if (decks.length > 0 && (!selectedDeck || !decks.some((d) => d._id === selectedDeck._id))) {
      setSelectedDeck(decks[0]);
      setCurrentIndex(0);
      setIsFlipped(false);
    }
  }, [decks]);

  // Keyboard navigation: Space to flip, Arrows for prev/next
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || showGenModal) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedDeck, currentIndex, showGenModal]);

  const cards = selectedDeck?.cards || [];
  const currentCard = cards[currentIndex] || null;
  const knownCount = cards.filter((c) => c.isKnown).length;
  const progressPercent = cards.length > 0 ? Math.round((knownCount / cards.length) * 100) : 0;

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleToggleKnown = async (e) => {
    e.stopPropagation();
    if (!selectedDeck || !currentCard) return;

    try {
      const { data } = await axiosInstance.put(
        `/learning/flashcards/${selectedDeck._id}/cards/${currentCard._id}/toggle`
      );
      setSelectedDeck(data.deck);
      if (onDecksUpdated) onDecksUpdated();
      toast.success(data.isKnown ? 'Marked as Mastered! 🎉' : 'Marked for review');
    } catch (err) {
      toast.error('Failed to update card status');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      toast.loading('Synthesizing active-recall flashcard deck...', { id: 'deckGenToast' });

      const payload = { count: cardCount };
      if (sourceType === 'document') payload.documentId = targetDocId;
      else if (sourceType === 'session') payload.sessionId = targetSessionId;
      else payload.topic = customTopic;

      const { data } = await axiosInstance.post('/learning/flashcards/generate', payload);

      toast.success(`Generated deck with ${data.deck.cards?.length || cardCount} cards!`, { id: 'deckGenToast' });
      setShowGenModal(false);
      setSelectedDeck(data.deck);
      setCurrentIndex(0);
      setIsFlipped(false);
      if (onDecksUpdated) onDecksUpdated();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate flashcards', { id: 'deckGenToast' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Delete this flashcard deck?')) return;
    try {
      await axiosInstance.delete(`/learning/flashcards/${deckId}`);
      toast.success('Deck deleted');
      if (selectedDeck?._id === deckId) {
        setSelectedDeck(null);
        setCurrentIndex(0);
      }
      if (onDecksUpdated) onDecksUpdated();
    } catch (err) {
      toast.error('Failed to delete deck');
    }
  };

  const handleShuffle = () => {
    if (!selectedDeck || cards.length < 2) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setSelectedDeck({ ...selectedDeck, cards: shuffled });
    setCurrentIndex(0);
    setIsFlipped(false);
    toast.success('Cards shuffled');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar: Decks List */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Flashcard Decks
            </h4>
            <button
              onClick={() => setShowGenModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Deck</span>
            </button>
          </div>

          {decks.length > 0 ? (
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {decks.map((deck) => {
                const isSelected = selectedDeck?._id === deck._id;
                const mastered = deck.cards.filter((c) => c.isKnown).length;
                const percent = Math.round((mastered / (deck.cards.length || 1)) * 100);

                return (
                  <div
                    key={deck._id}
                    onClick={() => {
                      setSelectedDeck(deck);
                      setCurrentIndex(0);
                      setIsFlipped(false);
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/30 ring-1 ring-indigo-500/20'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {deck.title}
                      </h5>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDeck(deck._id);
                        }}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded hover:bg-rose-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-2">
                      <span>{deck.cards.length} cards</span>
                      <span className="font-semibold text-emerald-700">
                        {mastered}/{deck.cards.length} mastered ({percent}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
              <Layers className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">No decks created</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "New Deck" above to generate cards.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Flashcard Arena */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 min-h-[640px] flex flex-col justify-between">
          {selectedDeck && currentCard ? (
            <div className="flex flex-col h-full justify-between">
              {/* Header Info */}
              <div>
                <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200/80 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {selectedDeck.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Card {currentIndex + 1} of {cards.length} • {progressPercent}% Mastered
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleShuffle}
                      title="Shuffle cards"
                      className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs font-mono inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Shuffle</span>
                    </button>
                    <button
                      onClick={handleToggleKnown}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-2xs transition-colors ${
                        currentCard.isKnown
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-3.5 h-3.5 ${currentCard.isKnown ? 'text-emerald-600' : 'text-slate-400'}`}
                      />
                      <span>{currentCard.isKnown ? 'Mastered' : 'Mark Known'}</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-6">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="my-auto cursor-pointer select-none py-4"
                style={{ perspective: '1200px' }}
              >
                <div
                  className="w-full min-h-[320px] rounded-2xl p-8 border transition-all duration-500 flex flex-col justify-between shadow-sm relative"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    backgroundColor: isFlipped ? '#f0fdf4' : '#ffffff',
                    borderColor: isFlipped ? '#bbf7d0' : '#e2e8f0'
                  }}
                >
                  {!isFlipped ? (
                    /* FRONT OF CARD */
                    <div className="flex flex-col justify-between h-full space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full uppercase">
                          {currentCard.category || 'Core Principle'}
                        </span>
                        <span className="font-mono text-xs text-slate-400">FRONT</span>
                      </div>

                      <div className="my-auto py-6 text-center">
                        <h4 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                          {currentCard.front}
                        </h4>
                      </div>

                      <div className="text-center pt-4 border-t border-slate-100">
                        <span className="text-[11px] font-mono text-slate-400 inline-flex items-center gap-1.5">
                          <RotateCw className="w-3 h-3 text-indigo-500" /> Click or press Space to reveal key takeaway
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* BACK OF CARD (Flipped) */
                    <div
                      className="flex flex-col justify-between h-full space-y-6"
                      style={{ transform: 'rotateY(180deg)' }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase">
                          Solution & Invariant
                        </span>
                        <span className="font-mono text-xs text-emerald-700 font-semibold">BACK</span>
                      </div>

                      <div className="my-auto py-6">
                        <div className="text-sm sm:text-base text-slate-800 leading-relaxed">
                          <MarkdownRenderer content={currentCard.back} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-emerald-200/60 text-[11px] font-mono text-emerald-800">
                        <span>Click to flip back</span>
                        <span className="text-slate-500">Space / Arrow keys supported</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200/80">
                <button
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-600">
                  <span>{currentIndex + 1}</span>
                  <span className="text-slate-400">/</span>
                  <span>{cards.length}</span>
                </div>

                <button
                  onClick={handleNext}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors shadow-xs"
                >
                  <span>Next Card</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <Layers className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No Flashcard Deck Selected</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Select a deck from the sidebar or generate interactive 3D flashcards.
              </p>
              <button
                onClick={() => setShowGenModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Flashcards
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Generate Flashcard Deck</h3>
            <p className="text-xs text-slate-500 mb-4">
              AI creates high-rigor, active-recall cards targeting invariants and trade-offs.
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
                    placeholder="e.g. Memory Management, Event Loop, CAP Theorem"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deck Size
                </label>
                <div className="flex gap-2">
                  {[5, 8, 12].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setCardCount(cnt)}
                      className={`flex-1 py-1.5 text-xs rounded-lg border font-mono font-semibold ${
                        cardCount === cnt
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cnt} Cards
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
                      <span>Synthesizing Cards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Deck</span>
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

export default FlashcardDeckView;
