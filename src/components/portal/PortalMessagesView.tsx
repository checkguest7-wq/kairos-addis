import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare,
  Send,
  User,
  ShieldCheck,
  Clock,
  Sparkles,
  Bot,
  Headphones,
  Trash2,
  RefreshCw,
  Zap,
  Info,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { PortalMessage } from '../../types';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface PortalMessagesViewProps {
  messages: PortalMessage[];
  onRefresh: () => void;
  initialTopic?: string;
}

// Formatter for AI responses supporting bold, lists, and headers
const FormattedAiContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-sm font-bold text-cyan-300 mt-2 mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              {renderFormattedInline(trimmed.replace(/^###\s*/, ''))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-sm font-extrabold text-white mt-3 mb-1">
              {renderFormattedInline(trimmed.replace(/^##\s*/, ''))}
            </h3>
          );
        }

        // Bullet lists
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.replace(/^[•\-\*]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 my-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span className="flex-1">{renderFormattedInline(itemText)}</span>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 my-1">
              <span className="font-mono text-[11px] font-bold text-cyan-400 shrink-0">
                {numMatch[1]}.
              </span>
              <span className="flex-1">{renderFormattedInline(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderFormattedInline(trimmed)}</p>;
      })}
    </div>
  );
};

function renderFormattedInline(text: string): React.ReactNode {
  // Regex for **bold**, `code`, and links
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export const PortalMessagesView: React.FC<PortalMessagesViewProps> = ({
  messages: initialConciergeMessages,
  onRefresh,
  initialTopic,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ai' | 'concierge'>('ai');

  // Concierge State
  const [conciergeInput, setConciergeInput] = useState('');
  const [subject, setSubject] = useState(initialTopic || 'General Inquiry');
  const [isSendingConcierge, setIsSendingConcierge] = useState(false);
  const [conciergeError, setConciergeError] = useState<string | null>(null);

  // AI Assistant State
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState<PortalMessage[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  const quickAiPrompts = [
    'Tell me about BYD Tang L specs & battery',
    'Which EV is best for a family?',
    'How does the 8-year YouGuard warranty work?',
    'Compare Geely Galaxy E5 vs BYD Song Plus',
    'How do I charge an EV in Addis Ababa?',
    'What are the requirements to order a vehicle?',
    'Where is the Bole Wollo Sefer showroom located?',
    'What is my registered vehicle & warranty status?',
  ];

  const quickConciergeTopics = [
    'Order Status Inquiry',
    'Customs & Duty Clearance',
    'Warranty Claim Clarification',
    'Home Wallbox Installation',
    'Scheduled Service Question',
  ];

  // Load AI messages on mount
  useEffect(() => {
    fetchAiMessages();
  }, []);

  const fetchAiMessages = async () => {
    try {
      setIsLoadingAi(true);
      const res = await api.getAiMessages();
      if (res && Array.isArray(res.messages)) {
        setAiMessages(res.messages);
      }
    } catch (err: any) {
      console.warn('[LOAD AI MESSAGES ERROR]', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    if (initialTopic) {
      setSubject(initialTopic);
      setActiveTab('concierge');
    }
  }, [initialTopic]);

  useEffect(() => {
    if (activeTab === 'ai') {
      aiMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, initialConciergeMessages, isAiGenerating, activeTab]);

  // Handle AI Chat Submit
  const handleSendAiMessage = async (promptToSend?: string) => {
    const text = (promptToSend || aiInput).trim();
    if (!text || isAiGenerating) return;

    setAiError(null);
    setAiInput('');
    setIsAiGenerating(true);

    // Optimistic user message
    const tempUserMsg: PortalMessage = {
      id: `temp_u_${Date.now()}`,
      userId: user?.id || 'temp',
      sender: 'customer',
      senderName: user?.fullName || 'You',
      content: text,
      timestamp: new Date().toISOString(),
      read: true,
      channel: 'ai',
    };

    setAiMessages((prev) => [...prev, tempUserMsg]);

    try {
      // Build conversation history format for API
      const history = aiMessages.slice(-6).map((m) => ({
        role: (m.sender === 'ai' ? 'model' : 'user') as 'user' | 'model',
        text: m.content,
      }));

      const res = await api.portalAiChat(text, history);
      if (res && res.messages) {
        setAiMessages(res.messages);
      } else if (res && res.reply) {
        const tempAiMsg: PortalMessage = {
          id: `temp_ai_${Date.now()}`,
          userId: user?.id || 'temp',
          sender: 'ai',
          senderName: 'Kairos Addis AI',
          content: res.reply,
          timestamp: new Date().toISOString(),
          read: true,
          channel: 'ai',
        };
        setAiMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, tempAiMsg]);
      }
    } catch (err: any) {
      console.error('[AI CHAT ERROR]', err);
      setAiError(err.message || 'Failed to get response from Kairos Addis AI. Please retry.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Handle Clear AI Chat
  const handleClearAiChat = async () => {
    if (!window.confirm('Are you sure you want to clear your Kairos Addis AI conversation history?')) {
      return;
    }
    try {
      await api.clearAiMessages();
      setAiMessages([]);
    } catch (err: any) {
      console.error('[CLEAR AI CHAT ERROR]', err);
    }
  };

  // Handle Concierge Send
  const handleSendConciergeMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conciergeInput.trim() || isSendingConcierge) return;

    setConciergeError(null);
    setIsSendingConcierge(true);

    try {
      await api.sendMessage({
        subject,
        message: conciergeInput.trim(),
      });
      setConciergeInput('');
      onRefresh();
    } catch (err: any) {
      setConciergeError(err.message || 'Failed to send message to concierge.');
    } finally {
      setIsSendingConcierge(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Filter concierge messages to exclude AI channel
  const conciergeMessages = initialConciergeMessages.filter(
    (m) => m.channel !== 'ai' && m.sender !== 'ai'
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            INTELLIGENT CUSTOMER MESSAGING
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Messaging & AI Concierge
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Consult with <strong>Kairos Addis AI</strong> for instant vehicle specs, YouGuard warranty guidance, and EV technology, or message our human concierge desk.
          </p>
        </div>

        {/* Tab Selector Mode */}
        <div className="inline-flex p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            id="tab-select-ai-assistant"
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Kairos Addis AI</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </button>
          <button
            id="tab-select-concierge-desk"
            onClick={() => setActiveTab('concierge')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'concierge'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Concierge Desk</span>
          </button>
        </div>
      </div>

      {/* Mode A: Kairos Addis AI Assistant */}
      {activeTab === 'ai' && (
        <div className="bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px] relative">
          {/* AI Banner Topbar */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white">Kairos Addis Assistant</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-mono text-[10px] font-bold">
                    Official Website Assistant
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Electric Vehicles • YouGuard Warranty • Showroom & Customer Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-clear-ai-chat"
                onClick={handleClearAiChat}
                disabled={aiMessages.length === 0 || isAiGenerating}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-red-400 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40"
                title="Clear conversation history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear Chat</span>
              </button>
              <button
                onClick={fetchAiMessages}
                disabled={isLoadingAi}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Refresh messages"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick AI Prompts Bar */}
          <div className="px-4 py-2.5 bg-slate-950/70 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2 no-scrollbar">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Suggested:
            </span>
            {quickAiPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendAiMessage(prompt)}
                disabled={isAiGenerating}
                className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-900 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-all shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/40">
            {aiMessages.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-4 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                  <Bot className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-white">
                    Welcome to Kairos Addis AI Assistant
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Ask questions about our EV lineup (BYD Tang L, Geely Galaxy E5, BYD Song Plus), YouGuard 8-year warranty, charging solutions in Addis Ababa, or your current order and vehicle status.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2">
                  {quickAiPrompts.slice(0, 4).map((p) => (
                    <button
                      key={p}
                      onClick={() => handleSendAiMessage(p)}
                      className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group"
                    >
                      <div className="text-[11px] font-semibold text-slate-300 group-hover:text-cyan-300 leading-snug">
                        {p}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              aiMessages.map((msg) => {
                const isCustomer = msg.sender === 'customer';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-400">
                      {isCustomer ? (
                        <>
                          <span className="font-semibold text-slate-300">You</span>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-[10px] font-bold">
                            <Sparkles className="w-3 h-3" />
                            <span>Kairos Addis AI</span>
                          </div>
                          <span>•</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      )}
                    </div>

                    <div
                      className={`max-w-2xl p-4 rounded-2xl shadow-lg relative group ${
                        isCustomer
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {!isCustomer ? (
                        <div>
                          <FormattedAiContent content={msg.content} />
                          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                            <div className="flex items-center gap-1 text-slate-400 font-mono">
                              <ShieldCheck className="w-3 h-3 text-cyan-400" />
                              <span>Verified Kairos Addis Knowledge</span>
                            </div>
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                              title="Copy answer"
                            >
                              {copiedMsgId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}

            {/* AI Generating Indicator */}
            {isAiGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-start"
              >
                <div className="flex items-center gap-2 mb-1.5 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 text-[10px] font-bold">
                    <Sparkles className="w-3 h-3 animate-spin" />
                    <span>Kairos Addis AI</span>
                  </div>
                  <span>•</span>
                  <span className="text-[10px] text-cyan-400 animate-pulse">Thinking...</span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 text-slate-300 rounded-tl-none flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
                  </div>
                  <span className="text-xs text-slate-400">Analyzing vehicle specifications and database records...</span>
                </div>
              </motion.div>
            )}

            <div ref={aiMessagesEndRef} />
          </div>

          {/* AI Input Form */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
            {aiError && (
              <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{aiError}</span>
                </div>
                <button
                  onClick={() => handleSendAiMessage()}
                  className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-900 text-white font-bold text-[11px]"
                >
                  Retry
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendAiMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                id="input-portal-ai-prompt"
                type="text"
                placeholder="Ask Kairos Addis AI about models, YouGuard warranty, charging, specs..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                disabled={isAiGenerating}
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-60"
              />
              <button
                id="btn-send-portal-ai-prompt"
                type="submit"
                disabled={isAiGenerating || !aiInput.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 transition-all shrink-0"
              >
                <span>Ask AI</span>
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </form>
            <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
              <span>Strictly restricted to electric vehicles, specifications, and Kairos Addis services.</span>
              <span>Powered by Gemini 3.7 Flash</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode B: Human Concierge Desk */}
      {activeTab === 'concierge' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
          {/* Topic Selector Bar */}
          <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Inquiry Topic:</span>
            {quickConciergeTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSubject(topic)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  subject === topic
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-950/40">
            {conciergeMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-3">
                <MessageSquare className="w-12 h-12 mx-auto text-slate-600" />
                <h4 className="text-base font-bold text-white">No concierge inquiries yet</h4>
                <p className="text-xs max-w-sm mx-auto">
                  Send a ticket to our Bole Wollo Sefer concierge regarding vehicle imports, servicing, or warranty claims.
                </p>
              </div>
            ) : (
              conciergeMessages.map((msg) => {
                const isCustomer = msg.sender === 'customer' || (msg as any).senderRole === 'CUSTOMER';
                const messageText = msg.content || (msg as any).message || '';
                const messageSubject = (msg as any).subject;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">
                        {isCustomer ? 'You' : msg.senderName || 'Kairos Concierge'}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div
                      className={`max-w-xl p-4 rounded-2xl shadow-md space-y-1.5 ${
                        isCustomer
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {messageSubject && messageSubject !== 'General Inquiry' && (
                        <div
                          className={`text-[10px] font-extrabold uppercase tracking-wider ${
                            isCustomer ? 'text-cyan-200' : 'text-cyan-400'
                          }`}
                        >
                          Re: {messageSubject}
                        </div>
                      )}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{messageText}</p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendConciergeMessage} className="p-4 bg-slate-950 border-t border-slate-800 space-y-2">
            {conciergeError && <div className="text-xs text-red-400 px-2">{conciergeError}</div>}

            <div className="flex items-center gap-3">
              <input
                id="input-portal-concierge-message"
                type="text"
                placeholder={`Message concierge desk regarding "${subject}"...`}
                value={conciergeInput}
                onChange={(e) => setConciergeInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                id="btn-send-portal-message"
                type="submit"
                disabled={isSendingConcierge || !conciergeInput.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] disabled:opacity-50 transition-all"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
