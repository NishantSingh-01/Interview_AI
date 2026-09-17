import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2, Minimize2, ChevronDown } from 'lucide-react'
import { sendChatMessage } from '../services/interview.api'

const QUICK_PROMPTS = [
  "How to use the STAR method for behavioral answers?",
  "Give me tips to address my skill gaps during the interview",
  "What are high-impact questions to ask the interviewer?",
  "How should I introduce myself in the first 2 minutes?"
]

const AICoachDrawer = ({ reportTitle }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: `Hello! I'm your AI Interview Coach. I'm ready to help you practice questions, refine answers, or strategize for ${reportTitle ? `"${reportTitle}"` : 'your interview'}. Ask me anything!`
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSendMessage = async (textToSend) => {
    const query = (typeof textToSend === 'string' ? textToSend : input).trim()
    if (!query || isLoading) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: query
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await sendChatMessage(query)
      const assistantText = res?.reply || res?.message || "I couldn't process that response. Please try asking in a different way."
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: assistantText
        }
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: "Sorry, I had trouble connecting to the interview coach server. Please check your connection or try again shortly."
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-medium shadow-2xl hover:shadow-purple-500/25 hover:scale-105 active:scale-95 transition-all duration-300 border border-purple-400/30 group"
          aria-label="Open AI Interview Coach"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse ring-2 ring-gray-900" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Ask AI Coach</span>
          <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '8s' }} />
        </button>
      )}

      {/* Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 shadow-2xl flex flex-col transition-all duration-300 animate-in slide-in-from-right">
          {/* Header */}
          <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-gray-900 to-gray-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white text-base">AI Interview Coach</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live
                  </span>
                </div>
                <p className="text-xs text-gray-400">Mock questions, feedback & strategies</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                title="Close Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-4 py-3 border-b border-gray-800/60 bg-gray-950/40">
            <p className="text-[11px] uppercase tracking-wider text-purple-300/70 font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" /> Quick Prompts
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="text-xs whitespace-nowrap px-3 py-1.5 rounded-lg bg-gray-800/80 hover:bg-purple-900/40 border border-gray-700/60 hover:border-purple-500/40 text-gray-300 hover:text-white transition flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-purple-300" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-purple-600/10'
                        : 'bg-gray-800/90 border border-gray-700/60 text-gray-200 rounded-tl-none whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-lg bg-blue-600/30 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-blue-300" />
                    </div>
                  )}
                </div>
              )
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-purple-300" />
                </div>
                <div className="bg-gray-800/90 border border-gray-700/60 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Thinking & formulating guidance...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-800 bg-gray-950/60">
            <div className="relative flex items-center">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask advice, practice an answer, or get feedback..."
                rows={2}
                className="w-full pl-3.5 pr-12 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || isLoading}
                className={`absolute right-2.5 p-2 rounded-lg transition-all ${
                  input.trim() && !isLoading
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                    : 'text-gray-500 bg-gray-700/40 cursor-not-allowed'
                }`}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-2 text-[11px] text-gray-500 text-center">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default AICoachDrawer
