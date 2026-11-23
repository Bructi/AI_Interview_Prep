const express = require('express');
const router = express.Router();
const { generateInterviewQuestions, generateConceptExplanation, enhanceResume } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-questions', protect, generateInterviewQuestions);
router.post('/generate-explanation', protect, generateConceptExplanation);
router.post('/enhance-resume', protect, enhanceResume);

module.exports = router;
