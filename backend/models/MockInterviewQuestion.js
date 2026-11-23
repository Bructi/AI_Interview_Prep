const mongoose = require('mongoose');

const mockInterviewQuestionSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'MockInterview', required: true },
  index: { type: Number, required: true },
  question: { type: String, required: true },
  estimatedTime: { type: Number, default: 60 }, // Seconds allocated for question

  // AI Interviewer persona prompt anchor
  interviewerIntro: { type: String },

  // Candidate answer & scoring
  candidateTranscript: { type: String, default: '' },
  answerFeedback: {
    score: { type: Number, default: 0 }, // 1-10
    strengths: [String],
    areasForImprovement: [String],
    modelAnswerSnippet: String,
    fillerWordsCount: { type: Number, default: 0 }
  },
  duration: { type: Number, default: 0 } // Actual seconds taken
});

module.exports = mongoose.model('MockInterviewQuestion', mockInterviewQuestionSchema);
