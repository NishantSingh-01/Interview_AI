import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Sparkles,
  Upload,
  FileText,
  Briefcase,
  User,
  ArrowRight,
  Search,
  CheckCircle2,
  X,
  LogOut,
  Clock,
  Award,
  BookOpen,
  ChevronRight,
  Layers,
  Flame,
  FileCheck
} from "lucide-react";
import useInterview from "../hooks/useInterview";
import { useAuth } from "../../auth/hooks/useAuth";

const PRESET_ROLES = [
  {
    title: "Frontend React Developer",
    job: "Seeking a Senior Frontend Engineer proficient in React, TypeScript, state management (Redux/Zustand), and modern CSS. Experience optimizing web performance, accessibility, and component libraries.",
    self: "5+ years frontend experience specializing in React, Next.js, and TypeScript. Strong UI/UX focus, built high-performance responsive web applications, and collaborated with cross-functional teams."
  },
  {
    title: "Full-Stack MERN Engineer",
    job: "Looking for a Full-Stack MERN Developer to build scalable RESTful and GraphQL APIs, integrate MongoDB schemas, and craft intuitive React frontends. Knowledge of Docker, CI/CD, and JWT authentication is required.",
    self: "Full-stack engineer with 3+ years hands-on experience building web apps using React, Node.js, Express, and MongoDB. Familiar with microservices, Redis caching, and AWS deployments."
  },
  {
    title: "Backend Node.js Engineer",
    job: "Backend Developer needed for high-concurrency microservices, distributed systems, PostgreSQL/MongoDB, and Redis. Must understand system design, event-driven architecture (Kafka/RabbitMQ), and API security.",
    self: "Backend software engineer with 4 years building scalable services in Node.js and Go. Designed event-driven architectures, optimized database queries, and implemented zero-trust security standards."
  },
  {
    title: "DevOps & Cloud Engineer",
    job: "DevOps Engineer required to maintain AWS/GCP cloud infrastructure, write Terraform IaC, set up Kubernetes clusters, and automate CI/CD pipelines with GitHub Actions. Focus on reliability and security.",
    self: "Cloud and DevOps enthusiast with 3 years configuring Docker, Kubernetes, and Terraform. Implemented automated GitOps deployments and reduced build times by 45%."
  }
];

const LOADING_STEPS = [
  "Parsing resume and extracting key competencies...",
  "Analyzing job requirements & desired qualifications...",
  "Generating realistic technical & behavioral questions...",
  "Calculating candidate fit score & tailoring preparation roadmap..."
];

