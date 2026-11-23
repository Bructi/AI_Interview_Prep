const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, updateUserProfile, uploadProfileImage, handleSupabaseOAuth } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/supabase-oauth', handleSupabaseOAuth);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/upload-image', protect, upload.single('profileImage'), uploadProfileImage);

module.exports = router;
