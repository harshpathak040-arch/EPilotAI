import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  User,
} from 'lucide-react';
import { ChatMessage, StudyMaterial } from '../types';

interface TutorViewProps {
  materials: StudyMaterial[];
  preselectedMaterialId?: string | null;
}

export const TutorView: React.FC<TutorViewProps> = ({
  materials,
  preselectedMaterialId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>(
    preselectedMaterialId || ''
  );
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    if (preselectedMaterialId) {
      setSelectedMaterialId(preselectedMaterialId);
    }
  }, [preselectedMaterialId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/tutor/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to load tutor history', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setIsSending(true);
    setChatError(null);

    // Optimistic user message insertion
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sessionId: 'session-default',
      role: 'user',
      content: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          materialId: selectedMaterialId || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to reach AI Tutor');
      }

      const aiMsg: ChatMessage = await res.json();
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, aiMsg]);
    } catch (err: any) {
      setChatError(err.message || 'Network error communicating with tutor');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8.5rem)] flex flex-col bg-[#0d1320] border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden">
      {/* Tutor Header & Material Context Selector */}
      <div className="p-4 px-6 border-b border-slate-800/80 bg-[#090d16] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">EPilot Socratic Mentor</h2>
              <span className="text-[11px] text-cyan-400 font-mono">gemini-3.8-flash</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Guided active recall and step-by-step reasoning support
            </p>
          </div>
        </div>

        {/* Study Context Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Note Context:</span>
          <select
            value={selectedMaterialId}
            onChange={(e) => setSelectedMaterialId(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 max-w-[200px] truncate"
          >
            <option value="">No document attached (General)</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Context Banner if selected */}
      {selectedMaterial && (
        <div className="px-6 py-2 bg-cyan-950/30 border-b border-cyan-800/30 text-xs text-cyan-300 flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">
              Grounding dialogue in <strong>{selectedMaterial.title}</strong>
            </span>
          </div>
          <button
            onClick={() => setSelectedMaterialId('')}
            className="text-[11px] text-cyan-400 hover:text-white shrink-0 ml-2"
          >
            Clear Context
          </button>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 p-6 overflow-y-auto space-y-5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-gradient-to-br from-cyan-600 to-blue-700 text-white shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#111827] border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[10px] mt-2 font-mono ${
                    isUser ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 rounded-tl-none">
              Formulating Socratic guidance...
            </div>
          </div>
        )}

        {chatError && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{chatError}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Inquiries / Prompt Shortcuts */}
      <div className="px-6 py-2 bg-[#090d16] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Quick Prompts:</span>
        </span>
        <button
          onClick={() =>
            handleQuickPrompt(
              'Test my understanding of the electron transport chain with a tricky question.'
            )
          }
          className="text-[11px] text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-md shrink-0 transition-colors"
        >
          &quot;Test my understanding&quot;
        </button>
        <button
          onClick={() =>
            handleQuickPrompt(
              'I am confused about how ATP synthase actually converts the proton gradient into mechanical rotation. Can you guide me?'
            )
          }
          className="text-[11px] text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-md shrink-0 transition-colors"
        >
          &quot;Explain mechanism step-by-step&quot;
        </button>
        <button
          onClick={() =>
            handleQuickPrompt('Give me a memorable analogy for Adam optimizer versus basic SGD.')
          }
          className="text-[11px] text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 px-2.5 py-1 rounded-md shrink-0 transition-colors"
        >
          &quot;Provide a conceptual analogy&quot;
        </button>
      </div>

      {/* Chat Input Field */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 px-6 bg-[#0a0e17] border-t border-slate-800 flex items-center gap-3"
      >
        <input
          type="text"
          placeholder="Ask a question or explain a concept for feedback..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isSending}
          className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isSending}
          className="p-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
