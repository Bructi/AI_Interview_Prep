const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);
const Note = require('../models/Note');
const FlashcardDeck = require('../models/FlashcardDeck');
const Quiz = require('../models/Quiz');
const Session = require('../models/Session');
const Question = require('../models/Question');
const { generateWithModelFallback } = require('./aiController');

/**
 * Helper to safely extract text from PDF or text-based documents
 */
const extractTextFromBuffer = async (buffer, mimeType, filename) => {
  const ext = path.extname(filename || '').toLowerCase();
  if (ext === '.txt' || ext === '.md' || (mimeType && mimeType.includes('text'))) {
    return buffer.toString('utf-8');
  }

  try {
    const { PDFParse } = require('pdf-parse');
    const parser = new PDFParse({ data: buffer });
    await parser.load();
    const textResult = await parser.getText();
    await parser.destroy();
    if (typeof textResult === 'string') return textResult;
    if (textResult && typeof textResult.text === 'string') return textResult.text;
    return '';
  } catch (err) {
    console.warn('PDF parsing fallback to raw text extract:', err.message);
    const raw = buffer.toString('utf-8').replace(/[^\x20-\x7E\t\n\r]/g, ' ').replace(/\s+/g, ' ').trim();
    return raw.slice(0, 50000);
  }
};

/**
 * Helper to gather context text from document, session, or topic
 */
const resolveSourceContext = async (userId, { documentId, sessionId, topic }) => {
  let contextTitle = topic || 'General Engineering';
  let contextText = '';

  if (documentId) {
    const doc = await Document.findOne({ _id: documentId, user: userId });
    if (doc) {
      contextTitle = doc.title;
      contextText = doc.textContent || doc.summary || '';
    }
  } else if (sessionId) {
    const session = await Session.findOne({ _id: sessionId, user: userId });
    const questions = await Question.find({ session: sessionId });
    if (session) {
      contextTitle = `${session.role} (${session.experience})`;
      const qText = questions.map((q, i) => `Q${i + 1}: ${q.question}\nA: ${q.answer}`).join('\n\n');
      contextText = `${session.role} - ${session.experience}\nFocus: ${(session.topicsToFocus || []).join(', ')}\n\n${qText}`;
    }
  } else if (topic) {
    contextText = `Topic: ${topic}`;
  }

  return { contextTitle, contextText: contextText.slice(0, 15000) };
};

/**
 * Generate 4 high-signal, document-grounded questions for RAG prompt chips
 */
const generateDocumentQuestions = async (title, textExcerpt, summary) => {
  try {
    const prompt = `Based on the following technical document, generate 4 concise, high-impact, specific interview and exploration questions directly grounded in its key algorithms, formulas, or concepts.
Return ONLY a valid JSON array of 4 question strings without markdown fences.
Example format:
["How does X calculate Y?", "Why does Z apply W?", "What are the trade-offs of A vs B?", "How does C handle continuous values?"]

Title: ${title}
Summary: ${summary}
Content excerpt:
${(textExcerpt || '').slice(0, 3500)}`;

    const responseText = await generateWithModelFallback(prompt, false);
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.slice(0, 4);
      }
    }
  } catch (err) {
    console.warn('Failed to generate dynamic questions via LLM:', err.message);
  }

  // Intelligent domain fallback based on document title / summary keywords
  const lower = ((title || '') + ' ' + (summary || '')).toLowerCase();
  if (lower.includes('naive bayes') || lower.includes('decision tree') || lower.includes('dt-naive') || lower.includes('ocn-lec')) {
    return [
      'How does Gini Impurity calculate optimal splits in Decision Trees compared to Entropy?',
      'Why does Naive Bayes assume conditional independence given the class label?',
      'What is Laplace smoothing in Naive Bayes and when is it strictly necessary?',
      'How are continuous numerical features handled when splitting decision tree nodes?'
    ];
  } else if (lower.includes('system design') || lower.includes('distributed') || lower.includes('microservice')) {
    return [
      'What are the key trade-offs between consistency and latency in this architecture?',
      'How does this design handle node failure, network partitions, and data replication?',
      'What caching and indexing strategies are proposed to reduce p99 query latency?',
      'How is horizontal scaling achieved without introducing split-brain scenarios?'
    ];
  } else if (lower.includes('algorithm') || lower.includes('data structure') || lower.includes('tree') || lower.includes('graph')) {
    return [
      'What are the worst-case and average-case time and space complexities?',
      'How does this algorithmic approach compare with dynamic programming or greedy alternatives?',
      'What edge cases must be guarded against (empty input, duplicates, cycles)?',
      'Can this solution be optimized for memory-constrained distributed environments?'
    ];
  }

  return [
    `What are the core technical invariants and algorithms in ${title}?`,
    `Explain the mathematical or architectural trade-offs discussed in ${title}.`,
    `What are the common failure modes and edge cases highlighted in this document?`,
    `How would you implement or test the key concepts in a production system?`
  ];
};

