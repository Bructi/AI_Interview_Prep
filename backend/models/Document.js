const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    default: 'pdf'
  },
  fileSize: {
    type: Number,
    default: 0
  },
  textContent: {
    type: String,
    default: ''
  },
  summary: {
    type: String,
    default: ''
  },
  pageCount: {
    type: Number,
    default: 1
  },
  suggestedQuestions: {
    type: [String],
    default: []
  }
}, { timestamps: true });

documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
