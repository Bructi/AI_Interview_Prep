import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DocumentUploader from '../components/learning/DocumentUploader';
import DocumentChat from '../components/learning/DocumentChat';
import SmartNotesView from '../components/learning/SmartNotesView';
import FlashcardDeckView from '../components/learning/FlashcardDeckView';
import QuizView from '../components/learning/QuizView';
import axiosInstance from '../utils/api';
import { useUser } from '../context/UserContext';
import {
  FileText,
  MessageSquare,
  BookOpen,
  Layers,
  HelpCircle,
  Sparkles,
  Loader2,
  FileCheck2
} from 'lucide-react';
import toast from 'react-hot-toast';

const LearningHubPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state: 'documents' | 'chat' | 'notes' | 'flashcards' | 'quizzes'
  const initialTab = searchParams.get('tab') || 'documents';
  const initialSessionId = searchParams.get('sessionId') || '';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Data state
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [notes, setNotes] = useState([]);
  const [decks, setDecks] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    loadAllData();
  }, [user, navigate]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [docsRes, notesRes, decksRes, quizRes, sessionsRes] = await Promise.all([
        axiosInstance.get('/learning/documents').catch(() => ({ data: { documents: [] } })),
        axiosInstance.get('/learning/notes').catch(() => ({ data: { notes: [] } })),
        axiosInstance.get('/learning/flashcards').catch(() => ({ data: { decks: [] } })),
        axiosInstance.get('/learning/quizzes').catch(() => ({ data: { quizzes: [] } })),
        axiosInstance.get('/sessions').catch(() => ({ data: { sessions: [] } }))
      ]);

      const docs = docsRes.data.documents || [];
      setDocuments(docs);
      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0]._id);
      }
      setNotes(notesRes.data.notes || []);
      setDecks(decksRes.data.decks || []);
      setQuizzes(quizRes.data.quizzes || []);
      setSessions(sessionsRes.data.sessions || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load learning hub data');
    } finally {
      setLoading(false);
    }
  };

  const refreshDocuments = async () => {
    try {
      const { data } = await axiosInstance.get('/learning/documents');
      setDocuments(data.documents || []);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshNotes = async () => {
    try {
      const { data } = await axiosInstance.get('/learning/notes');
      setNotes(data.notes || []);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshDecks = async () => {
    try {
      const { data } = await axiosInstance.get('/learning/flashcards');
      setDecks(data.decks || []);
    } catch (e) {
      console.error(e);
    }
  };

  const refreshQuizzes = async () => {
    try {
      const { data } = await axiosInstance.get('/learning/quizzes');
      setQuizzes(data.quizzes || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDocumentUploaded = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setSelectedDocId(newDoc._id);
    setActiveTab('chat');
  };

  const handleDocumentDeleted = async (docId) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await axiosInstance.delete(`/learning/documents/${docId}`);
      toast.success('Document deleted');
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      if (selectedDocId === docId) {
        setSelectedDocId(documents.find((d) => d._id !== docId)?._id || '');
      }
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      prev.set('tab', tab);
      return prev;
    });
  };

  const selectedDoc = documents.find((d) => d._id === selectedDocId) || null;

  const tabs = [
    { id: 'documents', label: 'Documents', icon: FileText, count: documents.length },
    { id: 'chat', label: 'Document Chat', icon: MessageSquare },
    { id: 'notes', label: 'Study Notes', icon: BookOpen, count: notes.length },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, count: decks.length },
    { id: 'quizzes', label: 'Quizzes & MCQs', icon: HelpCircle, count: quizzes.length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="font-mono text-xs text-slate-600 font-semibold">
          Initializing AI Learning Assistant Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-white via-indigo-50/40 to-pink-50/30 rounded-2xl border border-indigo-100/90 p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase font-bold text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200/80 px-3 py-1 rounded-full mb-2.5 shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-pink-500 animate-spin" />
                ✦ HONE LEARNING STUDIO
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Architectural Learning Studio
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Upload technical papers and documents, chat with grounded AI, generate smart revision cheatsheets, review 3D active-recall flashcards, and test comprehension with multiple-choice quizzes.
              </p>
            </div>

            {selectedDoc && (
              <div className="bg-white/90 border border-indigo-200/80 rounded-xl p-3.5 flex items-center gap-3 self-start sm:self-auto shadow-xs">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-2xs">
                  <FileCheck2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-purple-600 block uppercase font-bold">
                    Active Document
                  </span>
                  <span className="text-xs font-bold text-slate-900 line-clamp-1 max-w-[180px]">
                    {selectedDoc.title}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Tab Navigation Navigation Bar */}
          <div className="flex items-center gap-2 pt-6 mt-6 border-t border-slate-200/70 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold shadow-md shadow-purple-500/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-transparent hover:border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Views */}
        <div>
          {activeTab === 'documents' && (
            <DocumentUploader
              documents={documents}
              onDocumentUploaded={handleDocumentUploaded}
              onDocumentDeleted={handleDocumentDeleted}
              selectedDocId={selectedDocId}
              onSelectDoc={(id) => setSelectedDocId(id)}
            />
          )}

          {activeTab === 'chat' && (
            <DocumentChat
              selectedDoc={selectedDoc}
              documents={documents}
              onSelectDoc={(id) => setSelectedDocId(id)}
            />
          )}

          {activeTab === 'notes' && (
            <SmartNotesView
              notes={notes}
              onNotesUpdated={refreshNotes}
              documents={documents}
              sessions={sessions}
              selectedDocId={selectedDocId}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardDeckView
              decks={decks}
              onDecksUpdated={refreshDecks}
              documents={documents}
              sessions={sessions}
              selectedDocId={selectedDocId}
            />
          )}

          {activeTab === 'quizzes' && (
            <QuizView
              quizzes={quizzes}
              onQuizzesUpdated={refreshQuizzes}
              documents={documents}
              sessions={sessions}
              selectedDocId={selectedDocId}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default LearningHubPage;
