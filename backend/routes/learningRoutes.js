const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const documentUpload = require('../config/documentMulter');
const {
  // Document Management
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
  // Interactive Chat
  chatWithDocument,
  // Notes
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
} = require('../controllers/learningController');

// Document Endpoints
router.post('/documents/upload', protect, documentUpload.single('file'), uploadDocument);
router.get('/documents', protect, getDocuments);
router.get('/documents/:id', protect, getDocumentById);
router.delete('/documents/:id', protect, deleteDocument);

// Chat Endpoint
router.post('/chat', protect, chatWithDocument);

// Notes Endpoints
router.post('/notes/generate', protect, generateNotes);
router.get('/notes', protect, getNotes);
router.put('/notes/:id', protect, updateNote);
router.delete('/notes/:id', protect, deleteNote);

// Flashcards Endpoints
router.post('/flashcards/generate', protect, generateFlashcards);
router.get('/flashcards', protect, getFlashcardDecks);
router.get('/flashcards/:id', protect, getFlashcardDeckById);
router.put('/flashcards/:deckId/cards/:cardId/toggle', protect, toggleCardKnown);
router.delete('/flashcards/:id', protect, deleteFlashcardDeck);

// Quiz / MCQ Endpoints
router.post('/quizzes/generate', protect, generateQuiz);
router.get('/quizzes', protect, getQuizzes);
router.get('/quizzes/:id', protect, getQuizById);
router.put('/quizzes/:id/score', protect, submitQuizScore);
router.delete('/quizzes/:id', protect, deleteQuiz);

module.exports = router;
