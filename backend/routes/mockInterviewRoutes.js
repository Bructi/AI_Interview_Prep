const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  startMockInterview,
  getMockInterview,
  submitAnswer
} = require('../controllers/mockInterviewController');

router.post('/start', protect, startMockInterview);
router.get('/:id', protect, getMockInterview);
router.post('/:id/answer', protect, submitAnswer);

module.exports = router;
