import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Pin,
  Trash2,
  Copy,
  Check,
  Plus,
  Loader2,
  Edit2,
  Save,
  Tag
} from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import axiosInstance from '../../utils/api';
import toast from 'react-hot-toast';

const SmartNotesView = ({ notes, onNotesUpdated, documents, sessions, selectedDocId }) => {
  const [selectedNote, setSelectedNote] = useState(notes[0] || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Note generation dialog state
  const [showGenModal, setShowGenModal] = useState(false);
  const [sourceType, setSourceType] = useState(selectedDocId ? 'document' : 'topic');
  const [targetDocId, setTargetDocId] = useState(selectedDocId || '');
  const [targetSessionId, setTargetSessionId] = useState('');
  const [customTopic, setCustomTopic] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      toast.loading('Synthesizing high-yield study cheatsheet...', { id: 'notesGenToast' });

      const payload = {};
      if (sourceType === 'document') payload.documentId = targetDocId;
      else if (sourceType === 'session') payload.sessionId = targetSessionId;
      else payload.topic = customTopic;

      const { data } = await axiosInstance.post('/learning/notes/generate', payload);

      toast.success('Smart study notes generated!', { id: 'notesGenToast' });
      setShowGenModal(false);
      if (onNotesUpdated) onNotesUpdated();
      setSelectedNote(data.note);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to generate study notes', { id: 'notesGenToast' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTogglePin = async (noteId) => {
    try {
      const note = notes.find((n) => n._id === noteId);
      if (!note) return;
      const { data } = await axiosInstance.put(`/learning/notes/${noteId}`, {
        isPinned: !note.isPinned
      });
      if (onNotesUpdated) onNotesUpdated();
      if (selectedNote?._id === noteId) {
        setSelectedNote(data.note);
      }
      toast.success(data.note.isPinned ? 'Note pinned' : 'Note unpinned');
    } catch (err) {
      toast.error('Failed to update pin state');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete these study notes?')) return;
    try {
      await axiosInstance.delete(`/learning/notes/${noteId}`);
      toast.success('Note deleted');
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
      }
      if (onNotesUpdated) onNotesUpdated();
    } catch (err) {
      toast.error('Failed to delete note');
    }
  };

  const handleCopyNote = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Notes copied to clipboard');
  };

  const handleSaveEdit = async () => {
    if (!selectedNote) return;
    try {
      const { data } = await axiosInstance.put(`/learning/notes/${selectedNote._id}`, {
        content: editContent
      });
      setSelectedNote(data.note);
      setIsEditing(false);
      if (onNotesUpdated) onNotesUpdated();
      toast.success('Notes saved');
    } catch (err) {
      toast.error('Failed to save changes');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar: Notes List & Generator Button */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Study Cheatsheets
            </h4>
            <button
              onClick={() => setShowGenModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate Notes</span>
            </button>
          </div>

          {notes.length > 0 ? (
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {notes.map((note) => {
                const isSelected = selectedNote?._id === note._id;
                return (
                  <div
                    key={note._id}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/30 ring-1 ring-indigo-500/20'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {note.title}
                      </h5>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(note._id);
                          }}
                          className={`p-1 rounded hover:bg-slate-100 ${
                            note.isPinned ? 'text-amber-500' : 'text-slate-300'
                          }`}
                        >
                          <Pin className="w-3 h-3 fill-current" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNote(note._id);
                          }}
                          className="p-1 text-slate-300 hover:text-rose-600 rounded hover:bg-rose-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2 font-mono">
                      {note.content.slice(0, 100).replace(/[#*`]/g, '')}...
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      {note.tags && note.tags.length > 0 && (
                        <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {note.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-lg">
              <BookOpen className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700">No notes created</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Click "Generate Notes" above to create a cheatsheet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content: Notes Viewer / Editor */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-6 min-h-[640px] flex flex-col justify-between">
          {selectedNote ? (
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200/80 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-full">
                      SMART NOTES
                    </span>
                    {selectedNote.isPinned && (
                      <span className="font-mono text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Pin className="w-2.5 h-2.5 fill-current" /> Pinned
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    {selectedNote.title}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopyNote(selectedNote.content, selectedNote._id)}
                    className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
                    title="Copy full notes"
                  >
                    {copiedId === selectedNote._id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (isEditing) {
                        handleSaveEdit();
                      } else {
                        setEditContent(selectedNote.content);
                        setIsEditing(true);
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold shadow-2xs transition-colors ${
                      isEditing
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Body */}
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={20}
                  className="w-full font-mono text-xs p-4 bg-slate-50 border border-slate-300 rounded-lg focus:border-indigo-600 focus:bg-white leading-relaxed"
                />
              ) : (
                <div className="prose-clean max-w-none text-xs sm:text-sm">
                  <MarkdownRenderer content={selectedNote.content} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No Note Selected</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4">
                Select a note from the left sidebar or generate an instant study cheatsheet.
              </p>
              <button
                onClick={() => setShowGenModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Study Cheatsheet
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Generator Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1">Generate AI Study Notes</h3>
            <p className="text-xs text-slate-500 mb-4">
              Create an architectural cheat sheet and high-yield notes tailored to your material.
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
                    placeholder="e.g. Distributed Consensus, React Fiber & Reconciliation"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  >
                  </input>
                </div>
              )}

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
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Cheatsheet</span>
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

export default SmartNotesView;