// ==========================================
// 1. DOCUMENT MANAGEMENT
// ==========================================

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { originalname, size, mimetype } = req.file;
    const buffer = req.file.buffer;
    const extractedText = await extractTextFromBuffer(buffer, mimetype, originalname);

    // Generate a concise 2-sentence summary for rapid indexing
    let summary = '';
    try {
      const excerpt = extractedText.slice(0, 4000);
      if (excerpt.length > 50) {
        const summaryPrompt = `Provide a concise 2-sentence summary of the core technical topics and purpose of this document:\n\n${excerpt}`;
        summary = await generateWithModelFallback(summaryPrompt, false);
      } else {
        summary = `Document: ${originalname}`;
      }
    } catch (sumErr) {
      console.warn('Summary generation skipped:', sumErr.message);
      summary = `Uploaded document: ${originalname}`;
    }

    const title = req.body.title || path.basename(originalname, path.extname(originalname));
    const fileType = path.extname(originalname).replace('.', '').toLowerCase() || 'pdf';

    // Upload file buffer to Supabase Storage (works on serverless/read-only filesystem)
    let filePath = '';
    if (supabaseAdmin && process.env.SUPABASE_URL) {
      const safeName = originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `doc-${req.user.id}-${Date.now()}-${safeName}`;
      const { error } = await supabaseAdmin.storage
        .from('documents')
        .upload(fileName, buffer, {
          contentType: mimetype,
          upsert: true
        });
      if (!error) {
        const { data: pubData } = supabaseAdmin.storage
          .from('documents')
          .getPublicUrl(fileName);
        filePath = pubData?.publicUrl || '';
      }
    }

    // Generate high-signal document-specific questions
    const suggestedQuestions = await generateDocumentQuestions(title, extractedText, summary);

    const document = await Document.create({
      user: req.user.id,
      title,
      originalName: originalname,
      fileName: originalname,
      filePath,
      fileType,
      fileSize: size,
      textContent: extractedText,
      summary,
      suggestedQuestions
    });

    res.status(201).json({ success: true, document });
  } catch (error) {
    console.error('Document Upload Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process document upload' });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ user: req.user.id })
      .select('-textContent')
      .sort({ createdAt: -1 });

    // Ensure documents without suggested questions get high-signal questions backfilled
    for (let doc of documents) {
      if (!doc.suggestedQuestions || doc.suggestedQuestions.length === 0) {
        const questions = await generateDocumentQuestions(doc.title, '', doc.summary);
        doc.suggestedQuestions = questions;
        await Document.updateOne({ _id: doc._id }, { $set: { suggestedQuestions: questions } });
      }
    }

    res.json({ success: true, documents });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve documents' });
  }
};

