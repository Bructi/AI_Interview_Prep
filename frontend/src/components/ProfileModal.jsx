import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import api from '../utils/api';
import { getAssetUrl } from '../utils/assetUrl';
import toast from 'react-hot-toast';
import {
  X,
  User,
  Mail,
  Briefcase,
  MapPin,
  Sparkles,
  Camera,
  Check,
  Globe,
  Key,
  Flame,
  Zap,
  Award,
  Layers,
  HelpCircle,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldCheck,
  Code
} from 'lucide-react';

const GithubIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const LinkedinIcon = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.77a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
  </svg>
);

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
];

const SUGGESTED_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Go',
  'Python',
  'Docker',
  'Kubernetes',
  'MongoDB',
  'PostgreSQL',
  'Redis',
  'Kafka',
  'AWS',
  'GraphQL',
  'System Design'
];

const SENIORITY_LEVELS = [
  'Junior (0-2 yrs)',
  'Mid-Level (2-5 yrs)',
  'Senior (5-8 yrs)',
  'Staff / Lead (8-12 yrs)',
  'Principal Architect (12+ yrs)'
];

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useUser();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'bio' | 'skills' | 'links' | 'security' | 'stats'
  const [saving, setSaving] = useState(false);
  const [polishingBio, setPolishingBio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    bio: '',
    location: '',
    skills: [],
    targetRole: '',
    experienceLevel: 'Senior',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    profileImageUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sync user state on open
  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        title: user.title || 'Senior Full-Stack Engineer',
        bio:
          user.bio ||
          'Passionate engineer specialized in scalable cloud architectures, high-performance distributed systems, and real-time APIs.',
        location: user.location || 'San Francisco, CA',
        skills: Array.isArray(user.skills) && user.skills.length > 0
          ? user.skills
          : ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Distributed Systems'],
        targetRole: user.targetRole || 'Senior Software Engineer',
        experienceLevel: user.experienceLevel || 'Senior',
        githubUrl: user.githubUrl || 'https://github.com',
        linkedinUrl: user.linkedinUrl || 'https://linkedin.com',
        portfolioUrl: user.portfolioUrl || '',
        profileImageUrl: user.profileImageUrl || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // Handle image upload from computer
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const data = new FormData();
      data.append('profileImage', file);

      const res = await api.put('/auth/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        setFormData((prev) => ({ ...prev, profileImageUrl: res.data.profileImageUrl }));
        if (res.data.user) {
          updateUser(res.data.user);
        }
        toast.success('Profile photo updated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  // Select preset avatar
  const handleSelectPresetAvatar = (url) => {
    setFormData((prev) => ({ ...prev, profileImageUrl: url }));
  };

  // AI Polish Bio
  const handlePolishBio = async () => {
    try {
      setPolishingBio(true);
      const res = await api.post('/ai/enhance-resume', {
        action: 'generate-summary',
        context: {
          title: formData.title,
          skills: formData.skills.join(', '),
          experience: formData.experienceLevel
        }
      });

      if (res.data.success && res.data.result) {
        setFormData((prev) => ({ ...prev, bio: res.data.result }));
        toast.success('Bio enhanced with AI!');
      }
    } catch (err) {
      toast.error('Failed to enhance bio with AI');
    } finally {
      setPolishingBio(false);
    }
  };

  // Skills management
  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove)
    }));
  };

  // Save profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (!formData.currentPassword) {
        toast.error('Current password is required to change password');
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        title: formData.title,
        bio: formData.bio,
        location: formData.location,
        skills: formData.skills,
        targetRole: formData.targetRole,
        experienceLevel: formData.experienceLevel,
        githubUrl: formData.githubUrl,
        linkedinUrl: formData.linkedinUrl,
        portfolioUrl: formData.portfolioUrl,
        profileImageUrl: formData.profileImageUrl
      };

      if (formData.newPassword) {
        payload.currentPassword = formData.currentPassword;
        payload.newPassword = formData.newPassword;
      }

      const res = await api.put('/auth/profile', payload);

      if (res.data.success) {
        updateUser(res.data.user);
        toast.success('Profile saved successfully!');
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = formData.profileImageUrl
    ? formData.profileImageUrl.startsWith('http')
      ? formData.profileImageUrl
      : getAssetUrl(formData.profileImageUrl)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header with Visual Banner */}
        <div className="relative bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 p-6 pb-4 border-b border-slate-800/80 flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar with Upload Hover Button */}
            <div className="relative group">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-indigo-600/30 border-2 border-indigo-500/60 flex items-center justify-center overflow-hidden shadow-lg">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-extrabold text-2xl text-indigo-300 font-mono">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                title="Upload Photo"
                className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-semibold"
              >
                {uploadingImage ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Change</span>
                  </>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* User Meta Information */}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {formData.name || 'Engineer Profile'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] font-bold">
                  {user?.level || 'Senior Architect'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{formData.title || 'Engineering Workspace'}</p>

              {/* Stats badges */}
              <div className="flex items-center gap-3 mt-2 text-xs font-mono">
                <span className="flex items-center gap-1 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {user?.streakCount || 7}d streak
                </span>
                <span className="flex items-center gap-1 text-indigo-400 font-semibold bg-indigo-400/10 px-2 py-0.5 rounded-md border border-indigo-400/20">
                  <Zap className="w-3 h-3" />
                  {user?.xp || 450} XP
                </span>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-1 border-b border-slate-800 bg-slate-950/40 overflow-x-auto scrollbar-none">
          {[
            { id: 'general', label: 'General Info', icon: User },
            { id: 'bio', label: 'Bio & Pitch', icon: Sparkles },
            { id: 'skills', label: 'Tech Stack', icon: Code },
            { id: 'links', label: 'Socials & Portfolio', icon: Globe },
            { id: 'stats', label: 'Badges & Stats', icon: Award },
            { id: 'security', label: 'Security', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* TAB 1: General Info */}
          {activeTab === 'general' && (
            <div className="flex flex-col gap-5">
              {/* Preset Avatars Row */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <label className="block text-xs font-bold text-slate-300 mb-2.5">
                  Choose an Avatar Preset or Upload Your Own
                </label>
                <div className="flex items-center gap-3">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(url)}
                      className={`relative w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        formData.profileImageUrl === url
                          ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-105'
                          : 'border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      {formData.profileImageUrl === url && (
                        <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-11 px-3 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/60 text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Upload
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Aniket Dhoke"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Professional Headline / Title</label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Senior Full-Stack & Distributed Systems Engineer"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. San Francisco, CA / Remote"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Seniority &amp; Experience Level</label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 transition-all cursor-pointer"
                  >
                    {SENIORITY_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl.split(' ')[0]}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Primary Target Role</label>
                  <input
                    type="text"
                    value={formData.targetRole}
                    onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    placeholder="e.g. Principal Architect / Staff Backend"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Bio & AI Elevator Pitch */}
          {activeTab === 'bio' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-200">
                    Professional Bio &amp; Elevator Pitch
                  </label>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This summary is used across your interview simulations and resume maker.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePolishBio}
                  disabled={polishingBio}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {polishingBio ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  )}
                  <span>AI Polish Bio</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Write a concise overview of your technical background, specialties, and impact..."
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-slate-100 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed transition-all"
              />

              <div className="p-4 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-200/90 leading-relaxed">
                  <strong>Pro Tip:</strong> Click <em>AI Polish Bio</em> to auto-craft an impact-driven pitch tailored to your target title and competencies using the Google X-Y-Z formula.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Tech Stack & Competencies */}
          {activeTab === 'skills' && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5">
                  Your Core Technical Stack
                </label>
                <p className="text-[11px] text-slate-400 mb-3">
                  These technologies customize your interview assessment questions and learning decks.
                </p>

                {/* Input with Add button */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(skillInput);
                      }
                    }}
                    placeholder="Type technology name (e.g. Redis, Go, Kubernetes)..."
                    className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(skillInput)}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>

              {/* Active Skill Chips */}
              <div>
                <label className="block text-[11px] font-mono text-slate-500 font-bold uppercase mb-2">
                  Active Competencies ({formData.skills.length})
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-semibold"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-indigo-400 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <p className="text-xs text-slate-500 italic">No skills added yet.</p>
                  )}
                </div>
              </div>

              {/* Suggested Skills */}
              <div className="pt-3 border-t border-slate-800/80">
                <label className="block text-[11px] font-mono text-slate-500 font-bold uppercase mb-2">
                  Recommended Industry Skills (Click to Add)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SKILLS.filter((s) => !formData.skills.includes(s)).map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleAddSkill(skill)}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-200 text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-slate-500" />
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Socials & Portfolio */}
          {activeTab === 'links' && (
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">GitHub Profile URL</label>
                <div className="relative">
                  <GithubIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">LinkedIn Profile URL</label>
                <div className="relative">
                  <LinkedinIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Personal Portfolio / Website</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    placeholder="https://yourdomain.dev"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Badges & Gamification Stats */}
          {activeTab === 'stats' && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
                  <Flame className="w-6 h-6 text-amber-400 fill-amber-400 mb-1 animate-pulse" />
                  <span className="text-xl font-extrabold text-white">{user?.streakCount || 7}</span>
                  <span className="text-[11px] text-slate-400 font-medium">Day Streak</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
                  <Zap className="w-6 h-6 text-indigo-400 mb-1" />
                  <span className="text-xl font-extrabold text-white">{user?.xp || 450}</span>
                  <span className="text-[11px] text-slate-400 font-medium">Engineer XP</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
                  <Layers className="w-6 h-6 text-purple-400 mb-1" />
                  <span className="text-xl font-extrabold text-white">{user?.sessionsCompleted || 4}</span>
                  <span className="text-[11px] text-slate-400 font-medium">Workspaces</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center">
                  <Award className="w-6 h-6 text-emerald-400 mb-1" />
                  <span className="text-xl font-extrabold text-white">{user?.questionsAnswered || 28}</span>
                  <span className="text-[11px] text-slate-400 font-medium">Evaluations</span>
                </div>
              </div>

              {/* Rank Progress Bar */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-200">Architect Rank Tier</span>
                  <span className="font-mono text-indigo-400 font-semibold">{user?.level || 'Senior Architect'}</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: '68%' }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Current: 450 XP</span>
                  <span>Next: Principal Architect (600 XP)</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Security & Password */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
                <h3 className="text-xs font-bold text-slate-200 mb-1">Change Account Password</h3>
                <p className="text-[11px] text-slate-400 mb-4">
                  Leave these fields blank if you do not wish to change your current password.
                </p>

                <div className="flex flex-col gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.newPassword}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        placeholder="Re-type new password"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none text-slate-100 placeholder-slate-600 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-indigo-600/30 disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
