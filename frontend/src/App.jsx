import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Bot,
  User,
  TrendingUp,
  Loader2,
  Sparkles,
  MessageSquareText,
} from 'lucide-react';

const API_URL = 'http://localhost:8000/chat';

const SUGGESTED_QUERIES = [
  'Phân tích doanh thu của FPT trong năm 2023',
  'So sánh biên lợi nhuận gộp qua các năm',
  'Đánh giá cấu trúc tài sản và nợ phải trả',
  'Phân tích dòng tiền từ hoạt động kinh doanh',
];

/* ─────────────────────────────────────────────
   Typing Indicator
   ───────────────────────────────────────────── */
function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
        <Bot size={16} className="text-white" />
      </div>
      {/* Dots */}
      <div className="bg-surface-800/80 border border-white/[0.06] rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-dot" style={{ animationDelay: '0s' }} />
        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
        <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
        <span className="ml-2 text-sm text-slate-400">Analyzing...</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Chat Bubble
   ───────────────────────────────────────────── */
function ChatBubble({ role, content }) {
  const isUser = role === 'user';

  return (
    <div className={`flex items-start gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
            : 'bg-gradient-to-br from-brand-500 to-brand-700 shadow-brand-500/20'
        }`}
      >
        {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3.5 ${
          isUser
            ? 'bg-gradient-to-br from-emerald-600/90 to-teal-700/90 text-white rounded-tr-sm'
            : 'bg-surface-800/80 border border-white/[0.06] text-slate-200 rounded-tl-sm'
        }`}
      >
        {isUser ? (
          <p className="text-[0.94rem] leading-relaxed">{content}</p>
        ) : (
          <div className="prose-ai text-[0.94rem]">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Welcome Screen
   ───────────────────────────────────────────── */
function WelcomeScreen({ onSuggestionClick }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
      {/* Hero icon */}
      <div className="relative mb-6">
        <div className="absolute inset-0 blur-3xl bg-brand-500/20 rounded-full scale-150" />
        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-2xl shadow-brand-500/30">
          <TrendingUp size={36} className="text-white" />
        </div>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">FinRAG Analyst</h1>
      <p className="text-slate-400 text-center max-w-md mb-10 leading-relaxed">
        AI-powered financial report analysis. Ask me anything about FPT's financial data — revenue, margins, cash flows, and more.
      </p>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
        {SUGGESTED_QUERIES.map((q, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(q)}
            className="group text-left px-4 py-3.5 rounded-xl border border-white/[0.06] bg-surface-800/50 hover:bg-surface-700/60 hover:border-brand-500/30 transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-start gap-2.5">
              <Sparkles size={15} className="text-brand-400 mt-0.5 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors leading-snug">{q}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   App
   ───────────────────────────────────────────── */
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async (queryText) => {
    const trimmed = (queryText ?? input).trim();
    if (!trimmed || isLoading) return;

    // Append user message
    const userMsg = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data } = await axios.post(API_URL, { query: trimmed });
      const aiMsg = { role: 'ai', content: data.response };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'ai',
        content:
          '⚠️ **Connection error.** Please make sure the FastAPI backend is running on `http://localhost:8000` and try again.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      // Re-focus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestion = (q) => {
    setInput(q);
    sendMessage(q);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="h-screen flex flex-col bg-surface-900 overflow-hidden">
      {/* ── Header ── */}
      <header className="flex-shrink-0 border-b border-white/[0.06] bg-surface-900/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-3 px-5 py-3.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-white leading-tight tracking-tight">FinRAG</h1>
            <p className="text-xs text-slate-500">Financial AI Analyst</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-surface-800/60 px-2.5 py-1 rounded-full border border-white/[0.04]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Llama 3.3 · 70B
            </span>
          </div>
        </div>
      </header>

      {/* ── Messages Area ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full h-full flex flex-col px-5 py-6">
          {isEmpty ? (
            <WelcomeScreen onSuggestionClick={handleSuggestion} />
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((msg, i) => (
                <ChatBubble key={i} role={msg.role} content={msg.content} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* ── Input Bar ── */}
      <footer className="flex-shrink-0 border-t border-white/[0.06] bg-surface-900/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto w-full px-5 py-4">
          <div className="flex items-end gap-3 bg-surface-800/70 border border-white/[0.08] rounded-2xl px-4 py-2.5 focus-within:border-brand-500/40 focus-within:shadow-lg focus-within:shadow-brand-500/5 transition-all duration-200">
            <MessageSquareText size={20} className="text-slate-500 mb-1 flex-shrink-0" />
            <textarea
              ref={inputRef}
              id="chat-input"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about FPT's financial reports..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-white text-[0.94rem] placeholder-slate-500 outline-none resize-none max-h-32 leading-relaxed disabled:opacity-50"
              style={{ minHeight: '1.7rem' }}
            />
            <button
              id="send-button"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 disabled:opacity-30 disabled:shadow-none transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
          <p className="text-center text-[0.7rem] text-slate-600 mt-2.5">
            FinRAG uses Llama 3.3 70B via Groq · Retrieval from Qdrant Cloud · Responses may contain inaccuracies
          </p>
        </div>
      </footer>
    </div>
  );
}
