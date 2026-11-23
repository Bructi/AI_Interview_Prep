const Session = require('../models/Session');
const Question = require('../models/Question');

const createSession = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, description } = req.body;
    if (!role || !experience) {
      return res.status(400).json({ success: false, message: 'Role and experience are required' });
    }

    const session = await Session.create({
      user: req.user._id,
      role,
      experience,
      topicsToFocus: topicsToFocus || [],
      description: description || ''
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSessionById = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const questions = await Question.find({ session: session._id }).sort({ isPinned: -1, createdAt: -1 });
    res.json({ success: true, session, questions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    await Question.deleteMany({ session: session._id });
    await Session.findByIdAndDelete(session._id);

    res.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createSession, getSessions, getSessionById, deleteSession };