const getDocumentById = async (req, res) => {
  try {
    let document = await Document.findOne({ _id: req.params.id, user: req.user.id });
    if (!document) {
      return res.status(400).json({ success: false, message: 'Document not found' });
    }

    if (!document.suggestedQuestions || document.suggestedQuestions.length === 0) {
      const questions = await generateDocumentQuestions(document.title, document.textContent, document.summary);
      document.suggestedQuestions = questions;
      await Document.updateOne({ _id: document._id }, { $set: { suggestedQuestions: questions } });
    }

    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve document details' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (doc.filePath && fs.existsSync(doc.filePath)) {
      try {
        await fs.promises.unlink(doc.filePath);
      } catch (e) {
        console.warn('File unlinking failed:', e.message);
      }
    }

    res.json({ success: true, message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
};

// ==========================================
// 2. INTERACTIVE DOCUMENT CHAT
// ==========================================

const chatWithDocument = async (req, res) => {
  try {
    const { documentId, message, conversationHistory = [] } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    let docContext = '';
    let docTitle = 'Engineering Knowledge Base';

    if (documentId) {
      const doc = await Document.findOne({ _id: documentId, user: req.user.id });
      if (doc) {
        docTitle = doc.title;
        docContext = (doc.textContent || doc.summary || '').slice(0, 14000);
      }
    }

    const historyPrompt = conversationHistory.slice(-4).map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');

    const prompt = `You are a Principal AI Learning Assistant. You are grounded in this technical document: "${docTitle}".
DOCUMENT CONTENT EXCERPT:
${docContext || 'No document attached. Respond using industry-standard engineering principles.'}

RECENT CONVERSATION:
${historyPrompt}

USER QUERY:
${message}

RESPONSE GUIDELINES:
- Provide an authoritative, concise, and structured answer (under 250 words).
- Use clear markdown formatting, bullet points, and code snippets where appropriate.
- Directly answer the question using the document context whenever possible.
- Highlight key trade-offs and best practices.`;

    const reply = await generateWithModelFallback(prompt, false);
    res.json({ success: true, reply });
  } catch (error) {
    console.error('Document Chat Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate response' });
  }
};

// ==========================================
// 3. AI STUDY NOTES & CHEATSHEETS
// ==========================================

const generateNotes = async (req, res) => {
  try {
    const { documentId, sessionId, topic } = req.body;
    const { contextTitle, contextText } = await resolveSourceContext(req.user.id, { documentId, sessionId, topic });

    const prompt = `You are a Lead Software Architect creating a concise, high-yield engineering cheatsheet and study notes on: "${contextTitle}".
SOURCE CONTEXT:
${contextText || topic || 'Core Full Stack Engineering & System Design'}

Generate a structured, easily digestible study guide in clean markdown:
# ${contextTitle}: Quick Revision Cheatsheet

### 1. Executive Summary & Core Invariant
2 crisp sentences summarizing the architecture and fundamental rules.

### 2. Key Concepts & Mechanisms
- **Concept 1**: Punchy definition with bold terms.
- **Concept 2**: Punchy definition with bold terms.
- **Concept 3**: Punchy definition with bold terms.

### 3. Cheat Sheet & Syntax Quick Reference
\`\`\`
// 3-5 line minimal code / architectural idiom
\`\`\`

### 4. Production Pitfalls & Interview Traps
- **Pitfall**: What often goes wrong in production.
- **Remedy**: Specific mitigation pattern.`;

    const content = await generateWithModelFallback(prompt, false);

    const note = await Note.create({
      user: req.user.id,
      document: documentId || null,
      session: sessionId || null,
      title: `${contextTitle} - Smart Notes`,
      content,
      tags: [contextTitle.split(' ')[0], 'AI-Notes']
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('Notes Generation Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate study notes' });
  }
};

const getNotes = async (req, res) => {
  try {
    const { documentId, sessionId } = req.query;
    const filter = { user: req.user.id };
    if (documentId) filter.document = documentId;
    if (sessionId) filter.session = sessionId;

    const notes = await Note.find(filter).sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve notes' });
  }
};

const updateNote = async (req, res) => {
  try {
    const { title, content, tags, isPinned } = req.body;
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { title, content, tags, isPinned } },
      { new: true }
    );
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, note });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update note' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete note' });
  }
};

// ==========================================
// 4. AI FLASHCARDS (3D FLIP CARDS)
// ==========================================

const generateFlashcards = async (req, res) => {
  try {
    const { documentId, sessionId, topic, count = 8 } = req.body;
    const { contextTitle, contextText } = await resolveSourceContext(req.user.id, { documentId, sessionId, topic });

    const prompt = `You are an expert technical instructor creating high-yield active-recall flashcards for: "${contextTitle}".
SOURCE CONTEXT:
${contextText || topic || 'Core engineering principles'}

Generate exactly ${count} flashcards. Each card must be concise, punchy, and test deep understanding rather than shallow trivia.
- "front": Clear, specific question or concept prompt (1 sentence).
- "back": Ultra-concise answer, invariant, or formula (2-3 sentences max).
- "category": Short topic category (e.g. "Architecture", "Runtime", "Algorithms").

Return ONLY a valid JSON array matching this schema:
[
  {
    "front": "What is the core distinction between X and Y?",
    "back": "X does ... whereas Y maintains ... Key trade-off is ...",
    "category": "Architecture"
  }
]`;

    const responseText = await generateWithModelFallback(prompt, true);

    let cards = [];
    try {
      cards = JSON.parse(responseText);
    } catch (parseErr) {
      const match = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        cards = JSON.parse(match[0]);
      } else {
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        cards = JSON.parse(cleaned);
      }
    }

    const deck = await FlashcardDeck.create({
      user: req.user.id,
      document: documentId || null,
      session: sessionId || null,
      title: `${contextTitle} Deck`,
      description: `Active recall deck containing ${cards.length} cards generated on ${new Date().toLocaleDateString()}`,
      cards: cards.map((c) => ({
        front: c.front,
        back: c.back,
        category: c.category || 'Core Concept',
        isKnown: false
      }))
    });

    res.status(201).json({ success: true, deck });
  } catch (error) {
    console.error('Flashcards Generation Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate flashcards' });
  }
};

