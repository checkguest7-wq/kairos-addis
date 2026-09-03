import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  User,
  Clock,
  Bot,
  RefreshCw,
  Trash2,
  AlertTriangle,
  X,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api';

export const AdminMessagesView: React.FC = () => {
  const [threads, setThreads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Deletion modal state
  const [contactToDelete, setContactToDelete] = useState<{ id: string; fullName: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Responsive mobile view state
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Scroll references
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const fetchMessages = async (maintainSelection = true) => {
    setIsLoading(true);
    try {
      const res = await api.adminGetMessages();
      const loadedThreads = res.threads || [];
      setThreads(loadedThreads);

      if (maintainSelection && selectedUserId) {
        const stillExists = loadedThreads.some((t: any) => t.user.id === selectedUserId);
        if (!stillExists) {
          setSelectedUserId(loadedThreads.length > 0 ? loadedThreads[0].user.id : null);
        }
      } else if (loadedThreads.length > 0 && !selectedUserId) {
        setSelectedUserId(loadedThreads[0].user.id);
      }
    } catch (err: any) {
      console.error('[FETCH MESSAGES ERROR]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(false);
  }, []);

  const activeThread = threads.find((t) => t.user.id === selectedUserId);

  // Auto-scroll to bottom of message feed when thread or messages change
  useEffect(() => {
    if (activeThread && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedUserId, activeThread?.messages?.length]);

  const handleSelectThread = (userId: string) => {
    setSelectedUserId(userId);
    setShowMobileChat(true);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !replyText.trim() || isSending) return;

    setIsSending(true);
    try {
      await api.adminReplyMessage({
        userId: selectedUserId,
        content: replyText.trim(),
      });
      setReplyText('');
      await fetchMessages(true);

      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      alert(err.message || 'Failed to send reply.');
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    const targetId = contactToDelete.id;
    const targetName = contactToDelete.fullName;

    setIsDeleting(true);
    try {
      await api.adminDeleteContact(targetId);

      // Immediately update local threads state
      const remainingThreads = threads.filter((t) => t.user.id !== targetId);
      setThreads(remainingThreads);

      if (selectedUserId === targetId) {
        if (remainingThreads.length > 0) {
          setSelectedUserId(remainingThreads[0].user.id);
        } else {
          setSelectedUserId(null);
          setShowMobileChat(false);
        }
      }

      setContactToDelete(null);
      setActionNotice(`Contact "${targetName}" and conversation were successfully removed.`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete contact and conversation.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredThreads = threads.filter(
    (t) =>
      t.user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="admin-messages-view" className="space-y-6 animate-fadeIn">
      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          id="messaging-action-notice"
          className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-serif font-bold text-white tracking-wide flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            Executive Concierge Messaging
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            Live dialogue stream between clients, Kairos Addis AI, and executive concierge advisors.
          </p>
        </div>

        <button
          id="refresh-inbox-btn"
          onClick={() => fetchMessages(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs flex items-center gap-2 transition-colors self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Inbox
        </button>
      </div>

      {/* Two-Column Chat App Container */}
      <div
        id="messaging-app-card"
        className="h-[680px] rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl overflow-hidden flex flex-col md:grid md:grid-cols-3"
      >
        {/* Left Column: Threads / Contacts List */}
        <div
          id="messaging-contacts-sidebar"
          className={`border-r border-slate-800 flex flex-col bg-slate-950/70 h-full min-h-0 ${
            showMobileChat ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Contacts Search Bar */}
          <div className="p-3.5 border-b border-slate-800 shrink-0">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="search-contacts-input"
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-800 focus:border-amber-500 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Contacts List Body */}
          <div
            id="messaging-contacts-list"
            className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar overscroll-contain"
          >
            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 h-40">
                <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
                <span>Loading conversations...</span>
              </div>
            ) : filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2 h-48">
                <MessageSquare className="w-8 h-8 text-slate-600 mb-1" />
                <span className="font-medium text-slate-300">No conversations yet.</span>
                <span className="text-[11px] text-slate-500 max-w-xs">
                  Client inquiries and interactions with the Kairos AI concierge will appear here.
                </span>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = selectedUserId === thread.user.id;
                const lastMessage = thread.messages[thread.messages.length - 1];

                return (
                  <div
                    key={thread.user.id}
                    id={`contact-thread-${thread.user.id}`}
                    onClick={() => handleSelectThread(thread.user.id)}
                    className={`group w-full p-3.5 text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/10 border-l-4 border-amber-500 shadow-inner'
                        : 'hover:bg-slate-800/40 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0 mt-0.5 shadow-sm">
                        {thread.user.fullName?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-white text-xs truncate">
                            {thread.user.fullName || 'Unnamed Client'}
                          </span>
                          {thread.unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {lastMessage ? lastMessage.content : 'No messages yet'}
                        </p>
                        {lastMessage?.timestamp && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>
                              {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Delete Contact Button */}
                    <button
                      id={`delete-contact-btn-${thread.user.id}`}
                      type="button"
                      title="Delete contact and conversation"
                      onClick={(e) => {
                        e.stopPropagation();
                        setContactToDelete(thread.user);
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 mt-0.5 opacity-60 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Chat Window & Message Feed */}
        <div
          id="messaging-chat-window"
          className={`md:col-span-2 flex flex-col bg-slate-900/90 h-full min-h-0 ${
            showMobileChat ? 'flex' : 'hidden md:flex'
          }`}
        >
          {activeThread ? (
            <>
              {/* Active Conversation Header */}
              <div
                id="messaging-chat-header"
                className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    id="mobile-back-to-contacts-btn"
                    onClick={() => setShowMobileChat(false)}
                    className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
                    title="Back to conversations list"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="w-9 h-9 rounded-xl bg-slate-800 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-xs shrink-0 shadow-sm">
                    {activeThread.user.fullName?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                      {activeThread.user.fullName}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                      {activeThread.user.email} · {activeThread.user.phone || 'No phone'}
                    </p>
                  </div>
                </div>

                {/* Header Delete Contact Button */}
                <button
                  id="header-delete-contact-btn"
                  type="button"
                  onClick={() => setContactToDelete(activeThread.user)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1.5 transition-colors shrink-0"
                  title="Delete this contact and conversation"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete Contact</span>
                </button>
              </div>

              {/* Messages Vertical Scroll Feed */}
              <div
                ref={messagesContainerRef}
                id="admin-messages-scroll-feed"
                tabIndex={0}
                className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 custom-scrollbar overscroll-contain focus:outline-none"
                style={{ touchAction: 'pan-y' }}
              >
                {activeThread.messages.length === 0 ? (
                  <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-slate-400 text-xs italic gap-1">
                    <MessageSquare className="w-8 h-8 text-slate-600 mb-1 not-italic" />
                    <span>No messages yet.</span>
                    <span className="text-[11px] text-slate-500 not-italic">
                      Send a message below to reach out to {activeThread.user.fullName}.
                    </span>
                  </div>
                ) : (
                  activeThread.messages.map((msg: any) => {
                    const isAdmin = msg.sender === 'admin' || msg.sender === 'support';
                    const isAi = msg.sender === 'ai';
                    const isCustomer = !isAdmin && !isAi;

                    return (
                      <div
                        key={msg.id}
                        id={`msg-bubble-${msg.id}`}
                        className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-md p-3.5 rounded-2xl text-xs space-y-1.5 shadow-md ${
                            isAdmin
                              ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                              : isAi
                              ? 'bg-slate-900 text-slate-100 rounded-bl-none border border-cyan-500/30 shadow-cyan-950/20'
                              : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 text-[10px] opacity-85 pb-0.5 border-b border-black/10 dark:border-white/10">
                            <div className="flex items-center gap-1.5 font-bold truncate">
                              {isAdmin ? (
                                <span>Kairos Concierge Advisor</span>
                              ) : isAi ? (
                                <span className="flex items-center gap-1 text-cyan-300">
                                  <Bot className="w-3 h-3" /> Kairos Addis AI
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-slate-300">
                                  <User className="w-3 h-3" /> {msg.senderName || activeThread.user.fullName}
                                </span>
                              )}
                            </div>
                            <span className="shrink-0 text-[9px] font-mono">
                              {msg.timestamp
                                ? new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })
                                : ''}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} className="h-0" />
              </div>

              {/* Reply Form */}
              <form
                id="admin-reply-form"
                onSubmit={handleSendReply}
                className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2 shrink-0"
              >
                <input
                  id="admin-reply-input"
                  type="text"
                  placeholder={`Reply directly to ${activeThread.user.fullName}...`}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  disabled={isSending}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors disabled:opacity-50"
                />
                <button
                  id="send-reply-btn"
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-md shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            </>
          ) : (
            <div
              id="no-thread-selected-placeholder"
              className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-400 text-xs p-8 text-center gap-2"
            >
              <MessageSquare className="w-10 h-10 text-slate-700 mb-1" />
              <span className="font-medium text-slate-300">Select a conversation to view chat history.</span>
              <span className="text-slate-500 text-[11px] max-w-sm">
                Choose a client on the left to read messages exchanged between the client and Kairos Addis AI, or write an executive reply.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Delete Contact & Conversation Confirmation Modal */}
      {contactToDelete && (
        <div
          id="delete-contact-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => !isDeleting && setContactToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  Delete this contact and conversation?
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <strong className="text-slate-200">{contactToDelete.fullName}</strong>?
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="text-slate-300 font-medium">Scoped Removal Guarantee:</p>
              <p>• Permanently removes this contact and their conversation history with the AI and concierge.</p>
              <p>• Associated messaging records belonging ONLY to this contact will be deleted.</p>
              <p className="text-amber-400/90">• Other customer records, vehicle orders, and warranties remain completely safe and untouched.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="cancel-delete-btn"
                type="button"
                disabled={isDeleting}
                onClick={() => setContactToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="confirm-delete-btn"
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-lg"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
