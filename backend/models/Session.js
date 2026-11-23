const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },
  experience: { type: String, required: true },
  topicsToFocus: { type: [String], default: [] },
  description: { type: String, default: '' }
}, { timestamps: true });

sessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
