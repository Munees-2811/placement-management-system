import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  RefreshCw,
  Clock,
  Briefcase,
  FileCheck,
  FileText,
  Calendar,
  UserCheck,
  AlertCircle,
  ExternalLink,
  Filter,
  Inbox,
  Sparkles,
} from 'lucide-react';

const formatFullDate = (timestamp) => {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
};

const getTypeConfig = (type) => {
  switch (type) {
    case 'DRIVE_ANNOUNCED':
      return {
        label: 'Placement Drive',
        icon: Briefcase,
        iconBg: 'bg-blue-50 text-[#3569A8] border-blue-200',
        badgeBg: 'bg-blue-50 text-[#3569A8] border-blue-200',
      };
    case 'APPLICATION_STATUS':
      return {
        label: 'Application Update',
        icon: FileCheck,
        iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'NEW_APPLICATION':
      return {
        label: 'New Candidate',
        icon: FileText,
        iconBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      };
    case 'INTERVIEW_SCHEDULED':
      return {
        label: 'Interview',
        icon: Calendar,
        iconBg: 'bg-purple-50 text-purple-700 border-purple-200',
        badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    case 'USER_REGISTRATION':
      return {
        label: 'Registration',
        icon: UserCheck,
        iconBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      };
    case 'SYSTEM_ALERT':
      return {
        label: 'System Alert',
        icon: AlertCircle,
        iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    default:
      return {
        label: 'Announcement',
        icon: Bell,
        iconBg: 'bg-slate-50 text-slate-700 border-slate-200',
        badgeBg: 'bg-slate-50 text-slate-700 border-slate-200',
      };
  }
};

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllRead,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setTimeout(() => setRefreshing(false), 400);
  };

  const filteredNotifications = (notifications || []).filter((notif) => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  const totalCount = notifications?.length || 0;
  const readCount = totalCount - unreadCount;

  const handleItemClick = (notif, e) => {
    // If click was triggered from action buttons, don't navigate
    if (e.target.closest('button')) return;

    if (!notif.isRead) {
      markAsRead(notif._id);
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header Card */}
      <div className="bg-white rounded-xl border border-[#E4E8EF] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#3569A8]">
              <Bell size={20} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#19365C] tracking-tight">Notifications Center</h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Stay updated on placement drives, application status, schedules, and alerts.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E4E8EF] text-[#202B3C] hover:bg-[#F5F7FA] transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh notifications"
          >
            <RefreshCw
              size={13}
              strokeWidth={2}
              className={`${refreshing || loading ? 'animate-spin text-[#3569A8]' : 'text-[#667085]'}`}
            />
            <span>Refresh</span>
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EFF6FF] border border-[#BFDBFE] text-[#3569A8] hover:bg-[#DBEAFE] transition-colors cursor-pointer"
            >
              <CheckCheck size={14} strokeWidth={2} />
              <span>Mark all read</span>
            </button>
          )}

          {readCount > 0 && (
            <button
              onClick={clearAllRead}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#E4E8EF] text-[#667085] hover:text-[#D14343] hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 size={13} strokeWidth={1.8} />
              <span>Clear read ({readCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center justify-between border-b border-[#E4E8EF] pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#19365C] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#202B3C] hover:bg-white'
            }`}
          >
            All <span className="ml-1 opacity-75">({totalCount})</span>
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'unread'
                ? 'bg-[#19365C] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#202B3C] hover:bg-white'
            }`}
          >
            Unread <span className="ml-1 opacity-75">({unreadCount})</span>
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === 'read'
                ? 'bg-[#19365C] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#202B3C] hover:bg-white'
            }`}
          >
            Read <span className="ml-1 opacity-75">({readCount})</span>
          </button>
        </div>

        <div className="text-xs text-[#667085] hidden sm:block">
          Showing {filteredNotifications.length} of {totalCount} items
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading && filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E4E8EF] p-12 text-center">
            <RefreshCw className="w-6 h-6 text-[#3569A8] animate-spin mx-auto mb-3" />
            <p className="text-xs font-medium text-[#667085]">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#E4E8EF] p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F5F7FA] text-[#94A3B8] flex items-center justify-center mx-auto mb-3">
              <Inbox size={22} strokeWidth={1.8} />
            </div>
            <h3 className="text-sm font-bold text-[#19365C]">
              {filter === 'unread'
                ? 'No unread notifications'
                : filter === 'read'
                ? 'No read notifications'
                : 'No notifications yet'}
            </h3>
            <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
              {filter === 'unread'
                ? "You're all caught up! When updates arrive, they will appear here."
                : 'All system updates, drive schedules, and applications will be displayed here.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const config = getTypeConfig(notif.type);
            const Icon = config.icon;

            return (
              <div
                key={notif._id}
                onClick={(e) => handleItemClick(notif, e)}
                className={`group bg-white rounded-xl border transition-all p-4 sm:p-5 flex items-start gap-4 cursor-pointer relative ${
                  !notif.isRead
                    ? 'border-[#BFDBFE] bg-gradient-to-r from-[#F0F7FF] via-white to-white shadow-xs'
                    : 'border-[#E4E8EF] hover:border-[#CBD5E1] hover:shadow-xs'
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${config.iconBg}`}
                >
                  <Icon size={18} strokeWidth={2} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${config.badgeBg}`}
                    >
                      {config.label}
                    </span>
                    {!notif.isRead && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3569A8] text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        New
                      </span>
                    )}
                    <span className="text-[11px] text-[#94A3B8] font-medium ml-auto flex items-center gap-1">
                      <Clock size={12} strokeWidth={1.8} />
                      {formatRelativeTime(notif.createdAt)}
                    </span>
                  </div>

                  <h3
                    className={`text-sm tracking-tight mb-1 ${
                      !notif.isRead ? 'font-bold text-[#19365C]' : 'font-semibold text-[#202B3C]'
                    }`}
                  >
                    {notif.title}
                  </h3>

                  <p className="text-xs text-[#475467] leading-relaxed break-words">
                    {notif.message}
                  </p>

                  {/* Metadata & Timestamp */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#F1F5F9] text-[11px] text-[#94A3B8]">
                    <span>{formatFullDate(notif.createdAt)}</span>

                    {notif.link && (
                      <span className="inline-flex items-center gap-1 text-[#3569A8] font-semibold hover:underline">
                        <span>View details</span>
                        <ExternalLink size={11} strokeWidth={2} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-1 shrink-0 self-start sm:self-center ml-2">
                  {!notif.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notif._id);
                      }}
                      title="Mark as read"
                      className="p-1.5 rounded-lg text-[#667085] hover:text-[#3569A8] hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                    >
                      <Check size={16} strokeWidth={2} />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNotification(notif._id);
                    }}
                    title="Delete notification"
                    className="p-1.5 rounded-lg text-[#667085] hover:text-[#D14343] hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;