const getFlashcardDecks = async (req, res) => {
  try {
    const { documentId, sessionId } = req.query;
    const filter = { user: req.user.id };
    if (documentId) filter.document = documentId;
    if (sessionId) filter.session = sessionId;

    const decks = await FlashcardDeck.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, decks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve flashcard decks' });
  }
};

const getFlashcardDeckById = async (req, res) => {
  try {
    const deck = await FlashcardDeck.findOne({ _id: req.params.id, user: req.user.id });
    if (!deck) return res.status(404).json({ success: false, message: 'Flashcard deck not found' });
    res.json({ success: true, deck });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve deck' });
  }
};

const toggleCardKnown = async (req, res) => {
  try {
    const { deckId, cardId } = req.params;
    const deck = await FlashcardDeck.findOne({ _id: deckId, user: req.user.id });
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found' });

    const card = deck.cards.id(cardId);
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    card.isKnown = !card.isKnown;
    await deck.save();

    res.json({ success: true, isKnown: card.isKnown, deck });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update card status' });
  }
};

const deleteFlashcardDeck = async (req, res) => {
  try {
    const deck = await FlashcardDeck.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!deck) return res.status(404).json({ success: false, message: 'Deck not found' });
    res.json({ success: true, message: 'Deck deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete deck' });
  }
};

// ==========================================
// 5. INTERACTIVE MULTIPLE CHOICE QUIZZES
// ==========================================

const generateQuiz = async (req, res) => {
  try {
    const { documentId, sessionId, topic, count = 5 } = req.body;
    const { contextTitle, contextText } = await resolveSourceContext(req.user.id, { documentId, sessionId, topic });

    const prompt = `You are a Principal Technical Interviewer creating a high-rigor multiple-choice engineering assessment on: "${contextTitle}".
SOURCE CONTEXT:
${contextText || topic || 'Core engineering principles'}

Generate exactly ${count} multiple-choice questions.
Requirements:
- Target real-world architectural principles, failure invariants, and mechanisms.
- Provide 4 distinct options per question.
- "correctAnswerIndex": Integer 0, 1, 2, or 3 representing the correct option.
- "explanation": Concise 1-2 sentence architectural justification of why the correct option is right and the common misconception.

Return ONLY a valid JSON array matching this schema:
[
  {
    "question": "Rigorous technical question?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 1,
    "explanation": "Option B is correct because ... whereas Option A fails due to ..."
  }
]`;

    const responseText = await generateWithModelFallback(prompt, true);

    let questions = [];
    try {
      questions = JSON.parse(responseText);
    } catch (parseErr) {
      const match = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        questions = JSON.parse(match[0]);
      } else {
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        questions = JSON.parse(cleaned);
      }
    }

    const quiz = await Quiz.create({
      user: req.user.id,
      document: documentId || null,
      session: sessionId || null,
      title: `${contextTitle} Assessment Quiz`,
      description: `${questions.length}-question interactive assessment on ${contextTitle}`,
      questions
    });

    res.status(201).json({ success: true, quiz });
  } catch (error) {
    console.error('Quiz Generation Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate quiz' });
  }
};

const getQuizzes = async (req, res) => {
  try {
    const { documentId, sessionId } = req.query;
    const filter = { user: req.user.id };
    if (documentId) filter.document = documentId;
    if (sessionId) filter.session = sessionId;

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, quizzes });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve quizzes' });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user.id });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to retrieve quiz' });
  }
};

const submitQuizScore = async (req, res) => {
  try {
    const { score } = req.body;
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: { lastScore: score } },
      { new: true }
    );
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to record quiz score' });
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete quiz' });
  }
};

module.exports = {
  // Document Management
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  // Interactive Chat
  chatWithDocument,
  // Study Notes
  generateNotes,
  getNotes,
  updateNote,
  deleteNote,
  // Flashcards
  generateFlashcards,
  getFlashcardDecks,
  getFlashcardDeckById,
  toggleCardKnown,
  deleteFlashcardDeck,
  // Quizzes / MCQs
  generateQuiz,
  getQuizzes,
  getQuizById,
  submitQuizScore,
  deleteQuiz
};
