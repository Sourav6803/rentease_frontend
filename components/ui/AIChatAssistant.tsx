
'use client'

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Package,
  Truck,
  DollarSign,
  Clock,
  ChevronRight,
  Wifi,
  WifiOff,
  RotateCcw,
  Paperclip,
  Smile,
} from 'lucide-react'
import axios from 'axios'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string
  type: 'user' | 'bot' | 'system'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
  suggestions?: string[]
  quickReplies?: string[]
}

interface ChatState {
  isOpen: boolean
  isMinimized: boolean
  isMuted: boolean
  isOnline: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

const SUGGESTED_QUESTIONS = [
  'How do I rent a product?',
  'What is the return policy?',
  'How does delivery work?',
  'Payment methods available?',
  'How to become a vendor?',
  "What's your cancellation policy?",
]

const QUICK_ACTIONS = [
  { icon: Package, label: 'Track Order', action: 'track my order' },
  { icon: Truck, label: 'Delivery', action: 'check delivery status' },
  { icon: DollarSign, label: 'Payment', action: 'payment issue' },
  { icon: Clock, label: 'Rental Info', action: 'how long can I rent' },
]

// ─── Fallback Responses ────────────────────────────────────────────────────────

function getFallbackResponse(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('rent') || m.includes('product'))
    return "Great question! Browse our products page to explore flexible rental plans from 3–12 months. Want help finding something specific?"
  if (m.includes('track') || m.includes('order'))
    return "Head to **My Rentals** in your account dashboard for real-time order tracking. Need help accessing your account?"
  if (m.includes('return') || m.includes('policy'))
    return "We offer a **7-day return window** on most products. Rentals can be cancelled within 24 hours of delivery for a full refund. Want the full details?"
  if (m.includes('payment'))
    return "We accept **Credit/Debit cards, UPI, NetBanking, and EMI**. All transactions are encrypted and secure. How can I assist you further?"
  if (m.includes('vendor') || m.includes('sell'))
    return "Becoming a vendor takes just minutes! Click **Become a Vendor** in the navigation bar, complete the form, and expect a review within 2–3 business days."
  if (m.includes('deliver'))
    return "We deliver to **500+ cities** across India. Standard delivery takes 2–4 business days. Express delivery is available in select locations."
  if (m.includes('cancel'))
    return "Cancellations made **24 hours before delivery** are fully refunded. After delivery, a pro-rated refund applies. Need help cancelling an order?"
  return "Thanks for reaching out! I'm here to help with anything related to renting, orders, payments, or vendor queries. What would you like to know?"
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="chat-bubble-bot flex items-center gap-1 px-4 py-3">
        <span className="typing-dot" style={{ animationDelay: '0ms' }} />
        <span className="typing-dot" style={{ animationDelay: '160ms' }} />
        <span className="typing-dot" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  onSuggestionClick,
  onCopy,
  copiedId,
}: {
  message: Message
  onSuggestionClick: (text: string) => void
  onCopy: (content: string, id: string) => void
  copiedId: string | null
}) {
  const isUser = message.type === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center shrink-0 shadow-md">
          <span className="text-xs font-bold text-white">U</span>
        </div>
      )}

      <div className={`flex flex-col gap-1.5 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Meta row */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-slate-400 tabular-nums">{formatTime(message.timestamp)}</span>
          {isUser && message.status === 'sending' && (
            <span className="text-[10px] text-slate-400">Sending…</span>
          )}
          {isUser && message.status === 'error' && (
            <span className="text-[10px] text-red-400 flex items-center gap-1">
              <WifiOff className="h-2.5 w-2.5" /> Failed
            </span>
          )}
          {!isUser && (
            <button
              onClick={() => onCopy(message.content, message.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Copy message"
            >
              {copiedId === message.id ? (
                <Check className="h-3 w-3 text-emerald-500" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </button>
          )}
        </div>

        {/* Suggestion chips */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(s)}
                className="suggestion-chip"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Quick reply pills */}
        {message.quickReplies && message.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {message.quickReplies.map((r, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(r)}
                className="quick-reply-pill"
              >
                {r} <ChevronRight className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AIChatAssistant() {
  const [chatState, setChatState] = useState<ChatState>({
    isOpen: false,
    isMinimized: false,
    isMuted: false,
    isOnline: true,
  })

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: "👋 Hi there! I'm your **RentEase assistant** — powered by AI and available 24/7. How can I help you today?",
      timestamp: new Date(),
      status: 'sent',
      suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
      quickReplies: ['Rent a product', 'Track order', 'Contact support'],
    },
  ])

  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (chatState.isOpen && !chatState.isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setUnreadCount(0)
    }
  }, [chatState.isOpen, chatState.isMinimized])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Track online status
  useEffect(() => {
    const handleOnline = () => setChatState(s => ({ ...s, isOnline: true }))
    const handleOffline = () => setChatState(s => ({ ...s, isOnline: false }))
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openChat = useCallback(() => {
    setChatState(s => ({ ...s, isOpen: true, isMinimized: false }))
    setUnreadCount(0)
  }, [])

  const closeChat = useCallback(() => {
    setChatState(s => ({ ...s, isOpen: false }))
  }, [])

  const toggleMinimize = useCallback(() => {
    setChatState(s => ({ ...s, isMinimized: !s.isMinimized }))
  }, [])

  const toggleMute = useCallback(() => {
    setChatState(s => ({ ...s, isMuted: !s.isMuted }))
  }, [])

  const clearChat = useCallback(() => {
    setMessages([{
      id: 'welcome-reset',
      type: 'bot',
      content: "Chat cleared! How can I help you?",
      timestamp: new Date(),
      status: 'sent',
      suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
    }])
  }, [])

  const copyMessage = useCallback((content: string, id: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }, [])

  // Add this helper function in your AIChatAssistant component
  function extractOrderIdFromMessage(message: string): string | null {
    // Common order ID patterns
    const patterns = [
      /order\s*(?:id|number|#)?\s*:?\s*([A-Z0-9]{6,12})/i,
      /track\s+(?:order\s+)?([A-Z0-9]{6,12})/i,
      /#([A-Z0-9]{6,12})/,
      /([A-Z]{3}\d{6})/ // e.g., ORD123456
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  }

  // const sendMessage = useCallback(async (text: string) => {
  //   const trimmed = text.trim()
  //   if (!trimmed || isTyping) return

  //   const msgId = generateId()
  //   const userMsg: Message = {
  //     id: msgId,
  //     type: 'user',
  //     content: trimmed,
  //     timestamp: new Date(),
  //     status: 'sending',
  //   }

  //   setMessages(prev => [...prev, userMsg])
  //   setInputValue('')
  //   setIsTyping(true)

  //   // Mark as sent
  //   setTimeout(() => {
  //     setMessages(prev =>
  //       prev.map(m => m.id === msgId ? { ...m, status: 'sent' } : m)
  //     )
  //   }, 300)

  //   try {
  //     const response = await axios.post(
  //       `${BASE_URL}/api/v1/ai/chat`,
  //       {
  //         message: trimmed,
  //         context: messages.slice(-6).map(m => ({ role: m.type, content: m.content })),
  //       },
  //       { timeout: 12000 }
  //     )

  //     const botMsg: Message = {
  //       id: generateId(),
  //       type: 'bot',
  //       content: response.data.reply || getFallbackResponse(trimmed),
  //       timestamp: new Date(),
  //       status: 'sent',
  //       suggestions: response.data.suggestions,
  //       quickReplies: response.data.quickReplies,
  //     }

  //     setMessages(prev => [...prev, botMsg])

  //     if (!chatState.isMuted) {
  //       const audio = new Audio('/sounds/message.mp3')
  //       audio.volume = 0.25
  //       audio.play().catch(() => {})
  //     }

  //     if (!chatState.isOpen || chatState.isMinimized) {
  //       setUnreadCount(c => c + 1)
  //     }
  //   } catch {
  //     // Use fallback silently
  //     const fallbackMsg: Message = {
  //       id: generateId(),
  //       type: 'bot',
  //       content: getFallbackResponse(trimmed),
  //       timestamp: new Date(),
  //       status: 'sent',
  //       suggestions: SUGGESTED_QUESTIONS.slice(0, 3),
  //     }
  //     setMessages(prev => [...prev, fallbackMsg])
  //   } finally {
  //     setIsTyping(false)
  //   }
  // }, [isTyping, messages, chatState.isMuted, chatState.isOpen, chatState.isMinimized])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isTyping) return;

      // Check if this is an order tracking request without ID
      const isTrackingRequest = /track|order status|where is my order/i.test(
        trimmed,
      );
      const orderId = extractOrderIdFromMessage(trimmed);

      let finalMessage = trimmed;

      // Proactively ask for order ID if missing
      if (isTrackingRequest && !orderId) {
        const askForOrderIdMsg: Message = {
          id: generateId(),
          type: "bot",
          content:
            "I'd be happy to help track your order! Could you please provide your order ID? It looks like ORD123456 or similar format.",
          timestamp: new Date(),
          status: "sent",
          quickReplies: ["I have ORD123456", "I need help finding my order ID"],
        };
        setMessages((prev) => [...prev, askForOrderIdMsg]);
        return;
      }

      const msgId = generateId();
      const userMsg: Message = {
        id: msgId,
        type: "user",
        content: finalMessage,
        timestamp: new Date(),
        status: "sending",
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      setIsTyping(true);

      // Rest of your existing sendMessage logic...
      try {
        const response = await axios.post(
          `${BASE_URL}/api/v1/ai/chat`,
          {
            message: finalMessage,
            context: messages
              .slice(-6)
              .map((m) => ({
                role: m.type === "user" ? "user" : "assistant",
                content: m.content,
              })),
            userId: localStorage.getItem("userId"), // Optional: for personalization
          },
          { timeout: 15000 },
        );

        const botMsg: Message = {
          id: generateId(),
          type: "bot",
          content: response.data.reply || getFallbackResponse(trimmed),
          timestamp: new Date(),
          status: "sent",
          suggestions: response.data.suggestions,
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (error) {
        console.error("Chat error:", error);
        // Show user-friendly error
        const errorMsg: Message = {
          id: generateId(),
          type: "bot",
          content:
            "I'm having trouble connecting right now. Please check your internet or try again in a moment.",
          timestamp: new Date(),
          status: "sent",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [
      isTyping,
      messages,
      chatState.isMuted,
      chatState.isOpen,
      chatState.isMinimized,
    ],
  );

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }, [inputValue, sendMessage])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Styles ── */}
      <style>{`
        .chat-bubble-user {
          background: linear-gradient(135deg, #6d28d9, #4f46e5);
          color: white;
          border-radius: 18px 18px 4px 18px;
          padding: 10px 14px;
          box-shadow: 0 2px 12px rgba(109,40,217,0.35);
        }
        .chat-bubble-bot {
          background: #f1f5f9;
          color: #1e293b;
          border-radius: 18px 18px 18px 4px;
          padding: 10px 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .dark .chat-bubble-bot {
          background: #1e293b;
          color: #e2e8f0;
        }
        .suggestion-chip {
          font-size: 11px;
          padding: 5px 10px;
          border-radius: 99px;
          background: #ede9fe;
          color: #6d28d9;
          border: 1px solid #ddd6fe;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .suggestion-chip:hover {
          background: #ddd6fe;
        }
        .dark .suggestion-chip {
          background: #2e1065;
          color: #c4b5fd;
          border-color: #4c1d95;
        }
        .quick-reply-pill {
          font-size: 11px;
          padding: 5px 12px;
          border-radius: 99px;
          border: 1.5px solid #6d28d9;
          color: #6d28d9;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 2px;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .quick-reply-pill:hover {
          background: #6d28d9;
          color: white;
        }
        .dark .quick-reply-pill {
          border-color: #7c3aed;
          color: #a78bfa;
        }
        .typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #94a3b8;
          display: inline-block;
          animation: bounce-dot 1.1s infinite ease-in-out;
        }
        @keyframes bounce-dot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        .chat-scroll {
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }
        .dark .chat-scroll::-webkit-scrollbar-thumb { background: #334155; }
        .input-ring:focus {
          outline: none;
          box-shadow: 0 0 0 2.5px #6d28d9;
        }
        @media (max-width: 480px) {
          .chat-window {
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            width: 100% !important;
            border-radius: 20px 20px 0 0 !important;
          }
        }
      `}</style>

      {/* ── FAB ── */}
      <AnimatePresence>
        {!chatState.isOpen && (
          <motion.button
            key="fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.93 }}
            onClick={openChat}
            aria-label="Open chat assistant"
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: 'linear-gradient(135deg, #6d28d9, #4f46e5)' }}
          >
            <MessageCircle className="h-6 w-6 text-white" />

            {/* Online dot */}
            <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white shadow-sm" />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -left-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Chat Window ── */}
      <AnimatePresence>
        {chatState.isOpen && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="chat-window fixed z-[9999] flex flex-col overflow-hidden shadow-2xl"
            style={{
              bottom: '24px',
              right: '24px',
              width: '380px',
              maxWidth: 'calc(100vw)',
              height: chatState.isMinimized ? 'auto' : '600px',
              maxHeight: chatState.isMinimized ? 'auto' : 'calc(100vh - 100px)',
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
            }}
          >
            {/* ── Header ── */}
            <div
              className="shrink-0 px-4 py-3.5 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg, #5b21b6, #4338ca)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-inner">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm tracking-wide">RentEase AI</span>
                    {chatState.isOnline ? (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-medium">
                        <Wifi className="h-2.5 w-2.5" /> Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] text-red-300 font-medium">
                        <WifiOff className="h-2.5 w-2.5" /> Offline
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/60">Typically replies instantly</p>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <HeaderButton onClick={clearChat} aria-label="Clear chat">
                  <RotateCcw className="h-3.5 w-3.5" />
                </HeaderButton>
                <HeaderButton onClick={toggleMute} aria-label={chatState.isMuted ? 'Unmute' : 'Mute'}>
                  {chatState.isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </HeaderButton>
                <HeaderButton onClick={toggleMinimize} aria-label={chatState.isMinimized ? 'Expand' : 'Minimize'}>
                  {chatState.isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                </HeaderButton>
                <HeaderButton onClick={closeChat} aria-label="Close chat">
                  <X className="h-3.5 w-3.5" />
                </HeaderButton>
              </div>
            </div>

            {/* ── Body (hidden when minimized) ── */}
            <AnimatePresence initial={false}>
              {!chatState.isMinimized && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1, flex: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col min-h-0 flex-1"
                  style={{ overflow: 'hidden' }}
                >
                  {/* Messages */}
                  <div
                    ref={scrollAreaRef}
                    className="chat-scroll flex-1 px-4 py-4 space-y-4 overflow-y-auto"
                    style={{ minHeight: 0 }}
                  >
                    {messages.map(msg => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        onSuggestionClick={sendMessage}
                        onCopy={copyMessage}
                        copiedId={copiedId}
                      />
                    ))}
                    {isTyping && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Actions */}
                  <div className="shrink-0 px-4 pt-2 pb-1 border-t border-slate-100">
                    <div
                      className="flex gap-2 overflow-x-auto pb-1"
                      style={{ scrollbarWidth: 'none' }}
                    >
                      {QUICK_ACTIONS.map((a, i) => {
                        const Icon = a.icon
                        return (
                          <button
                            key={i}
                            onClick={() => sendMessage(a.action)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0"
                            style={{
                              background: '#f1f5f9',
                              color: '#475569',
                              border: '1px solid #e2e8f0',
                            }}
                            onMouseEnter={e => {
                              ;(e.currentTarget as HTMLElement).style.background = '#ede9fe'
                              ;(e.currentTarget as HTMLElement).style.color = '#6d28d9'
                              ;(e.currentTarget as HTMLElement).style.borderColor = '#ddd6fe'
                            }}
                            onMouseLeave={e => {
                              ;(e.currentTarget as HTMLElement).style.background = '#f1f5f9'
                              ;(e.currentTarget as HTMLElement).style.color = '#475569'
                              ;(e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'
                            }}
                          >
                            <Icon className="h-3 w-3" />
                            {a.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Input Bar */}
                  <div className="shrink-0 px-4 pt-2.5 pb-3 border-t border-slate-100">
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-xl"
                      style={{ border: '1.5px solid #e2e8f0', background: '#f8fafc' }}
                    >
                      <input
                        ref={inputRef}
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me anything…"
                        className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none"
                        disabled={isTyping}
                        maxLength={1000}
                        aria-label="Type your message"
                      />
                      <button
                        onClick={() => sendMessage(inputValue)}
                        disabled={!inputValue.trim() || isTyping}
                        aria-label="Send message"
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: inputValue.trim() && !isTyping
                            ? 'linear-gradient(135deg, #6d28d9, #4f46e5)'
                            : '#e2e8f0',
                        }}
                      >
                        <Send
                          className="h-3.5 w-3.5"
                          style={{ color: inputValue.trim() && !isTyping ? 'white' : '#94a3b8' }}
                        />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                      AI responses may not always be accurate · <a href="#" className="underline hover:text-violet-500">Help</a>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ── Tiny helper component ──────────────────────────────────────────────────────

function HeaderButton({
  onClick,
  children,
  'aria-label': ariaLabel,
}: {
  onClick: () => void
  children: React.ReactNode
  'aria-label': string
}) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="w-7 h-7 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
    >
      {children}
    </button>
  )
}