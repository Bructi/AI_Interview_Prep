import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import {
  FileText,
  Sparkles,
  Printer,
  Copy,
  Plus,
  Trash2,
  Sliders,
  Briefcase,
  GraduationCap,
  Code,
  User,
  RefreshCw,
  Eye,
  Wand2,
  Check,
  FolderOpen
} from 'lucide-react';

const ResumeStudioPage = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('content'); // 'content' | 'formatting'
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Resume State
  const [resumeData, setResumeData] = useState({
    personal: {
      name: user?.name || 'Aniket Dhoke',
      title: 'Senior Full-Stack & Distributed Systems Engineer',
      email: user?.email || 'aniketdhoke092@gmail.com',
      phone: '+1 (555) 234-8900',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/aniketdhoke',
      github: 'github.com/aniketdhoke',
      portfolio: 'aniketdhoke.dev'
    },
    summary:
      'Results-driven Senior Software Engineer with 6+ years of expertise designing high-throughput microservices, distributed caching layers, and resilient cloud architectures. Proven track record of reducing p99 API latency by 45% and scaling database query performance across high-write workloads.',
    experience: [
      {
        id: '1',
        company: 'CloudScale Systems',
        role: 'Senior Backend Engineer',
        location: 'San Francisco, CA',
        startDate: 'Jan 2022',
        endDate: 'Present',
        bullets: [
          'Architected real-time event ingestion pipeline processing 12,000+ RPS using Kafka and Go microservices, maintaining 99.99% system availability.',
          'Reduced MySQL p99 query latency by 42% through strategic compound indexing and Redis in-memory TTL caching layer.',
          'Mentored 6 junior engineers and established CI/CD automated linting and security vulnerability scanning protocols.'
        ]
      },
      {
        id: '2',
        company: 'Vanguard Tech',
        role: 'Full Stack Software Engineer',
        location: 'Austin, TX',
        startDate: 'Jul 2019',
        endDate: 'Dec 2021',
        bullets: [
          'Developed React & Node.js enterprise dashboards used by 150K+ daily active users with sub-second page load times.',
          'Implemented OAuth2 secure session management and RBAC authorization middleware, passing SOC2 compliance audits.'
        ]
      }
    ],
    education: [
      {
        id: '1',
        institution: 'University of California, Berkeley',
        degree: 'B.S. in Computer Science',
        year: '2019',
        gpa: '3.88 / 4.0'
      }
    ],
    skills: {
      languages: 'TypeScript, JavaScript, Go, Python, SQL, HTML/CSS',
      frameworks: 'React, Node.js, Express, Next.js, FastAPI, Tailwind CSS',
      databases: 'MongoDB, PostgreSQL, Redis, Kafka, Elasticsearch',
      devops: 'Docker, Kubernetes, AWS (ECS, S3, RDS), GitHub Actions, Terraform'
    },
    projects: [
      {
        id: '1',
        name: 'Hone — Technical Interview & Career Studio',
        link: 'github.com/aniketdhoke/prepai',
        description:
          'Engineered an AI-powered technical interview preparation workspace featuring real-time evaluation, Redis TTL caching, and grounded PDF document ingestion.'
      }
    ]
  });

  // Formatting State (Studio Controls)
  const [formatting, setFormatting] = useState({
    template: 'modern', // 'modern' | 'executive' | 'tech' | 'minimal'
    fontSize: 'normal', // 'compact' | 'normal' | 'spacious'
    fontFamily: 'sans', // 'sans' | 'serif' | 'mono'
    accentColor: 'indigo' // 'indigo' | 'emerald' | 'violet' | 'slate' | 'blue' | 'rose'
  });

  // Color mapping helper
  const accentColors = {
    indigo: {
      primary: 'text-indigo-600',
      bg: 'bg-indigo-600',
      border: 'border-indigo-600',
      badge: 'bg-indigo-50 text-indigo-700'
    },
    emerald: {
      primary: 'text-emerald-600',
      bg: 'bg-emerald-600',
      border: 'border-emerald-600',
      badge: 'bg-emerald-50 text-emerald-700'
    },
    violet: {
      primary: 'text-violet-600',
      bg: 'bg-violet-600',
      border: 'border-violet-600',
      badge: 'bg-violet-50 text-violet-700'
    },
    slate: {
      primary: 'text-slate-800',
      bg: 'bg-slate-800',
      border: 'border-slate-800',
      badge: 'bg-slate-100 text-slate-800'
    },
    blue: {
      primary: 'text-blue-600',
      bg: 'bg-blue-600',
      border: 'border-blue-600',
      badge: 'bg-blue-50 text-blue-700'
    },
    rose: {
      primary: 'text-rose-600',
      bg: 'bg-rose-600',
      border: 'border-rose-600',
      badge: 'bg-rose-50 text-rose-700'
    }
  };

  const currentAccent = accentColors[formatting.accentColor] || accentColors.indigo;

  // AI Summary Generator
  const handleGenerateSummary = async () => {
    try {
      setIsGenerating(true);
      const res = await api.post('/ai/enhance-resume', {
        action: 'generate-summary',
        context: {
          title: resumeData.personal.title,
          skills: resumeData.skills.languages + ', ' + resumeData.skills.frameworks,
          experience: '6+ years'
        }
      });
      if (res.data.success) {
        setResumeData({ ...resumeData, summary: res.data.result });
        toast.success('AI Professional Summary generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate summary');
    } finally {
      setIsGenerating(false);
    }
  };

  // AI Polish Bullet
  const handlePolishBullet = async (expIndex, bulletIndex) => {
    try {
      setIsPolishing(true);
      const original = resumeData.experience[expIndex].bullets[bulletIndex];
      const res = await api.post('/ai/enhance-resume', {
        action: 'polish-bullet',
        text: original
      });
      if (res.data.success) {
        const updatedExp = [...resumeData.experience];
        updatedExp[expIndex].bullets[bulletIndex] = res.data.result;
        setResumeData({ ...resumeData, experience: updatedExp });
        toast.success('Bullet point polished with X-Y-Z formula!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to polish bullet');
    } finally {
      setIsPolishing(false);
    }
  };

  // Handlers for Experience, Education, Projects
  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          id: Date.now().toString(),
          company: 'New Enterprise Corp',
          role: 'Staff Software Architect',
          location: 'San Francisco, CA',
          startDate: '2023',
          endDate: 'Present',
          bullets: ['Spearheaded microservices migration improving request throughput by 35%.']
        }
      ]
    });
  };

  const removeExperience = (index) => {
    const updated = resumeData.experience.filter((_, i) => i !== index);
    setResumeData({ ...resumeData, experience: updated });
  };

  const updateExperienceField = (index, field, value) => {
    const updated = [...resumeData.experience];
    updated[index][field] = value;
    setResumeData({ ...resumeData, experience: updated });
  };

  const addBullet = (expIndex) => {
    const updated = [...resumeData.experience];
    updated[expIndex].bullets.push('Engineered scalable microservice reducing p99 latency by 25%.');
    setResumeData({ ...resumeData, experience: updated });
  };

  const updateBullet = (expIndex, bulletIndex, value) => {
    const updated = [...resumeData.experience];
    updated[expIndex].bullets[bulletIndex] = value;
    setResumeData({ ...resumeData, experience: updated });
  };

  const removeBullet = (expIndex, bulletIndex) => {
    const updated = [...resumeData.experience];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    setResumeData({ ...resumeData, experience: updated });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `# ${resumeData.personal.name}
**${resumeData.personal.title}** | ${resumeData.personal.email} | ${resumeData.personal.phone} | ${resumeData.personal.location}
GitHub: ${resumeData.personal.github} | LinkedIn: ${resumeData.personal.linkedin}

## Professional Summary
${resumeData.summary}

## Professional Experience
${resumeData.experience
  .map(
    (e) => `### ${e.role} — ${e.company} (${e.startDate} - ${e.endDate})
${e.bullets.map((b) => `- ${b}`).join('\n')}`
  )
  .join('\n\n')}

## Technical Skills
- Languages: ${resumeData.skills.languages}
- Frameworks: ${resumeData.skills.frameworks}
- Databases & Storage: ${resumeData.skills.databases}
- DevOps & Cloud: ${resumeData.skills.devops}

## Education
${resumeData.education.map((edu) => `- **${edu.institution}**: ${edu.degree} (${edu.year}) — GPA: ${edu.gpa}`).join('\n')}
`;
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Resume copied as Markdown!');
  };

  // Font family helper
  const getFontClass = () => {
    if (formatting.fontFamily === 'serif') return 'font-serif';
    if (formatting.fontFamily === 'mono') return 'font-mono';
    return 'font-sans';
  };

  // Spacing / Density helper
  const getDensityClass = () => {
    if (formatting.fontSize === 'compact') return 'text-xs space-y-4';
    if (formatting.fontSize === 'spacious') return 'text-base space-y-8';
    return 'text-sm space-y-6';
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col print:bg-white print:min-h-0 print:p-0 print:m-0">
      <main className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6 print:p-0 print:m-0 print:max-w-none print:w-full print:block print:gap-0">
        {/* Top Header Card - Hidden on Print */}
        <div className="no-print print:hidden bg-gradient-to-r from-white via-indigo-50/40 to-pink-50/40 border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 font-mono text-xs font-bold shadow-2xs">
                ✦ HONE STUDIO
              </span>
              <span className="text-slate-500 text-xs font-semibold">• Authentic Career Craft &amp; Resume Formatter</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Resume Studio &amp; Executive Formatter
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Craft genuine, human-first engineering portfolios that resonate with engineering leaders. Tune impact metrics, leadership scope, and typography in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300/80 text-[11px] font-bold shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Print Ready (Letter / A4)
            </span>
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copied ? 'Copied!' : 'Copy Markdown'}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/25 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Spacious 2-Column Studio Layout */}
        <div className="flex flex-col xl:flex-row items-start gap-8 w-full print:block print:w-full print:gap-0 print:m-0 print:p-0">
          {/* Left Column: Form & Settings - Hidden on Print */}
          <div className="no-print print:hidden w-full xl:w-[480px] xl:shrink-0 flex flex-col gap-6">
            {/* View Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-200/80 p-1 border border-slate-300/80 shadow-2xs">
              <button
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'content'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 text-indigo-600" />
                Resume Content
              </button>
              <button
                onClick={() => setActiveTab('formatting')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === 'formatting'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-4 h-4 text-purple-600" />
                Studio Formatting
              </button>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
              <div className="flex flex-col gap-6">
                {/* Personal Information */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <User className="w-4 h-4 text-indigo-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={resumeData.personal.name}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personal: { ...resumeData.personal, name: e.target.value }
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Target Title</label>
                      <input
                        type="text"
                        value={resumeData.personal.title}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personal: { ...resumeData.personal, title: e.target.value }
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={resumeData.personal.email}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personal: { ...resumeData.personal, email: e.target.value }
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
                      <input
                        type="text"
                        value={resumeData.personal.phone}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personal: { ...resumeData.personal, phone: e.target.value }
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Location</label>
                      <input
                        type="text"
                        value={resumeData.personal.location}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personal: { ...resumeData.personal, location: e.target.value }
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">GitHub / Portfolio</label>
                      <input
                        type="text"
                        value={resumeData.personal.github}
                        onChange={(e) =>
                          setResumeData({
                            ...resumeData,
                            personal: { ...resumeData.personal, github: e.target.value }
                          })
                        }
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Summary */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Professional Summary
                    </h3>
                    <button
                      onClick={handleGenerateSummary}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                      AI Auto-Generate
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={resumeData.summary}
                    onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed transition-all"
                  />
                </div>

                {/* Experience Card */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      Work Experience
                    </h3>
                    <button
                      onClick={addExperience}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-all cursor-pointer border border-indigo-200/60"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Role
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    {resumeData.experience.map((exp, expIdx) => (
                      <div key={exp.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-indigo-600">Position #{expIdx + 1}</span>
                          <button
                            onClick={() => removeExperience(expIdx)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            placeholder="Role Title (e.g. Senior Backend Engineer)"
                            value={exp.role}
                            onChange={(e) => updateExperienceField(expIdx, 'role', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                          />
                          <input
                            type="text"
                            placeholder="Company Name"
                            value={exp.company}
                            onChange={(e) => updateExperienceField(expIdx, 'company', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                          />
                          <input
                            type="text"
                            placeholder="Start Date (e.g. Jan 2022)"
                            value={exp.startDate}
                            onChange={(e) => updateExperienceField(expIdx, 'startDate', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                          />
                          <input
                            type="text"
                            placeholder="End Date (e.g. Present)"
                            value={exp.endDate}
                            onChange={(e) => updateExperienceField(expIdx, 'endDate', e.target.value)}
                            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                          />
                        </div>

                        {/* Bullets */}
                        <div className="mt-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono text-slate-500 font-semibold">
                              Achievement Bullets
                            </span>
                            <button
                              onClick={() => addBullet(expIdx)}
                              className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
                            >
                              + Add Bullet
                            </button>
                          </div>
                          {exp.bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2 mb-2">
                              <input
                                type="text"
                                value={bullet}
                                onChange={(e) => updateBullet(expIdx, bIdx, e.target.value)}
                                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                              />
                              <button
                                onClick={() => handlePolishBullet(expIdx, bIdx)}
                                title="Enhance with AI (Google X-Y-Z formula)"
                                className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg border border-purple-200 transition-all cursor-pointer shrink-0"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => removeBullet(expIdx, bIdx)}
                                className="p-2 text-slate-400 hover:text-rose-600 rounded-md cursor-pointer shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Skills */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-3.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Code className="w-4 h-4 text-indigo-600" />
                    Technical Skills &amp; Stack
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Programming Languages</label>
                    <input
                      type="text"
                      value={resumeData.skills.languages}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, languages: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Frameworks &amp; Libraries</label>
                    <input
                      type="text"
                      value={resumeData.skills.frameworks}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, frameworks: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Databases &amp; Queues</label>
                    <input
                      type="text"
                      value={resumeData.skills.databases}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, databases: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">DevOps &amp; Cloud</label>
                    <input
                      type="text"
                      value={resumeData.skills.devops}
                      onChange={(e) =>
                        setResumeData({
                          ...resumeData,
                          skills: { ...resumeData.skills, devops: e.target.value }
                        })
                      }
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Formatting Tab */}
            {activeTab === 'formatting' && (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-6">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  Formatting &amp; Studio Controls
                </h3>

                {/* Template Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2.5">Template Layout</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'modern', name: 'Modern Clean', desc: 'Balanced header with crisp typography' },
                      { id: 'executive', name: 'Executive', desc: 'Centered formal layout with divider' },
                      { id: 'tech', name: 'Tech Minimal', desc: 'Monospace developer styling' },
                      { id: 'minimal', name: 'Clean Standard', desc: 'Classic single-column architecture' }
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setFormatting({ ...formatting, template: t.id })}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          formatting.template === t.id
                            ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500/20 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-900">{t.name}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2.5">Accent Color</label>
                  <div className="flex items-center gap-3">
                    {[
                      { id: 'indigo', bg: 'bg-indigo-600' },
                      { id: 'emerald', bg: 'bg-emerald-600' },
                      { id: 'violet', bg: 'bg-violet-600' },
                      { id: 'slate', bg: 'bg-slate-800' },
                      { id: 'blue', bg: 'bg-blue-600' },
                      { id: 'rose', bg: 'bg-rose-600' }
                    ].map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setFormatting({ ...formatting, accentColor: c.id })}
                        className={`w-9 h-9 rounded-full ${c.bg} transition-all cursor-pointer ${
                          formatting.accentColor === c.id ? 'ring-4 ring-indigo-500/30 scale-110 shadow-xs' : 'hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Spacing & Density */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2.5">Document Density &amp; Spacing</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'compact', name: 'Compact' },
                      { id: 'normal', name: 'Normal' },
                      { id: 'spacious', name: 'Spacious' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        onClick={() => setFormatting({ ...formatting, fontSize: s.id })}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          formatting.fontSize === s.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2.5">Typography Style</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'sans', name: 'Inter (Sans)' },
                      { id: 'serif', name: 'Formal (Serif)' },
                      { id: 'mono', name: 'Code (Mono)' }
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setFormatting({ ...formatting, fontFamily: f.id })}
                        className={`py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          formatting.fontFamily === f.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Printed Document Canvas (Expansive width) */}
          <div id="printable-resume-container" className="flex-1 min-w-0 w-full flex flex-col gap-4 print:block print:w-full print:p-0 print:m-0">
            {/* Canvas Header Bar - Hidden on Print */}
            <div className="no-print print:hidden bg-slate-900 text-slate-200 px-6 py-3 rounded-2xl flex items-center justify-between text-xs font-mono shadow-xs">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Studio Canvas — A4 Proportions
              </span>
              <span className="text-slate-400">Layout: {formatting.template.toUpperCase()} • {formatting.fontSize.toUpperCase()}</span>
            </div>

            {/* The Physical Resume Sheet - Only element visible when printing */}
            <div
              id="printable-resume"
              className={`bg-white text-slate-900 p-10 sm:p-14 lg:p-16 shadow-xl rounded-2xl border border-slate-200/90 w-full min-h-[950px] flex flex-col print:shadow-none print:border-none print:rounded-none print:p-0 print:m-0 print:w-full print:min-h-0 print:block ${getFontClass()} ${getDensityClass()}`}
            >
              {/* Executive / Centered Header */}
              {formatting.template === 'executive' ? (
                <div className="resume-item text-center border-b-2 pb-5 border-slate-800 mb-6">
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 uppercase">
                    {resumeData.personal.name}
                  </h1>
                  <p className={`text-sm font-bold mt-1.5 ${currentAccent.primary}`}>{resumeData.personal.title}</p>
                  <p className="text-xs text-slate-600 mt-2.5 flex flex-wrap justify-center gap-x-4 gap-y-1 font-mono">
                    <span>{resumeData.personal.email}</span>
                    <span>•</span>
                    <span>{resumeData.personal.phone}</span>
                    <span>•</span>
                    <span>{resumeData.personal.location}</span>
                    <span>•</span>
                    <span>{resumeData.personal.github}</span>
                  </p>
                </div>
              ) : formatting.template === 'tech' ? (
                <div className="resume-item border-b border-slate-300 pb-5 mb-6 font-mono">
                  <div className="text-2xl sm:text-3xl font-extrabold text-slate-900"># {resumeData.personal.name}</div>
                  <div className={`text-xs font-semibold mt-1 ${currentAccent.primary}`}>&gt; {resumeData.personal.title}</div>
                  <div className="text-xs text-slate-600 mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
                    <span>✉ {resumeData.personal.email}</span>
                    <span>☎ {resumeData.personal.phone}</span>
                    <span>📍 {resumeData.personal.location}</span>
                    <span>🔗 {resumeData.personal.github}</span>
                  </div>
                </div>
              ) : (
                <div className="resume-item border-b pb-5 border-slate-200 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      {resumeData.personal.name}
                    </h1>
                    <p className={`text-sm font-bold mt-1 ${currentAccent.primary}`}>{resumeData.personal.title}</p>
                  </div>
                  <div className="text-xs text-slate-600 sm:text-right font-mono flex flex-col gap-1">
                    <span>{resumeData.personal.email} | {resumeData.personal.phone}</span>
                    <span>{resumeData.personal.location} | {resumeData.personal.github}</span>
                  </div>
                </div>
              )}

              {/* Summary Section */}
              {resumeData.summary && (
                <div className="resume-item">
                  <h2 className={`text-xs font-extrabold uppercase tracking-wider border-b pb-1.5 mb-2.5 ${currentAccent.primary} border-slate-200`}>
                    Professional Summary
                  </h2>
                  <p className="text-slate-700 leading-relaxed">{resumeData.summary}</p>
                </div>
              )}

              {/* Experience Section */}
              {resumeData.experience.length > 0 && (
                <div className="resume-item">
                  <h2 className={`text-xs font-extrabold uppercase tracking-wider border-b pb-1.5 mb-4 ${currentAccent.primary} border-slate-200`}>
                    Professional Experience
                  </h2>
                  <div className="flex flex-col gap-6">
                    {resumeData.experience.map((exp) => (
                      <div key={exp.id} className="resume-item">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline font-bold text-slate-900 gap-1">
                          <span className="text-sm">
                            {exp.role} <span className="font-normal text-slate-600">at {exp.company}</span>
                          </span>
                          <span className="text-xs font-mono text-slate-500 font-normal">
                            {exp.startDate} — {exp.endDate}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 italic mb-2">{exp.location}</p>
                        <ul className="list-disc list-inside space-y-2 text-slate-700">
                          {exp.bullets.map((b, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills Section */}
              <div className="resume-item">
                <h2 className={`text-xs font-extrabold uppercase tracking-wider border-b pb-1.5 mb-3 ${currentAccent.primary} border-slate-200`}>
                  Technical Expertise
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <strong className="text-slate-900 font-semibold">Languages:</strong> {resumeData.skills.languages}
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold">Frameworks:</strong> {resumeData.skills.frameworks}
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold">Databases &amp; Queues:</strong> {resumeData.skills.databases}
                  </div>
                  <div>
                    <strong className="text-slate-900 font-semibold">DevOps &amp; Cloud:</strong> {resumeData.skills.devops}
                  </div>
                </div>
              </div>

              {/* Projects Section */}
              {resumeData.projects && resumeData.projects.length > 0 && (
                <div className="resume-item">
                  <h2 className={`text-xs font-extrabold uppercase tracking-wider border-b pb-1.5 mb-3 ${currentAccent.primary} border-slate-200`}>
                    Key Projects
                  </h2>
                  <div className="flex flex-col gap-3">
                    {resumeData.projects.map((proj) => (
                      <div key={proj.id} className="resume-item">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-baseline font-bold text-slate-900 gap-1">
                          <span className="text-xs font-bold text-slate-900">{proj.name}</span>
                          {proj.link && (
                            <span className="text-[11px] font-mono text-slate-500 font-normal">{proj.link}</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Section */}
              {resumeData.education.length > 0 && (
                <div className="resume-item">
                  <h2 className={`text-xs font-extrabold uppercase tracking-wider border-b pb-1.5 mb-3 ${currentAccent.primary} border-slate-200`}>
                    Education
                  </h2>
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="resume-item flex justify-between items-baseline">
                      <div>
                        <span className="font-bold text-slate-900">{edu.institution}</span> —{' '}
                        <span className="text-slate-700">{edu.degree}</span>
                      </div>
                      <div className="text-xs font-mono text-slate-500">
                        {edu.year} {edu.gpa ? `• GPA: ${edu.gpa}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResumeStudioPage;
