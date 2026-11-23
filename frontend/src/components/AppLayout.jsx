import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useUser } from '../context/UserContext';

const AppLayout = ({ onOpenLogin, onOpenSignup, onOpenCreateSession }) => {
  const { user } = useUser();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar
        onOpenLogin={onOpenLogin}
        onOpenSignup={onOpenSignup}
        onOpenCreateSession={onOpenCreateSession}
      />

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
