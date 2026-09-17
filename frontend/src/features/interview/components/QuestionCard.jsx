import React, { useState, useEffect } from 'react'
import {
  Volume2,
  VolumeX,
  Copy,
  Check,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  HelpCircle,
  Sparkles,
  Edit3,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { toast } from 'react-toastify'

const QuestionCard = ({
  q,
  index = 0,
  mode = 'study', // 'study' | 'mock'
  isMastered = false,
  onToggleMastered = () => {}
}) => {
  const [revealedInMock, setRevealedInMock] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [userNotes, setUserNotes] = useState('')
  const [showNotes, setShowNotes] = useState(false)

  const showAnswer = mode === 'study' ? true : revealedInMock

  // Speech synthesis
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      toast.info('Speech synthesis is not supported in this browser.')
      return
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      window.speechSynthesis.cancel() // cancel previous
      const utterance = new SpeechSynthesisUtterance(q.question)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      setIsSpeaking(true)
      window.speechSynthesis.speak(utterance)
    }
  }

  // Copy to clipboard
  const handleCopy = () => {
    const textToCopy = `Question: ${q.question}\n\nInterviewer Intention: ${q.intention}\n\nSuggested Answer: ${q.answer}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    toast.success('Question and answer copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`glass-card p-5 sm:p-6 rounded-2xl mb-5 transition-all duration-300 border ${
        isMastered
          ? 'border-emerald-500/40 bg-gray-900/90 shadow-lg shadow-emerald-500/5'
          : 'border-gray-700/60 bg-gray-900/70 hover:border-gray-600 shadow-md'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs font-bold">
            #{index + 1}
          </span>

          <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-gray-800 text-gray-300 border border-gray-700">
            Interview Question
          </span>

          {isMastered && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mastered
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio read-aloud */}
          <button
            onClick={handleToggleSpeech}
            className={`p-2 rounded-lg text-sm flex items-center gap-1.5 transition ${
              isSpeaking
                ? 'bg-purple-600 text-white animate-pulse'
                : 'text-gray-400 hover:text-purple-300 hover:bg-gray-800'
            }`}
            title={isSpeaking ? 'Stop Audio' : 'Listen to Question'}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-xs hidden sm:inline">{isSpeaking ? 'Playing' : 'Listen'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
            title="Copy Q&A"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Mastered Toggle */}
          <button
            onClick={() => onToggleMastered(index)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              isMastered
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200 hover:bg-gray-750'
            }`}
          >
            {isMastered ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Done</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span>Mark Mastered</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Question Text */}
      <h3 className="text-lg sm:text-xl font-semibold text-white leading-snug mb-3">
        {q.question}
      </h3>

      {/* Interviewer Intention */}
      <div className="mb-4 p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/30 flex items-start gap-2.5">
        <HelpCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-semibold text-purple-300 mr-1.5">Interviewer's Goal:</span>
          <span className="text-purple-200/90 leading-relaxed">{q.intention}</span>
        </div>
      </div>

      {/* Mock Practice Notes Drawer Toggle */}
      <div className="mb-3">
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-xs text-gray-400 hover:text-purple-300 flex items-center gap-1.5 transition"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{showNotes ? 'Hide My Practice Notes' : 'Open My Practice Notes / Draft Answer'}</span>
          {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {showNotes && (
          <div className="mt-2.5 p-3 rounded-xl bg-gray-950/60 border border-gray-800">
            <textarea
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              placeholder="Type your bullet points, key experiences, or rehearsal thoughts here..."
              rows={3}
              className="w-full bg-transparent text-sm text-gray-200 placeholder-gray-500 focus:outline-none resize-none"
            />
            <div className="flex justify-between items-center text-[11px] text-gray-500 mt-1">
              <span>Saved locally for your session practice</span>
              <span>{userNotes.trim().split(/\s+/).filter(Boolean).length} words</span>
            </div>
          </div>
        )}
      </div>

      {/* Answer Area */}
      {showAnswer ? (
        <div className="p-4 rounded-xl bg-gray-800/80 border border-gray-700/60 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Recommended Answer Strategy
            </span>
            {mode === 'mock' && (
              <button
                onClick={() => setRevealedInMock(false)}
                className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 transition"
              >
                <EyeOff className="w-3.5 h-3.5" /> Hide Answer
              </button>
            )}
          </div>
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
            {q.answer}
          </p>
        </div>
      ) : (
        <div className="p-5 rounded-xl bg-gray-950/40 border border-dashed border-gray-700 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-gray-400 mb-3 font-medium">
            🎯 Mock Mode active: Formulate your answer first before checking the model response.
          </p>
          <button
            onClick={() => setRevealedInMock(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 transition-all"
          >
            <Eye className="w-4 h-4" /> Reveal Suggested Answer
          </button>
        </div>
      )}
    </div>
  )
}

export default QuestionCard
