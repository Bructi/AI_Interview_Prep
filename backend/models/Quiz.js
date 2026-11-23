const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true
  },
  correctAnswerIndex: {
    type: Number,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  }
});

const quizSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  questions: {
    type: [quizQuestionSchema],
    default: []
  },
  lastScore: {
    type: Number,
    default: null
  }
}, { timestamps: true });

quizSchema.index({ user: 1, createdAt: -1 });
quizSchema.index({ session: 1 });
quizSchema.index({ document: 1 });

module.exports = mongoose.model('Quiz', quizSchema);
