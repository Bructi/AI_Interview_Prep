<div align="center">

```ascii
██╗  ██╗ ██████╗ ███╗   ██╗███████╗    ███████╗████████╗██╗   ██╗██████╗ ██╗ ██████╗ 
██║  ██║██╔═══██╗████╗  ██║██╔════╝    ██╔════╝╚══██╔══╝██║   ██║██╔══██╗██║██╔═══██╗
███████║██║   ██║██╔██╗ ██║█████╗      ███████╗   ██║   ██║   ██║██║  ██║██║██║   ██║
██╔══██║██║   ██║██║╚██╗██║██╔══╝      ╚════██║   ██║   ██║   ██║██║  ██║██║██║   ██║
██║  ██║╚██████╔╝██║ ╚████║███████╗    ███████║   ██║   ╚██████╔╝██████╔╝██║╚██████╔╝
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝    ╚══════╝   ╚═╝    ╚═════╝ ╚═════╝ ╚═╝ ╚═════╝ 
```

### *Authentic Technical Craft & Engineering Mastery — AI-Powered Interview Preparation Platform*

[![Vercel Deployment](https://img.shields.io/badge/Deployed%20with-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![React 19](https://img.shields.io/badge/React-19.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-8.9-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20Storage-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI_Engine-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini)

<p align="center">
  <b>Stop memorizing robotic buzzwords. Hone delivers realistic engineering interview simulations, document-grounded deep dives, and live multimodal voice/video assessments designed for staff-level conviction.</b>
</p>

[Explore Features](#-key-features) •
[Architecture](#-system-architecture) •
[Quickstart](#-quickstart--local-development) •
[Environment Configuration](#-environment-variables) •
[Vercel Deployment](#-deployment-guide) •
[Project Structure](#-project-structure)

---

</div>

## 🌟 Overview

**Hone Studio** is a full-stack, AI-native interview studio designed to help engineers, architects, and developers pass modern technical and behavioral interviews. Combining **Google Gemini AI**, real-time **WebRTC video/audio analysis**, and **Supabase authentication & storage**, Hone offers real-time conversational interviews, customized practice workspaces, document-driven learning hubs, and resume tailoring.

---

## 🚀 Key Features

### 🎙️ 1. Face-to-Face AI Mock Interview
* **Dual-Feed Interactive Interface:** Live AI Interviewer persona with reactive audio waveform visualization alongside your real-time webcam feed.
* **Smart WebRTC Negotiation:** Multi-tier camera constraint fallback (720p HD → 480p standard → 360p eco) to guarantee seamless performance on any hardware.
* **Audio-Only Graceful Fallback:** If camera access is denied or unavailable, the studio gracefully switches to an animated candidate avatar with real-time microphone frequency meters.
* **Hands-Free Speech Interaction:** Native Web Speech API integration for instant Text-to-Speech (TTS) interviewer questioning and Speech-to-Text (STT) answer transcription.
* **Multidimensional Scorecards:** Comprehensive post-interview evaluation measuring **Technical Depth**, **Communication**, **Confidence**, and **Pacing (0–100)** with actionable feedback and model answers.

---

### 📂 2. Interview Prep Workspaces
* **Tailored Session Generation:** Configure by target role (Frontend, Backend, Full-Stack, System Architect), seniority (Junior to Staff), tech stack, and focus area.
* **Scannable AI Question Cards:** Progressive disclosure UI highlighting:
  * **Core Concept:** 1-sentence fundamental invariant.
  * **Key Mechanisms:** Rapid bullet points of how it executes.
  * **Production Trade-offs:** Real-world failure modes and architectural considerations.
* **Voice Practice Mode:** Record and transcribe verbal answers directly in browser with AI-evaluated score receipts.

---

### 📚 3. Smart Learning Hub
* **PDF Document Ingestion:** Upload technical whitepapers, lecture slides, or design documents.
* **Smart Notes & Cheat Sheets:** Generates categorized, scannable summaries with syntax-highlighted code snippets.
* **Interactive Flashcards:** Interactive 3D flip card decks with mastery tracking.
* **AI Quiz Engine:** Generates instant multiple-choice assessments with contextual explanations.
* **Grounded Document Chat:** Query your uploaded documents with source-grounded answers.

---

### 📄 4. Resume Studio
* **ATS Compatibility & Scoring:** Evaluate your resume against target roles and receive instant benchmark scores.
* **Keyword Optimization:** Identify missing technical competencies, frameworks, and architecture patterns.
* **Impact Framing:** AI suggestions to transform passive bullet points into measurable, high-impact STAR accomplishments.

---

### 🎮 5. Gamification & Progression
* **XP & Leveling System:** Track sessions completed, questions conquered, and unlock titles (Junior Dev → Senior Architect).
* **Daily Streaks:** Streak tracking to build consistent daily interview prep habits.
* **PWA & Offline Capable:** Installable Progressive Web App with service worker caching (`sw.js`).

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client["React 19 + Vite 8 (PWA Frontend)"]
    API["Express.js Serverless API (Vercel Node)"]
    Gemini["Google Gemini 2.5 AI Engine"]
    MongoDB["MongoDB Atlas (Sessions, Questions, Notes)"]
    Supabase["Supabase (OAuth, Auth & Object Storage)"]

    Client -->|REST & Audio/Video Streams| API
    Client -->|OAuth & Session Tokens| Supabase
    API -->|Prompt Engineering & Grading| Gemini
    API -->|Document & Profile CRUD| MongoDB
    API -->|Profile Photos & Resumes| Supabase
```

---

## 💻 Tech Stack

### **Frontend**
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `v19.3.1` | Modern UI with concurrent rendering |
| **Vite** | `v8.3.6` | Next-generation bundler with instant HMR |
| **Tailwind CSS** | `v4.3.5` | Utility-first responsive design system |
| **Framer Motion** | `v14.14` | Fluid animations, 3D card flips & visual transitions |
| **Lucide Icons** | `v1.77` | Lightweight vector icon set |
| **React Router** | `v7.18` | Client-side routing with protected layout wrappers |
| **Axios** | `v1.21` | HTTP client with automatic token attachment |

### **Backend**
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js / Express** | `v4.21` | REST API with modular route controllers |
| **Google Gemini API** | `v0.21` | AI evaluation, question generation, and document chat |
| **Mongoose** | `v8.9.5` | Schema-based MongoDB ODM |
| **Multer** | `v1.4.5` | Memory-based serverless file uploads |
| **Compression & Rate Limit** | `v1.8` / `v8.7` | Production request security and payload optimization |
| **pdf-parse** | `v2.4.5` | Extraction and processing of uploaded PDF documents |

### **Cloud & Infrastructure**
* **Vercel:** Static build hosting for frontend + serverless functions for backend.
* **Supabase:** OAuth authentication (Google/GitHub) + S3-compatible cloud storage buckets.
* **MongoDB Atlas:** Managed multi-region cloud database.

---

## 🛠️ Quickstart & Local Development

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** or **yarn** / **pnpm**
* **MongoDB** (Local instance or MongoDB Atlas free cluster)
* **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))
* **Supabase Project** (from [Supabase](https://supabase.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/Bructi/AI_Interview_Prep.git
cd AI_Interview_Prep
```

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env
```
Fill in `.env` with your credentials:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
Start the backend development server:
```bash
npm run dev
```

### 3. Configure Frontend
Open a new terminal window:
```bash
cd frontend
npm install
cp .env.example .env
```
Fill in `.env` with your frontend parameters:
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_anon_key
```
Start the frontend development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `PORT` | Local server port | No | `5000` |
| `MONGO_URI` | MongoDB Atlas connection string | **Yes** | `mongodb+srv://user:pass@cluster.mongodb.net/prep` |
| `JWT_SECRET` | Secret key for signing session tokens | **Yes** | `super_secret_jwt_key_4837` |
| `GEMINI_API_KEY` | Google Gemini API key | **Yes** | `AIzaSy...` |
| `CLIENT_URL` | Allowed frontend origin for CORS | **Yes** | `http://localhost:5173` or production URL |
| `SUPABASE_URL` | Supabase project URL | **Yes** | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service key for bucket uploads | **Yes** | `eyJhbGciOi...` |

### Frontend (`frontend/.env`)
| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `VITE_API_URL` | Backend API URL (leave empty if same-origin) | **Yes** | `http://localhost:5000` or deployed backend URL |
| `VITE_SUPABASE_URL` | Supabase project URL | **Yes** | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase public anonymous key | **Yes** | `sb_publishable_...` |

---

## 🚀 Deployment Guide

This project is pre-configured for seamless zero-config deployment on **Vercel** with independent frontend and backend services:

### 1. Deploy Frontend on Vercel
1. Import repository on [Vercel Dashboard](https://vercel.com/new).
2. Set **Root Directory** to `frontend`.
3. Configure **Build Settings**:
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Add Environment Variables:
   * `VITE_API_URL` = *(Your deployed backend URL, e.g. `https://your-backend.vercel.app`)*
   * `VITE_SUPABASE_URL` = *(Your Supabase URL)*
   * `VITE_SUPABASE_PUBLISHABLE_KEY` = *(Your Supabase Publishable Key)*
5. Click **Deploy**.

### 2. Deploy Backend on Vercel
1. Import the same repository as a new Vercel project.
2. Set **Root Directory** to `backend`.
3. Vercel automatically detects `vercel.json` and configures `api/index.js` as a serverless function.
4. Add Environment Variables:
   * `MONGO_URI` = *(MongoDB Atlas connection string)*
   * `JWT_SECRET` = *(Secure random string)*
   * `GEMINI_API_KEY` = *(Google Gemini API Key)*
   * `CLIENT_URL` = *(Your deployed frontend Vercel domain)*
   * `SUPABASE_URL` = *(Your Supabase URL)*
   * `SUPABASE_SERVICE_ROLE_KEY` = *(Your Supabase Service Role Key)*
5. Click **Deploy**.

---

## 📂 Project Structure

```plaintext
AI_Interview_Prep/
├── backend/
│   ├── api/
│   │   └── index.js              # Serverless entrypoint for Vercel
│   ├── config/
│   │   ├── db.js                 # MongoDB connection handler
│   │   ├── multer.js             # In-memory image file upload configuration
│   │   └── documentMulter.js     # PDF memory upload configuration
│   ├── controllers/
│   │   ├── aiController.js       # Gemini AI prompt orchestration
│   │   ├── authController.js     # User registration, login, profile & OAuth
│   │   ├── learningController.js # Document parsing, notes, flashcards & quiz
│   │   ├── mockInterviewController.js # Face-to-Face live interview state machine
│   │   ├── questionController.js # Practice questions and answers
│   │   └── sessionController.js  # Workspace session management
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT verification middleware
│   ├── models/                   # Mongoose schemas (User, Session, Question, MockInterview, etc.)
│   ├── routes/                   # Express route definitions
│   ├── server.js                 # Express application initialization
│   └── vercel.json               # Backend serverless routing config
│
├── frontend/
│   ├── public/
│   │   ├── manifest.json         # PWA Manifest
│   │   └── sw.js                 # Service worker offline caching
│   ├── src/
│   │   ├── components/
│   │   │   ├── interview/        # WebcamFeed, AIAvatarWaveform, AudioVisualizer, Scorecard
│   │   │   ├── learning/         # DocumentChat, SmartNotesView, FlashcardDeckView, QuizView
│   │   │   ├── AppLayout.jsx     # Navigation shell for authenticated routes
│   │   │   ├── Navbar.jsx        # Navigation bar with XP and streak meters
│   │   │   ├── QnACard.jsx       # Scannable questions with bullet-point formatting
│   │   │   └── ...               # Login, Signup, Profile, and Session modals
│   │   ├── context/
│   │   │   └── UserContext.jsx   # Global auth state and user management
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Public landing page
│   │   │   ├── DashboardPage.jsx # Workspaces and session overview
│   │   │   ├── InterviewPrepPage.jsx # Active practice session with voice input
│   │   │   ├── MockInterviewPage.jsx # AI Face-to-Face interview simulator
│   │   │   ├── LearningHubPage.jsx   # Document-based smart learning studio
│   │   │   ├── ResumeStudioPage.jsx  # Resume ATS scanner and tailoring tool
│   │   │   └── ProfilePage.jsx       # User profile and stats
│   │   ├── utils/
│   │   │   ├── api.js            # Axios client with interceptors
│   │   │   ├── assetUrl.js       # Production asset URL resolver
│   │   │   ├── speech.js         # SpeechSynthesis & Web Speech STT helper
│   │   │   └── supabaseClient.js # Supabase JavaScript client
│   │   ├── App.jsx               # Application routes
│   │   ├── index.css             # Tailwind CSS v4 styling & dark theme
│   │   └── main.jsx              # React DOM mounting
│   ├── package.json
│   ├── vercel.json               # Frontend static routing and SPA rewrite
│   └── vite.config.js            # Vite 8 config
│
├── .gitignore                    # Git ignore rules for dependencies & secrets
└── README.md                     # Project documentation
```

---

## 🛡️ Security & Best Practices

* **Zero Secret Leakage:** `.env` and `.env.local` are strictly ignored by `.gitignore`.
* **Rate Limiting & Compression:** Express requests are protected by `express-rate-limit` (300 requests / 15 min window) and compressed via `compression`.
* **Serverless Read-Only Protection:** Memory storage (`multer.memoryStorage()`) prevents filesystem write failures on serverless runtimes like Vercel.
* **Input Validation & Sanitization:** All incoming requests are validated against required parameters and typed Mongoose schemas.
* **Separation of Concerns:** Protected routes are fully isolated behind `AppLayout`, keeping public landing flows independent from user session state.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — feel free to modify and build upon it.

<div align="center">
  <sub>Built with ❤️ for engineers pursuing technical excellence.</sub>
</div>
