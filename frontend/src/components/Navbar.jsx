import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import ProfileModal from './ProfileModal';
import { getAssetUrl } from '../utils/assetUrl';
import {
  Sparkles,
  LogOut,
  Menu,
  X,
  Plus,
  BookOpen,
  Layers,
  Flame,
  Zap,
  FileText,
  User,
  ChevronDown,
  Edit3
} from 'lucide-react';

const Navbar = ({ onOpenLogin, onOpenSignup, onOpenCreateSession }) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isCurrent = (path) => location.pathname === path;

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 transition-colors shadow-lg shadow-black/20 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-pink-200 bg-clip-text text-transparent group-hover:from-pink-300 group-hover:to-indigo-300 transition-all">
                Hone
              </span>
              <span className="font-mono text-[9px] font-bold tracking-widest text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                STUDIO
              </span>
            </div>
          </Link>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* Gamified Streak & XP Indicator */}
                <div className="flex items-center gap-2 mr-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono">
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-pulse" />
                    <span>{user.streakCount || 7}d streak</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center gap-1 text-indigo-400 font-semibold">
                    <Zap className="w-3 h-3 text-indigo-400" />
                    <span>{user.xp || 450} XP</span>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    isCurrent('/dashboard')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Workspaces
                </Link>

                <Link
                  to="/learning"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    isCurrent('/learning')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  Learning Hub
                </Link>

                <Link
                  to="/mock-interview"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    isCurrent('/mock-interview')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  AI Face-to-Face Interview
                </Link>

                <Link
                  to="/resume"
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    isCurrent('/resume')
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-purple-400" />
                  Resume Studio
                </Link>

                {onOpenCreateSession && (
                  <button
                    onClick={onOpenCreateSession}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs ml-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Session
                  </button>
                )}

                <div className="h-4 w-px bg-slate-800 mx-1.5" />

                {/* User Profile Pill & Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-850 transition-all cursor-pointer group"
                    title="Profile & Settings"
                  >
                    {user.profileImageUrl ? (
                      <img
                        src={
                          user.profileImageUrl.startsWith('http')
                            ? user.profileImageUrl
                            : getAssetUrl(user.profileImageUrl)
                        }
                        alt={user.name}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-700 shadow-2xs group-hover:border-indigo-500 transition-colors"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono font-bold text-xs border border-indigo-500/30 group-hover:border-indigo-500 transition-colors">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                      {user.name}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform ${
                        profileDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 flex flex-col gap-2.5 animate-fadeIn text-slate-200">
                      {/* User Header */}
                      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center overflow-hidden shrink-0">
                          {user.profileImageUrl ? (
                            <img
                              src={
                                user.profileImageUrl.startsWith('http')
                                  ? user.profileImageUrl
                                  : getAssetUrl(user.profileImageUrl)
                              }
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-extrabold text-base text-indigo-300 font-mono">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </span>
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-400 truncate font-mono">{user.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                              {user.level || 'Senior Architect'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Actions */}
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setIsProfileModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-500/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-xl transition-all cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4 text-indigo-400" />
                          <span>Edit Profile &amp; Settings</span>
                        </button>

                        <Link
                          to="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>View Public Profile</span>
                        </Link>

                        <Link
                          to="/resume"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
                        >
                          <FileText className="w-4 h-4 text-purple-400" />
                          <span>Resume Studio</span>
                        </Link>

                        <Link
                          to="/learning"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
                        >
                          <BookOpen className="w-4 h-4 text-indigo-400" />
                          <span>Learning Hub</span>
                        </Link>
                      </div>

                      {/* Sign Out */}
                      <div className="pt-1.5 border-t border-slate-800/80">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="text-xs font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={onOpenSignup}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all cursor-pointer shadow-md shadow-indigo-600/30"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-4 flex flex-col gap-2">
          {user ? (
            <>
              <div className="flex items-center justify-between py-2 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  {user.profileImageUrl ? (
                    <img
                      src={
                        user.profileImageUrl.startsWith('http')
                          ? user.profileImageUrl
                          : getAssetUrl(user.profileImageUrl)
                      }
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700 shadow-2xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-mono font-bold text-xs border border-indigo-500/30">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{user.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="px-2.5 py-1 bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-semibold"
                >
                  Edit Profile
                </button>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-slate-300 py-2 hover:text-indigo-400"
              >
                Workspaces
              </Link>
              <Link
                to="/learning"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-slate-300 py-2 hover:text-indigo-400"
              >
                Learning Hub
              </Link>
              <Link
                to="/resume"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-slate-300 py-2 hover:text-indigo-400"
              >
                Resume Studio
              </Link>
              {onOpenCreateSession && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenCreateSession();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Session
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center justify-center gap-2 text-rose-400 hover:bg-rose-500/10 text-xs font-medium py-2 rounded-lg border border-rose-500/30 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full py-2 text-xs font-medium text-slate-300 border border-slate-800 rounded-lg"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSignup();
                }}
                className="w-full py-2 text-xs font-bold bg-indigo-600 text-white rounded-lg"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}

      {/* Interactive Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;

