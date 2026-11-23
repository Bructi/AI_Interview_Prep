import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import LearningHubPage from './pages/LearningHubPage';
import ResumeStudioPage from './pages/ResumeStudioPage';
import ProfilePage from './pages/ProfilePage';
import MockInterviewPage from './pages/MockInterviewPage';
import AppLayout from './components/AppLayout';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';

// Ensure Supabase client is initialized
import './utils/supabaseClient';

const ProtectedRoute = ({ children }) => {
  const { user } = useUser();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        element={<AppLayout onOpenLogin={() => {}} onOpenSignup={() => {}} />}
      >
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prep/:id"
          element={
            <ProtectedRoute>
              <InterviewPrepPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning"
          element={
            <ProtectedRoute>
              <LearningHubPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mock-interview"
          element={
            <ProtectedRoute>
              <MockInterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <ResumeStudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </UserProvider>
  );
}
