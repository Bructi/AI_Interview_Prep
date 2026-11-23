const Question = require('../models/Question');
const Session = require('../models/Session');

const addQuestion = async (req, res) => {
  try {
    const { sessionId, question, answer, note } = req.body;
    if (!sessionId || !question) {
      return res.status(400).json({ success: false, message: 'Session ID and question are required' });
    }

    const session = await Session.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const newQuestion = await Question.create({
      session: sessionId,
      question,
      answer: answer || '',
      note: note || ''
    });

    res.status(201).json({ success: true, question: newQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addBulkQuestions = async (req, res) => {
  try {
    const { sessionId, questions } = req.body;
    if (!sessionId || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Session ID and questions array are required' });
    }

    const session = await Session.findOne({ _id: sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const docs = questions.map((q) => ({
      session: sessionId,
      question: q.question,
      answer: q.answer || '',
      note: q.note || ''
    }));

    const inserted = await Question.insertMany(docs);
    res.status(201).json({ success: true, questions: inserted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const togglePinQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate('session');
    if (!question || question.session.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    question.isPinned = !question.isPinned;
    await question.save();

    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addQuestion, addBulkQuestions, togglePinQuestion };