const Home = () => {
  const { GenerateReport, getAllReports, reports } = useInterview();
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [loader, setLoader] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeName, setResumeName] = useState("");
  const [resumeSize, setResumeSize] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'score'

  const fileRef = useRef(null);

  // Fetch past reports on load
  useEffect(() => {
    getAllReports();
  }, []);

  // Multi-step loading cycle animation
  useEffect(() => {
    let interval;
    if (loader) {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loader]);

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setResumeFile(file);
    setResumeName(file.name);
    const sizeKB = Math.round(file.size / 1024);
    setResumeSize(sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`);
    toast.success(`Resume "${file.name}" attached!`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClearResume = (e) => {
    e.stopPropagation();
    setResumeFile(null);
    setResumeName("");
    setResumeSize("");
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // Submit interview report request
  const handleResponseReport = async () => {
    if (!jobDescription.trim()) {
      toast.error("Job description is required");
      return;
    }
    if (!selfDescription.trim()) {
      toast.error("Self description is required");
      return;
    }
    if (!resumeFile) {
      toast.error("Please upload your resume in PDF format");
      return;
    }

    setLoader(true);
    try {
      const response = await GenerateReport({ resumeFile, jobDescription, selfDescription });
      if (response?._id) {
        navigate(`/response/${response._id}`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to generate report");
    } finally {
      setLoader(false);
    }
  };

  // Preset role selection
  const handleSelectPreset = (preset) => {
    setJobDescription(preset.job);
    setSelfDescription(preset.self);
    toast.info(`Filled form with ${preset.title} details!`);
  };

  // Format relative timestamp
  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    if (!reports || !Array.isArray(reports)) return [];

    let list = reports.filter((r) => {
      const query = searchTerm.toLowerCase();
      const titleMatch = r?.title?.toLowerCase().includes(query);
      const jdMatch = r?.jobDescription?.toLowerCase().includes(query);
      return titleMatch || jdMatch;
    });

    if (sortBy === "score") {
      list.sort((a, b) => (b?.matchScore || 0) - (a?.matchScore || 0));
    } else {
      list.sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
    }

    return list;
  }, [reports, searchTerm, sortBy]);

  // Calculate readiness status
  const isJobReady = jobDescription.trim().length > 20;
  const isSelfReady = selfDescription.trim().length > 20;
  const isResumeReady = !!resumeFile;
  const readyCount = [isJobReady, isSelfReady, isResumeReady].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white relative selection:bg-purple-500 selection:text-white pb-16">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-glow" />
      <div className="absolute top-48 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-glow" style={{ animationDelay: '3s' }} />

      {/* Top Navbar */}
      <header className="sticky top-0 z-30 glass-panel border-b border-gray-800/80 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-purple-300">
                PrepAI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">AI-Powered Mock Interview Copilot</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-gray-800/80 border border-gray-700/60">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase">
                {user.username ? user.username[0] : "U"}
              </div>
              <span className="text-xs font-medium text-gray-200 hidden sm:inline">
                {user.username || user.email}
              </span>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-red-400 px-3 py-1.5 rounded-xl hover:bg-gray-800/80 border border-transparent hover:border-red-500/20 transition-all"
            title="Log out of your account"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-10">
        {/* Hero Title Section */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-medium shadow-inner shadow-purple-500/10">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Smart Tailored Interview Intelligence
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Nail Your Next Interview with{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Custom AI Plans
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 leading-relaxed">
            Upload your resume, paste the target job description, and get instant technical questions,
            behavioral prompts, skill gap diagnostics, and a day-by-day roadmap.
          </p>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-300 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real-time Job Fit Score
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-300 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Targeted Q&A Strategy
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-300 px-3 py-1.5 rounded-lg bg-gray-800/60 border border-gray-700/50">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Speech Audio Mock Mode
            </span>
          </div>
        </section>

        {/* Quick Presets Bar */}
        <section className="glass-card p-4 rounded-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Quick-Fill Test Roles (One-Click Setup)
              </span>
            </div>
            <span className="text-[11px] text-gray-500">Click any role below to pre-populate inputs</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {PRESET_ROLES.map((role, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPreset(role)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-gray-900/60 hover:bg-purple-950/40 border border-gray-800 hover:border-purple-500/40 text-left transition group"
              >
                <div className="truncate">
                  <p className="text-xs font-medium text-gray-200 group-hover:text-purple-300 truncate">
                    {role.title}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">Instant template</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* Interactive Form Card */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-gray-700/70 shadow-2xl relative overflow-hidden">
          {/* Readiness Tracker Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-800 mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-400" /> Configure Your Interview Parameters
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Complete the three inputs below to synthesize your custom interview intelligence report.
              </p>
            </div>

            {/* Live Progress Pill */}
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs">
              <span className="text-gray-400">Readiness:</span>
              <span
                className={`font-semibold ${
                  readyCount === 3 ? "text-emerald-400" : readyCount > 0 ? "text-amber-400" : "text-gray-500"
                }`}
              >
                {readyCount} of 3 Complete
              </span>
              <div className="flex gap-1 ml-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < readyCount ? "bg-emerald-400" : "bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Target Job Description */}
            <div className="flex flex-col space-y-2.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="jobDescription"
                  className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-blue-400" />
                  Target Job Description
                  <span className="text-red-400 text-xs">*</span>
                </label>

                {jobDescription && (
                  <button
                    onClick={() => setJobDescription("")}
                    className="text-[11px] text-gray-500 hover:text-gray-300 transition"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="relative flex-1">
                <textarea
                  id="jobDescription"
                  name="jobDescription"
                  rows={13}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job posting, required qualifications, key skills, and responsibilities here..."
                  className="w-full h-full min-h-[300px] p-4 rounded-2xl bg-gray-900/90 border border-gray-700/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all leading-relaxed resize-none"
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-gray-500 px-1">
                <span className="flex items-center gap-1">
                  {isJobReady ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Job description ready
                    </span>
                  ) : (
                    "Provide at least 20 characters"
                  )}
                </span>
                <span>{jobDescription.length} chars</span>
              </div>
            </div>

            {/* Right Column: Resume Upload & Self Description */}
            <div className="flex flex-col space-y-6">
              {/* Resume Upload Dropzone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-purple-400" />
                    Upload Resume (PDF)
                    <span className="text-red-400 text-xs">*</span>
                  </label>
                  {resumeFile && (
                    <button
                      onClick={handleClearResume}
                      className="text-[11px] text-red-400 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Remove File
                    </button>
                  )}
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center text-center relative group ${
                    isDragging
                      ? "border-purple-400 bg-purple-950/40 scale-[1.01]"
                      : resumeFile
                      ? "border-emerald-500/50 bg-emerald-950/20"
                      : "border-gray-700 hover:border-purple-500/50 bg-gray-900/60 hover:bg-gray-900"
                  }`}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    ref={fileRef}
                    className="hidden"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                  />

                  {resumeFile ? (
                    <div className="flex items-center gap-4 w-full px-2">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-left truncate">
                        <p className="text-sm font-semibold text-white truncate">{resumeName}</p>
                        <p className="text-xs text-gray-400">{resumeSize} • Ready for analysis</p>
                      </div>
                      <span className="text-xs text-purple-400 hover:underline font-medium">
                        Replace
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600/20 text-gray-400 group-hover:text-purple-400 transition-all duration-300">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-200">
                          Click to upload or drag & drop resume
                        </p>
                        <p className="text-xs text-gray-500">Supported format: PDF only (Max 10MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Self Description */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="selfDescription"
                    className="text-sm font-semibold text-gray-200 flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    Self Description & Highlights
                    <span className="text-red-400 text-xs">*</span>
                  </label>

                  {selfDescription && (
                    <button
                      onClick={() => setSelfDescription("")}
                      className="text-[11px] text-gray-500 hover:text-gray-300 transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <textarea
                  id="selfDescription"
                  name="selfDescription"
                  rows={5}
                  value={selfDescription}
                  onChange={(e) => setSelfDescription(e.target.value)}
                  placeholder="Share a short pitch about your background, key achievements, strengths, and the specific focus you want for this interview..."
                  className="w-full p-4 rounded-2xl bg-gray-900/90 border border-gray-700/80 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all leading-relaxed resize-none"
                />

                <div className="flex justify-between items-center text-[11px] text-gray-500 px-1">
                  <span className="flex items-center gap-1">
                    {isSelfReady ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Highlights ready
                      </span>
                    ) : (
                      "Provide at least 20 characters"
                    )}
                  </span>
                  <span>{selfDescription.length} chars</span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                onClick={handleResponseReport}
                disabled={loader}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                  loader
                    ? "bg-purple-900/50 text-purple-300 cursor-wait border border-purple-500/30"
                    : "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white hover:shadow-purple-600/25 hover:scale-[1.01] active:scale-[0.99] border border-purple-400/30"
                }`}
              >
                {loader ? (
                  <>
                    <div className="w-5 h-5 border-2 border-purple-300 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing & Synthesizing Interview Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                    <span>Generate Tailored Interview Plan</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dynamic Animated Loading Progress Overlay */}
          {loader && (
            <div className="absolute inset-0 bg-gray-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-20 animate-in fade-in">
              <div className="max-w-md w-full glass-card p-8 rounded-3xl border border-purple-500/40 text-center space-y-6 shadow-2xl shadow-purple-500/10">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-blue-500/20 border-b-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="w-7 h-7 text-purple-400 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white">AI Copilot at Work</h3>
                  <p className="text-sm text-purple-300 font-medium min-h-[2.5rem] transition-all duration-500">
                    {LOADING_STEPS[loadingStepIndex]}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-700"
                      style={{ width: `${((loadingStepIndex + 1) / LOADING_STEPS.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">Step {loadingStepIndex + 1} of {LOADING_STEPS.length}</p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Recent Plans Section */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
                <Layers className="w-6 h-6 text-purple-400" />
                My Saved Interview Plans
              </h2>
              <p className="text-xs text-gray-400">
                Browse, search, and continue preparing for previously generated positions
              </p>
            </div>

            {/* Filter & Search Controls */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter plans..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="newest">Newest First</option>
                <option value="score">Highest Match Score</option>
              </select>
            </div>
          </div>

          {/* Grid of Plans */}
          {filteredReports && filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReports.map((item, idx) => {
                const score = item?.matchScore ?? 0;
                const scoreColor =
                  score >= 75
                    ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                    : score >= 50
                    ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
                    : "text-rose-400 border-rose-500/40 bg-rose-500/10";

                return (
                  <div
                    key={item?._id || idx}
                    onClick={() => navigate(`/response/${item._id}`)}
                    className="glass-card p-5 rounded-2xl hover:border-purple-500/50 hover:bg-gray-850 cursor-pointer transition-all duration-300 group hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-600/10 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-500" />
                          {formatTimeAgo(item?.createdAt)}
                        </span>

                        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${scoreColor}`}>
                          <Award className="w-3.5 h-3.5" />
                          <span>{score}% Match</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                        {item?.title || "Custom Interview Blueprint"}
                      </h3>

                      {/* Brief Excerpt */}
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                        {item?.jobDescription || "Tailored preparation plan with technical questions and skill diagnostics."}
                      </p>
                    </div>

                    {/* Card Footer */}
                    <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-purple-400 font-semibold group-hover:text-purple-300">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        {item?.technicalQuestion?.length || 0} Tech • {item?.behaviouralQuestion?.length || 0} Behavioral
                      </span>
                      <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Prepare <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card p-12 rounded-3xl border border-gray-800 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-800/60 flex items-center justify-center text-gray-500">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-gray-300">
                {searchTerm ? "No matching plans found" : "No interview plans yet"}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchTerm
                  ? `No saved interview plans matching "${searchTerm}". Try another keyword or clear the search.`
                  : "Submit your target job description and resume above to create your first customized interview blueprint!"}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-purple-400 hover:underline pt-1"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;