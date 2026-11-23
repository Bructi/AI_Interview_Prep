import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, Trash2, Loader2, BookOpen } from 'lucide-react';
import MarkdownRenderer from '../MarkdownRenderer';
import axiosInstance from '../../utils/api';
import toast from 'react-hot-toast';

const DocumentChat = ({ selectedDoc, documents, onSelectDoc }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: selectedDoc
        ? `Hello! I am your AI Learning Assistant grounded in **${selectedDoc.title}**. What would you like to explore, breakdown, or query from this document?`
        : 'Welcome! Select a document from your library to ground our technical discussion, or ask any software engineering question below.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // When selectedDoc changes, reset chat with greeting
  useEffect(() => {
    if (selectedDoc) {
      setMessages([
        {
          role: 'assistant',
          content: `I am now grounded in **${selectedDoc.title}** (${selectedDoc.fileType.toUpperCase()}). Ask me to explain concepts, extract system design invariants, or test your comprehension!`
        }
      ]);
    }
  }, [selectedDoc?._id]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMessage = { role: 'user', content: query };
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axiosInstance.post('/learning/chat', {
        documentId: selectedDoc?._id || null,
        message: query,
        conversationHistory: updatedHistory.slice(-6)
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to get AI response');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I encountered an error while synthesizing a grounded response. Please try asking again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: selectedDoc
          ? `Conversation cleared. I am grounded in **${selectedDoc.title}**. Ask anything!`
          : 'Conversation cleared. How can I assist your technical learning?'
      }
    ]);
  };

  const suggestedPrompts = selectedDoc?.suggestedQuestions && selectedDoc.suggestedQuestions.length > 0
    ? selectedDoc.suggestedQuestions
    : [
        'Explain the core architecture & key trade-offs',
        'What are the common failure modes & mitigations?',
        'Summarize the essential concepts in 3 bullet points',
        'Generate 2 rigorous interview questions based on this'
      ];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Document AI Chat</span>
              {selectedDoc && (
                <span className="font-mono text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.5 rounded-full">
                  {selectedDoc.title}
                </span>
              )}
            </h4>
            <p className="text-[11px] text-slate-500 font-mono">
              {selectedDoc
                ? `Grounded in ${selectedDoc.fileType.toUpperCase()} document content`
                : 'General technical engineering assistant'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {documents && documents.length > 0 && (
            <select
              value={selectedDoc?._id || ''}
              onChange={(e) => onSelectDoc(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-700 focus:border-indigo-600"
            >
              <option value="">General (No Document)</option>
              {documents.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.title}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={clearChat}
            title="Clear conversation"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white shadow-xs rounded-tr-none'
                  : 'bg-white border border-slate-200/90 text-slate-800 shadow-2xs rounded-tl-none'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <MarkdownRenderer content={msg.content} />
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-slate-500 shadow-2xs">
              <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              <span>Analyzing document context and synthesizing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-5 py-2.5 bg-slate-50/80 border-t border-slate-200/70 flex flex-wrap gap-1.5">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-medium text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded-full px-3 py-1 transition-colors cursor-pointer shadow-2xs"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div className="p-3.5 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-1.5 focus-within:border-indigo-600 focus-within:bg-white focus-within:ring-1 focus-within:ring-indigo-600 transition-all shadow-2xs">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedDoc
                ? `Ask about "${selectedDoc.title}"... (Enter to send)`
                : 'Ask any technical architecture or engineering question...'
            }
            className="flex-1 px-2.5 py-1.5 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentChat;
