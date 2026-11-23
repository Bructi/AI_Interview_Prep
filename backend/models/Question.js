const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  isPinned: { type: Boolean, default: false },
  note: { type: String, default: '' }
}, { timestamps: true });

questionSchema.index({ session: 1, isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);
