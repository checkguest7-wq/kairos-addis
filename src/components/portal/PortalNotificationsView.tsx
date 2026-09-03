import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, CheckCheck, ShieldCheck, Wrench, Calendar, Sparkles, Check } from 'lucide-react';
import { NotificationItem } from '../../types';
import { api } from '../../lib/api';

interface PortalNotificationsViewProps {
  notifications: NotificationItem[];
  onRefresh: () => void;
}

export const PortalNotificationsView: React.FC<PortalNotificationsViewProps> = ({
  notifications,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'service' | 'warranty'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'service') return n.type === 'service' || n.type === 'appointment';
    if (filter === 'warranty') return n.type === 'warranty';
    return true;
  });

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warranty':
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'service':
      case 'appointment':
        return <Wrench className="w-4 h-4 text-cyan-400" />;
      case 'update':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <Bell className="w-3.5 h-3.5" />
            CUSTOMER ALERTS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Notifications & Updates
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time notifications regarding vehicle service intervals, YouGuard warranty milestones, and appointments.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold uppercase tracking-wider transition-colors border border-slate-700 shrink-0"
          >
            <CheckCheck className="w-4 h-4 text-cyan-400" />
            <span>Mark All As Read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-800">
        {(['all', 'unread', 'service', 'warranty'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
              filter === tab
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            {tab === 'all' ? `All (${notifications.length})` : tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                item.read
                  ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                  : 'bg-slate-900/90 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.08)]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    item.read
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-cyan-500/10 border border-cyan-500/30'
                  }`}
                >
                  {getIcon(item.type)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold ${item.read ? 'text-slate-300' : 'text-white'}`}>
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{item.message}</p>
                  <span className="text-[10px] text-slate-500 block pt-1">{item.date}</span>
                </div>
              </div>

              {!item.read && (
                <button
                  onClick={() => handleMarkRead(item.id)}
                  className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-xs font-semibold transition-colors border border-slate-700 shrink-0 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark as read</span>
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <Bell className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No notifications in this view.</p>
          </div>
        )}
      </div>
    </div>
  );
};
