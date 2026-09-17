import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import confetti from 'canvas-confetti'
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Code2,
  Copy,
  Download,
  Filter,
  Flame,
  HelpCircle,
  Info,
  Layers,
  MessageSquare,
  Search,
  Share2,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react'
import { toast } from 'react-toastify'
import QuestionCard from '../components/QuestionCard'
import AICoachDrawer from '../components/AICoachDrawer'
import useInterview from '../hooks/useInterview'
import Loader from '../../auth/components/Loader'

const Response = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { report, getReportById, loading } = useInterview()

  const [tab, setTab] = useState('technical') // 'technical' | 'behavioural' | 'skillGap'
  const [practiceMode, setPracticeMode] = useState('study') // 'study' | 'mock'
  const [questionFilter, setQuestionFilter] = useState('all') // 'all' | 'unmastered' | 'mastered'
  const [searchQuery, setSearchQuery] = useState('')

  // State to track mastered questions: { [questionText]: boolean }
  const [masteredMap, setMasteredMap] = useState({})

  // State to track completed preparation tasks: { [taskIndexOrString]: boolean }
  const [completedTasks, setCompletedTasks] = useState({})

  // Expanded days for preparation plan: { [day]: boolean }
  const [expandedDays, setExpandedDays] = useState({ 1: true })

  // Skill gap severity filter
  const [gapFilter, setGapFilter] = useState('all') // 'all' | 'high' | 'medium' | 'low'
  const [expandedGaps, setExpandedGaps] = useState({})

  // Fetch report by ID
  useEffect(() => {
    if (!id) return
    getReportById(id)
  }, [id])

  // Confetti effect when report with high match score loads
  useEffect(() => {
    if (report?.matchScore && report.matchScore >= 75) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        })
      } catch {
        // Safe fallback
      }
    }
  }, [report?.matchScore])

  // Question Mastery toggle
  const handleToggleMastered = (questionText) => {
    setMasteredMap((prev) => {
      const next = { ...prev, [questionText]: !prev[questionText] }
      if (next[questionText]) {
        toast.success('Marked as mastered! Keep going!')
      }
      return next
    })
  }

  // Task Completed toggle
  const handleToggleTask = (taskKey) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskKey]: !prev[taskKey] }
      // Check if all tasks completed
      const totalTasks =
        report?.preparationPlan?.reduce((acc, curr) => acc + (curr?.tasks?.length || 0), 0) || 0
      const nowChecked = Object.values(next).filter(Boolean).length
      if (nowChecked === totalTasks && totalTasks > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
        toast.success('🎉 Incredible! You completed the entire preparation roadmap!')
      }
      return next
    })
  }

  // Toggle Day accordion
  const handleToggleDay = (day) => {
    setExpandedDays((prev) => ({ ...prev, [day]: !prev[day] }))
  }

  // Toggle Skill gap advice
  const handleToggleGap = (idx) => {
    setExpandedGaps((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  // Filter questions
  const currentQuestions = useMemo(() => {
    const list =
      tab === 'technical'
        ? report?.technicalQuestion || []
        : tab === 'behavioural'
        ? report?.behaviouralQuestion || []
        : []

    return list.filter((q) => {
      const isMastered = !!masteredMap[q.question]
      if (questionFilter === 'mastered' && !isMastered) return false
      if (questionFilter === 'unmastered' && isMastered) return false

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          q.question?.toLowerCase().includes(query) ||
          q.intention?.toLowerCase().includes(query) ||
          q.answer?.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [tab, report, questionFilter, searchQuery, masteredMap])

  // Calculate mastery statistics for current tab
  const totalQuestions =
    tab === 'technical'
      ? report?.technicalQuestion?.length || 0
      : tab === 'behavioural'
      ? report?.behaviouralQuestion?.length || 0
      : 0

  const masteredCount = useMemo(() => {
    const list =
      tab === 'technical'
        ? report?.technicalQuestion || []
        : tab === 'behavioural'
        ? report?.behaviouralQuestion || []
        : []
    return list.filter((q) => masteredMap[q.question]).length
  }, [tab, report, masteredMap])

  // Calculate preparation plan completion
  const totalPrepTasks = useMemo(() => {
    return report?.preparationPlan?.reduce((acc, curr) => acc + (curr?.tasks?.length || 0), 0) || 0
  }, [report])

  const completedPrepTasks = useMemo(() => {
    return Object.values(completedTasks).filter(Boolean).length
  }, [completedTasks])

  const prepProgressPercent =
    totalPrepTasks > 0 ? Math.round((completedPrepTasks / totalPrepTasks) * 100) : 0

  // Filter skill gaps
  const filteredSkillGaps = useMemo(() => {
    if (!report?.skillGaps) return []
    if (gapFilter === 'all') return report.skillGaps
    return report.skillGaps.filter((g) => g.severity === gapFilter)
  }, [report, gapFilter])

  // Copy whole prep summary
  const handleCopySummary = () => {
    if (!report) return
    const summary = `PrepAI Interview Blueprint for: ${report.title || 'Target Role'}\nMatch Score: ${
      report.matchScore
    }%\n\nSkill Gaps:\n${
      report.skillGaps?.map((g) => `- ${g.skill} (${g.severity})`).join('\n') || 'None'
    }\n\nTop Technical Questions:\n${
      report.technicalQuestion?.map((q, i) => `${i + 1}. ${q.question}`).join('\n') || 'None'
    }`
    navigator.clipboard.writeText(summary)
    toast.success('Interview summary copied to clipboard!')
  }

  if (loading) {
    return <Loader text="Loading your interview report..." />
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card p-8 rounded-3xl max-w-md w-full space-y-4">
          <HelpCircle className="w-12 h-12 mx-auto text-purple-400" />
          <h2 className="text-xl font-bold">Report Not Found</h2>
          <p className="text-xs text-gray-400">
            This interview report could not be found or may have been removed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-sm transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const matchScore = report.matchScore || 0
  const scoreColor =
    matchScore >= 75 ? 'text-emerald-400' : matchScore >= 50 ? 'text-amber-400' : 'text-rose-400'
  const strokeColor =
    matchScore >= 75 ? '#10B981' : matchScore >= 50 ? '#F59E0B' : '#F43F5E'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white flex flex-col selection:bg-purple-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="glass-panel border-b border-gray-800 sticky top-0 z-30 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Plans</span>
          </button>

          <div className="h-4 w-px bg-gray-800" />

          <div>
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
              {report.title || 'Custom Interview Plan'}
            </h1>
            <p className="text-[11px] text-gray-400 hidden sm:block">
              Tailored preparation, question breakdown & skill roadmap
            </p>
          </div>
        </div>

        {/* Practice Mode Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-gray-900 border border-gray-800 text-xs">
            <button
              onClick={() => setPracticeMode('study')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                practiceMode === 'study'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Study Mode
            </button>
            <button
              onClick={() => setPracticeMode('mock')}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                practiceMode === 'mock'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Mock Practice
            </button>
          </div>

          {/* Copy Summary Button */}
          <button
            onClick={handleCopySummary}
            className="p-2 rounded-xl text-gray-400 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 transition text-xs flex items-center gap-1.5"
            title="Copy Interview Plan Summary"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden md:inline">Copy Summary</span>
          </button>
        </div>
      </header>

      {/* Main 3-Column Responsive Grid Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-[260px_1fr_310px] gap-6 items-start">
        {/* LEFT COLUMN: Sidebar Navigation */}
        <aside className="glass-panel p-4 rounded-2xl border border-gray-800 space-y-3 sticky top-20">
          <div className="px-2 py-1">
            <span className="text-[11px] uppercase font-bold tracking-wider text-gray-500">
              Navigation
            </span>
          </div>

          <nav className="space-y-1.5">
            {/* Technical Questions */}
            <button
              onClick={() => {
                setTab('technical')
                setSearchQuery('')
              }}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all duration-200 ${
                tab === 'technical'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-600/20'
                  : 'text-gray-300 hover:bg-gray-850 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Code2 className="w-4 h-4" />
                <span className="text-sm">Technical Q&A</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  tab === 'technical'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {report.technicalQuestion?.length || 0}
              </span>
            </button>

            {/* Behavioral Questions */}
            <button
              onClick={() => {
                setTab('behavioural')
                setSearchQuery('')
              }}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all duration-200 ${
                tab === 'behavioural'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-600/20'
                  : 'text-gray-300 hover:bg-gray-850 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Behavioral Q&A</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  tab === 'behavioural'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {report.behaviouralQuestion?.length || 0}
              </span>
            </button>

            {/* Preparation Roadmap */}
            <button
              onClick={() => setTab('skillGap')}
              className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all duration-200 ${
                tab === 'skillGap'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-600/20'
                  : 'text-gray-300 hover:bg-gray-850 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Prep Roadmap</span>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  tab === 'skillGap'
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {prepProgressPercent}%
              </span>
            </button>
          </nav>

          {/* Quick Study Tip Card */}
          <div className="mt-6 p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interviewer Tip</span>
            </div>
            <p className="text-purple-200/80 leading-relaxed text-[11px]">
              {practiceMode === 'mock'
                ? 'Practice speaking your answers aloud with the audio feature before revealing model answers!'
                : 'Highlight specific past impact metrics ($ revenue, % latency, team size) in your explanations.'}
            </p>
          </div>
        </aside>

        {/* MIDDLE COLUMN: Active Content Tab */}
        <section className="space-y-5 min-w-0">
          {/* Questions Tabs (Technical or Behavioral) */}
          {tab !== 'skillGap' && (
            <>
              {/* Controls: Search & Mastery Filters */}
              <div className="glass-card p-4 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      {tab === 'technical' ? (
                        <>
                          <Code2 className="w-5 h-5 text-purple-400" />
                          Technical Interview Questions
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-5 h-5 text-blue-400" />
                          Behavioral & Cultural Scenarios
                        </>
                      )}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {practiceMode === 'mock'
                        ? 'Mock Mode enabled: Click to reveal answers after formulating your pitch.'
                        : 'Review questions, model answers, and interviewer intentions.'}
                    </p>
                  </div>

                  {/* Mastery Progress Badge */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs self-start sm:self-auto">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-gray-300 font-medium">
                      {masteredCount} of {totalQuestions} Mastered
                    </span>
                  </div>
                </div>

                {/* Search & Filter row */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-gray-800">
                  <div className="flex items-center gap-1.5 text-xs">
                    <button
                      onClick={() => setQuestionFilter('all')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        questionFilter === 'all'
                          ? 'bg-purple-600 text-white font-medium'
                          : 'text-gray-400 hover:text-white bg-gray-900'
                      }`}
                    >
                      All ({totalQuestions})
                    </button>
                    <button
                      onClick={() => setQuestionFilter('unmastered')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        questionFilter === 'unmastered'
                          ? 'bg-purple-600 text-white font-medium'
                          : 'text-gray-400 hover:text-white bg-gray-900'
                      }`}
                    >
                      Needs Practice ({totalQuestions - masteredCount})
                    </button>
                    <button
                      onClick={() => setQuestionFilter('mastered')}
                      className={`px-3 py-1.5 rounded-lg transition ${
                        questionFilter === 'mastered'
                          ? 'bg-purple-600 text-white font-medium'
                          : 'text-gray-400 hover:text-white bg-gray-900'
                      }`}
                    >
                      Mastered ({masteredCount})
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative flex-1 sm:max-w-xs">
                    <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Questions List */}
              {currentQuestions.length > 0 ? (
                <div className="space-y-4">
                  {currentQuestions.map((q, idx) => (
                    <QuestionCard
                      key={q.question || idx}
                      q={q}
                      index={idx}
                      mode={practiceMode}
                      isMastered={!!masteredMap[q.question]}
                      onToggleMastered={() => handleToggleMastered(q.question)}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-card p-10 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                  <h3 className="text-base font-semibold text-white">No questions in this filter</h3>
                  <p className="text-xs text-gray-400">
                    {questionFilter === 'mastered'
                      ? 'You have not marked any questions as mastered yet.'
                      : 'No questions match your current search criteria.'}
                  </p>
                  <button
                    onClick={() => {
                      setQuestionFilter('all')
                      setSearchQuery('')
                    }}
                    className="text-xs text-purple-400 hover:underline pt-1"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </>
          )}

          {/* Preparation Plan Tab */}
          {tab === 'skillGap' && (
            <div className="space-y-6">
              {/* Header Card with Progress Bar */}
              <div className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-400" /> Day-by-Day Preparation Roadmap
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Check off daily tasks as you prepare. Interactive milestones to maximize interview confidence.
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-purple-400">
                      {prepProgressPercent}%
                    </span>
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      {completedPrepTasks} of {totalPrepTasks} Completed
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-900 rounded-full h-2.5 overflow-hidden border border-gray-800">
                  <div
                    className="bg-gradient-to-r from-purple-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${prepProgressPercent}%` }}
                  />
                </div>
              </div>

              {/* Day Cards */}
              <div className="space-y-4">
                {report.preparationPlan?.map((planDay) => {
                  const dayNum = planDay.day
                  const isExpanded = !!expandedDays[dayNum]
                  const dayTasks = planDay.tasks || []
                  const checkedCount = dayTasks.filter(
                    (t, i) => completedTasks[`day-${dayNum}-task-${i}`]
                  ).length
                  const isAllDayDone = dayTasks.length > 0 && checkedCount === dayTasks.length

                  return (
                    <div
                      key={dayNum}
                      className={`glass-card rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isAllDayDone
                          ? 'border-emerald-500/40 bg-gray-900/90 shadow-md shadow-emerald-500/5'
                          : 'border-gray-800 hover:border-gray-700'
                      }`}
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => handleToggleDay(dayNum)}
                        className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-800/40 transition"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                              isAllDayDone
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                            }`}
                          >
                            D{dayNum}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-white">Day {dayNum}</h3>
                              {isAllDayDone && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-amber-300/90 font-medium mt-0.5">
                              {planDay.focus}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-400">
                            {checkedCount}/{dayTasks.length} tasks
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Accordion Body: Task Checklist */}
                      {isExpanded && (
                        <div className="px-5 pb-5 pt-1 space-y-2.5 border-t border-gray-800/60">
                          {dayTasks.map((taskText, taskIdx) => {
                            const taskKey = `day-${dayNum}-task-${taskIdx}`
                            const isChecked = !!completedTasks[taskKey]

                            return (
                              <div
                                key={taskIdx}
                                onClick={() => handleToggleTask(taskKey)}
                                className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                                  isChecked
                                    ? 'bg-emerald-950/20 border-emerald-500/30 text-gray-300'
                                    : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 text-gray-200'
                                }`}
                              >
                                <button
                                  type="button"
                                  className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition flex-shrink-0 ${
                                    isChecked
                                      ? 'bg-emerald-500 text-white'
                                      : 'border border-gray-600 bg-gray-800 hover:border-purple-400'
                                  }`}
                                >
                                  {isChecked && <CheckCircle2 className="w-4 h-4" />}
                                </button>

                                <span
                                  className={`text-sm leading-relaxed ${
                                    isChecked ? 'line-through text-gray-500' : ''
                                  }`}
                                >
                                  {taskText}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Match Score & Skill Gaps Diagnostics */}
        <aside className="glass-panel p-5 rounded-2xl border border-gray-800 space-y-6 sticky top-20">
          {/* Match Score Circular Gauge Card */}
          <div className="glass-card p-5 rounded-2xl border border-gray-800 text-center relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider text-gray-400 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-purple-400" /> Match Score
              </span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                  matchScore >= 75
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : matchScore >= 50
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}
              >
                {matchScore >= 75 ? 'Strong Fit' : matchScore >= 50 ? 'Moderate Fit' : 'Requires Prep'}
              </span>
            </div>

            {/* Circular Gauge Graphic */}
            <div className="relative w-32 h-32 mx-auto my-2 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#1F2937"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={strokeColor}
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - matchScore / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${scoreColor}`}>{matchScore}%</span>
                <span className="text-[10px] text-gray-400 font-medium">Fit Index</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Based on required job competencies vs. resume qualifications.
            </p>
          </div>

          {/* Skill Gaps Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Identified Skill Gaps</h3>
              </div>
              <span className="text-xs text-gray-500">
                {report.skillGaps?.length || 0} gaps
              </span>
            </div>

            {/* Severity Filter Pills */}
            <div className="flex gap-1 p-1 bg-gray-900 rounded-xl border border-gray-800 text-[10px]">
              {['all', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setGapFilter(sev)}
                  className={`flex-1 py-1 rounded-lg capitalize font-semibold transition ${
                    gapFilter === sev
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            {/* Skill Gaps List */}
            <div className="space-y-2">
              {filteredSkillGaps.map((item, idx) => {
                const isExpanded = !!expandedGaps[idx]
                const sevBadge =
                  item.severity === 'high'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : item.severity === 'medium'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-gray-900/80 border border-gray-800/80 hover:border-gray-700 transition"
                  >
                    <div
                      onClick={() => handleToggleGap(idx)}
                      className="flex items-center justify-between gap-2 cursor-pointer"
                    >
                      <span className="text-xs font-semibold text-gray-200">
                        {item.skill}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full capitalize font-bold border ${sevBadge}`}
                        >
                          {item.severity}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Interview Strategy for this Gap */}
                    {isExpanded && (
                      <div className="mt-2.5 pt-2 border-t border-gray-800 text-[11px] text-gray-400 leading-relaxed space-y-1">
                        <p className="font-semibold text-purple-300">How to handle in interview:</p>
                        <p>
                          Acknowledge basic familiarity, highlight rapid learning speed with related
                          technologies, and mention current active tutorials or side projects.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })}

              {filteredSkillGaps.length === 0 && (
                <div className="p-4 rounded-xl bg-gray-900 text-center text-xs text-gray-500">
                  No skill gaps in this severity tier.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Floating AI Interview Coach Drawer */}
      <AICoachDrawer reportTitle={report.title} />
    </div>
  )
}

export default Response
