const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  profileImageUrl: user.profileImageUrl || '',
  title: user.title || 'Senior Full-Stack Engineer',
  bio: user.bio || '',
  location: user.location || '',
  skills: user.skills || [],
  targetRole: user.targetRole || 'Senior Software Engineer',
  experienceLevel: user.experienceLevel || 'Senior',
  githubUrl: user.githubUrl || '',
  linkedinUrl: user.linkedinUrl || '',
  portfolioUrl: user.portfolioUrl || '',
  themePreference: user.themePreference || 'dark',
  streakCount: user.streakCount || 7,
  xp: user.xp || 450,
  level: user.level || 'Senior Architect',
  sessionsCompleted: user.sessionsCompleted || 4,
  questionsAnswered: user.questionsAnswered || 28,
  createdAt: user.createdAt
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    if (user) {
      res.status(201).json({
        success: true,
        accessToken: generateToken(user._id),
        user: formatUserResponse(user)
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.json({
        success: true,
        accessToken: generateToken(user._id),
        user: formatUserResponse(user)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json({ success: true, user: formatUserResponse(user) });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      name,
      email,
      title,
      bio,
      location,
      skills,
      targetRole,
      experienceLevel,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      profileImageUrl,
      currentPassword,
      newPassword
    } = req.body;

    if (name) user.name = name.trim();
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email is already used by another account' });
      }
      user.email = email.trim();
    }

    if (title !== undefined) user.title = title;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (targetRole !== undefined) user.targetRole = targetRole;
    if (experienceLevel !== undefined) user.experienceLevel = experienceLevel;
    if (githubUrl !== undefined) user.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
    if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;
    if (profileImageUrl !== undefined) user.profileImageUrl = profileImageUrl;

    if (skills !== undefined) {
      if (Array.isArray(skills)) {
        user.skills = skills.map(s => String(s).trim()).filter(Boolean);
      } else if (typeof skills === 'string') {
        user.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    // Optional password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      }
      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update user profile' });
  }
};

const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
);

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    let profileImageUrl = '';
    // Upload to Supabase Storage (works on serverless/read-only filesystem)
    if (supabaseAdmin && process.env.SUPABASE_URL) {
      const fileExt = req.file.originalname.split('.').pop();
      const fileName = `profile-${req.user._id}-${Date.now()}.${fileExt}`;
      const { data, error } = await supabaseAdmin.storage
        .from('documents')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true
        });
      if (!error && data) {
        const { data: pubData } = supabaseAdmin.storage
          .from('documents')
          .getPublicUrl(fileName);
        profileImageUrl = pubData?.publicUrl || '';
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImageUrl },
      { new: true }
    ).select('-password');

    res.json({ success: true, user: formatUserResponse(user), profileImageUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleSupabaseOAuth = async (req, res) => {
  try {
    const { email, name, profileImageUrl, supabaseId } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required from OAuth provider' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      // Create user if first time logging in with OAuth
      const randomPassword = Math.random().toString(36).slice(-12) + 'A1!';
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        profileImageUrl: profileImageUrl || '',
      });
    } else if (profileImageUrl && !user.profileImageUrl) {
      user.profileImageUrl = profileImageUrl;
      await user.save();
    }

    res.json({
      success: true,
      accessToken: generateToken(user._id),
      user: formatUserResponse(user)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  handleSupabaseOAuth
};
