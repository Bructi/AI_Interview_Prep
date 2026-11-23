const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, required: true },          // e.g. 'Frontend Engineer', 'System Architect'
  level: { type: String, required: true },         // e.g. 'Junior', 'Mid', 'Senior', 'Lead/Architect'
  techStack: [String],                              // e.g. ['React', 'Node.js', 'TypeScript']
  questionCount: { type: Number, default: 5 },
  difficulty: { type: String, default: 'intermediate' },

  // Session state machine
  status: { type: String, enum: ['SETUP', 'IN_PROGRESS', 'COMPLETED'], default: 'SETUP' },
  currentQuestionIndex: { type: Number, default: 0 },
  startTime: { type: Date },
  endTime: { type: Date },

  // AI Interviewer Persona
  interviewerName: { type: String, default: 'Alex (Principal Architect)' },
  interviewerTone: { type: String, default: 'Professional & Encouraging' },

  // Questions reference
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MockInterviewQuestion' }],

  // Artifacts & Final Scorecard
  audioRecordingUrl: { type: String },
  overallScore: { type: Number, default: 0 }, // 1-100
  scoreBreakdown: {
    technicalDepth: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidencePacing: { type: Number, default: 0 }
  },
  feedbackReport: { type: String, default: '' } // Markdown executive summary
}, { timestamps: true });

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
