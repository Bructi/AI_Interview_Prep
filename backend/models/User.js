const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImageUrl: { type: String, default: '' },
  title: { type: String, default: 'Senior Full-Stack Engineer' },
  bio: { type: String, default: 'Passionate engineer specialized in scalable cloud architectures, high-performance distributed systems, and real-time APIs.' },
  location: { type: String, default: 'San Francisco, CA' },
  skills: { type: [String], default: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Distributed Systems', 'Go', 'MongoDB'] },
  targetRole: { type: String, default: 'Senior Full-Stack Engineer' },
  experienceLevel: { type: String, default: 'Senior' },
  githubUrl: { type: String, default: 'https://github.com' },
  linkedinUrl: { type: String, default: 'https://linkedin.com' },
  portfolioUrl: { type: String, default: '' },
  themePreference: { type: String, default: 'dark' },
  streakCount: { type: Number, default: 7 },
  xp: { type: Number, default: 450 },
  level: { type: String, default: 'Senior Architect' },
  sessionsCompleted: { type: Number, default: 4 },
  questionsAnswered: { type: Number, default: 28 },
  lastActiveDate: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
