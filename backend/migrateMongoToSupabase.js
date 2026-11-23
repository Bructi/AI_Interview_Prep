/**
 * Data Migration Script: MongoDB -> Supabase
 * Usage: node migrateMongoToSupabase.js
 */
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iynwnntruwtdozsgjjbc.supabase.co';
// Secret service_role key or publishable key
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_HgSOlMPOKzRnk1nZUKaWpw_g50MCGxC';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Mapping from Mongo ObjectIds to Supabase UUIDs
const idMap = new Map();

function mongoIdToUuid(mongoId) {
  if (!mongoId) return null;
  const str = mongoId.toString();
  if (idMap.has(str)) return idMap.get(str);
  // Deterministic 32-char hex from 24-char ObjectId
  const hex = str.padStart(32, '0');
  const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  idMap.set(str, uuid);
  return uuid;
}

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interview-prep');
  console.log('MongoDB Connected.');

  const db = mongoose.connection.db;

  // 1. Export & Migrate Users
  const users = await db.collection('users').find({}).toArray();
  console.log(`Found ${users.length} users in MongoDB.`);

  for (const user of users) {
    const userUuid = mongoIdToUuid(user._id);
    console.log(`Processing user: ${user.name} (${user.email}) -> UUID ${userUuid}`);

    // If using Service Role Key, we can create or invite auth user
    // Otherwise, we insert into public.user_profiles directly if tables exist
    const profileData = {
      id: userUuid,
      name: user.name,
      email: user.email,
      profile_image_url: user.profileImageUrl || '',
      title: user.title || 'Senior Full-Stack Engineer',
      bio: user.bio || '',
      location: user.location || 'San Francisco, CA',
      skills: user.skills || [],
      target_role: user.targetRole || 'Senior Full-Stack Engineer',
      experience_level: user.experienceLevel || 'Senior',
      github_url: user.githubUrl || '',
      linkedin_url: user.linkedinUrl || '',
      portfolio_url: user.portfolioUrl || '',
      theme_preference: user.themePreference || 'dark',
      streak_count: user.streakCount || 7,
      xp: user.xp || 450,
      level: user.level || 'Senior Architect',
      sessions_completed: user.sessionsCompleted || 0,
      questions_answered: user.questionsAnswered || 0,
      last_active_date: user.lastActiveDate || new Date(),
      created_at: user.createdAt || new Date(),
      updated_at: user.updatedAt || new Date()
    };

    const { error } = await supabase.from('user_profiles').upsert(profileData);
    if (error) {
      console.warn(`Could not upsert profile for ${user.email}:`, error.message);
    } else {
      console.log(`User profile for ${user.email} synced.`);
    }
  }

  // 2. Export & Migrate Sessions
  const sessions = await db.collection('sessions').find({}).toArray();
  console.log(`Found ${sessions.length} sessions.`);
  for (const session of sessions) {
    const sessionData = {
      id: mongoIdToUuid(session._id),
      user_id: mongoIdToUuid(session.user),
      role: session.role,
      experience: session.experience,
      topics_to_focus: session.topicsToFocus || [],
      description: session.description || '',
      created_at: session.createdAt || new Date(),
      updated_at: session.updatedAt || new Date()
    };

    const { error } = await supabase.from('sessions').upsert(sessionData);
    if (error) {
      console.warn(`Could not upsert session ${session._id}:`, error.message);
    } else {
      console.log(`Session ${session.role} synced.`);
    }
  }

  // 3. Export & Migrate Questions
  const questions = await db.collection('questions').find({}).toArray();
  console.log(`Found ${questions.length} questions.`);
  for (const q of questions) {
    const qData = {
      id: mongoIdToUuid(q._id),
      session_id: mongoIdToUuid(q.session),
      question: q.question,
      answer: q.answer || '',
      is_pinned: !!q.isPinned,
      note: q.note || '',
      created_at: q.createdAt || new Date(),
      updated_at: q.updatedAt || new Date()
    };

    const { error } = await supabase.from('questions').upsert(qData);
    if (error) {
      console.warn(`Could not upsert question:`, error.message);
    }
  }

  // 4. Migrate Uploaded Documents & PDF File to Supabase Storage
  const documents = await db.collection('documents').find({}).toArray();
  console.log(`Found ${documents.length} documents.`);
  for (const doc of documents) {
    let storagePath = doc.filePath;
    // Check if local file exists to upload to Supabase Storage
    const localFilePath = path.isAbsolute(doc.filePath)
      ? doc.filePath
      : path.join(__dirname, doc.filePath);

    if (fs.existsSync(localFilePath)) {
      console.log(`Uploading file to Supabase storage bucket 'documents': ${doc.fileName}`);
      const fileBuffer = fs.readFileSync(localFilePath);
      const { data: storageUpload, error: storageErr } = await supabase.storage
        .from('documents')
        .upload(doc.fileName, fileBuffer, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (storageErr) {
        console.warn(`Storage upload warning:`, storageErr.message);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('documents')
          .getPublicUrl(doc.fileName);
        storagePath = publicUrlData?.publicUrl || doc.fileName;
        console.log(`File uploaded successfully to: ${storagePath}`);
      }
    }

    const docData = {
      id: mongoIdToUuid(doc._id),
      user_id: mongoIdToUuid(doc.user),
      title: doc.title,
      original_name: doc.originalName,
      file_name: doc.fileName,
      file_path: storagePath,
      file_type: doc.fileType || 'pdf',
      file_size: doc.fileSize || 0,
      text_content: doc.textContent || '',
      summary: doc.summary || '',
      page_count: doc.pageCount || 1,
      created_at: doc.createdAt || new Date(),
      updated_at: doc.updatedAt || new Date()
    };

    const { error } = await supabase.from('documents').upsert(docData);
    if (error) {
      console.warn(`Could not upsert document record:`, error.message);
    }
  }

  // 5. Migrate Notes
  const notes = await db.collection('notes').find({}).toArray();
  console.log(`Found ${notes.length} notes.`);
  for (const note of notes) {
    const noteData = {
      id: mongoIdToUuid(note._id),
      user_id: mongoIdToUuid(note.user),
      document_id: mongoIdToUuid(note.documentId),
      session_id: mongoIdToUuid(note.sessionId),
      title: note.title,
      content: note.content,
      tags: note.tags || [],
      created_at: note.createdAt || new Date(),
      updated_at: note.updatedAt || new Date()
    };
    await supabase.from('notes').upsert(noteData);
  }

  // 6. Migrate Flashcard Decks
  const decks = await db.collection('flashcarddecks').find({}).toArray();
  console.log(`Found ${decks.length} flashcard decks.`);
  for (const deck of decks) {
    const deckData = {
      id: mongoIdToUuid(deck._id),
      user_id: mongoIdToUuid(deck.user),
      document_id: mongoIdToUuid(deck.documentId),
      session_id: mongoIdToUuid(deck.sessionId),
      title: deck.title,
      cards: deck.cards || [],
      created_at: deck.createdAt || new Date(),
      updated_at: deck.updatedAt || new Date()
    };
    await supabase.from('flashcard_decks').upsert(deckData);
  }

  // 7. Migrate Quizzes
  const quizzes = await db.collection('quizzes').find({}).toArray();
  console.log(`Found ${quizzes.length} quizzes.`);
  for (const quiz of quizzes) {
    const quizData = {
      id: mongoIdToUuid(quiz._id),
      user_id: mongoIdToUuid(quiz.user),
      document_id: mongoIdToUuid(quiz.documentId),
      session_id: mongoIdToUuid(quiz.sessionId),
      title: quiz.title,
      questions: quiz.questions || [],
      created_at: quiz.createdAt || new Date(),
      updated_at: quiz.updatedAt || new Date()
    };
    await supabase.from('quizzes').upsert(quizData);
  }

  console.log('Migration process completed.');
  await mongoose.disconnect();
}

migrate().catch(console.error);
