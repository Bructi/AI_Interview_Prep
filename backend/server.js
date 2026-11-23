const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const questionRoutes = require('./routes/questionRoutes');
const aiRoutes = require('./routes/aiRoutes');
const learningRoutes = require('./routes/learningRoutes');
const mockInterviewRoutes = require('./routes/mockInterviewRoutes');

const app = express();

// Connect to MongoDB
connectDB().catch(err => console.error('MongoDB initial connection error:', err));

// Middleware
app.use(compression());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Ensure DB connection for serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (e) {
    console.error('DB middleware connection error:', e);
  }
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/mock-interviews', mockInterviewRoutes);

app.get('/', (req, res) => {
  res.send('AI Interview Prep API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Only listen directly when not running on Vercel serverless
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
