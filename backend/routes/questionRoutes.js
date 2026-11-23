const express = require('express');
const router = express.Router();
const { addQuestion, addBulkQuestions, togglePinQuestion } = require('../controllers/questionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add', protect, addQuestion);
router.post('/add-bulk', protect, addBulkQuestions);
router.put('/:id/pin', protect, togglePinQuestion);

module.exports = router;
