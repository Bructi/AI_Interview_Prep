const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  front: {
    type: String,
    required: true
  },
  back: {
    type: String,
    required: true
  },
  category: {
    type: String,
    default: 'General'
  },
  isKnown: {
    type: Boolean,
    default: false
  }
});

const flashcardDeckSchema = new mongoose.Schema({
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
  cards: {
    type: [cardSchema],
    default: []
  }
}, { timestamps: true });

flashcardDeckSchema.index({ user: 1, createdAt: -1 });
flashcardDeckSchema.index({ session: 1 });
flashcardDeckSchema.index({ document: 1 });

module.exports = mongoose.model('FlashcardDeck', flashcardDeckSchema);
