import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  GraduationCap,
  CheckCheck,
  Briefcase,
  FileCheck,
  FileText,
  Calendar,
  UserCheck,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

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

const getNotificationIcon = (type) => {
  switch (type) {
    case 'DRIVE_ANNOUNCED':
      return <Briefcase size={15} className="text-[#3569A8]" />;
    case 'APPLICATION_STATUS':
      return <FileCheck size={15} className="text-emerald-600" />;
    case 'NEW_APPLICATION':
      return <FileText size={15} className="text-indigo-600" />;
    case 'INTERVIEW_SCHEDULED':
      return <Calendar size={15} className="text-purple-600" />;
    case 'USER_REGISTRATION':
      return <UserCheck size={15} className="text-blue-600" />;
    case 'SYSTEM_ALERT':
      return <AlertCircle size={15} className="text-amber-600" />;
    default:
      return <Bell size={15} className="text-[#3569A8]" />;
  }
};

const Topbar = ({
  title = 'Dashboard',
  breadcrumb = [],
  onMenuClick = () => {},
}) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = (item) => {
    if (!item.isRead) {
      markAsRead(item._id);
    }
    setNotifOpen(false);
    if (item.link) {
      navigate(item.link);
    } else {
      navigate('/notifications');
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const recentNotifications = (notifications || []).slice(0, 5);

  return (
    <header className="h-14 bg-white border-b border-[#E4E8EF] sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side: Hamburger (mobile), Breadcrumb / Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 rounded-lg text-[#667085] hover:text-[#202B3C] hover:bg-[#F5F7FA] transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>

        {/* Title & Breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Mobile title */}
          <h1 className="sm:hidden text-sm font-semibold text-[#202B3C] truncate max-w-[180px]">
            {title}
          </h1>

          {/* Desktop breadcrumb */}
          {breadcrumb && breadcrumb.length > 0 ? (
            <nav className="hidden sm:flex items-center gap-1.5 text-xs text-[#667085] min-w-0">
              {breadcrumb.map((crumb, idx) => (
                <React.Fragment key={crumb.label + idx}>
                  {idx > 0 && (
                    <ChevronRight size={14} strokeWidth={1.8} className="text-[#94A3B8] shrink-0" />
                  )}
                  {crumb.href ? (
                    <Link
                      to={crumb.href}
                      className="hover:text-[#19365C] transition-colors truncate max-w-[140px]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#202B3C] truncate max-w-[180px]">
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          ) : (
            <h1 className="hidden sm:block text-base font-semibold text-[#202B3C] truncate">
              {title}
            </h1>
          )}
        </div>
      </div>

      {/* Right side: Search, Notifications, User Menu */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Search Input (desktop) */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search
            size={16}
            strokeWidth={1.8}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F5F7FA] border border-[#E4E8EF] rounded-lg text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:bg-white transition-all"
          />
        </div>

        {/* Notification Bell & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen((prev) => !prev);
              if (dropdownOpen) setDropdownOpen(false);
            }}
            className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
              notifOpen
                ? 'bg-[#EFF6FF] text-[#3569A8]'
                : 'text-[#667085] hover:text-[#202B3C] hover:bg-[#F5F7FA]'
            }`}
            title="Notifications"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell size={18} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[#3569A8] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E4E8EF] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Dropdown Header */}
              <div className="px-4 py-3 border-b border-[#E4E8EF] flex items-center justify-between bg-[#F8FAFC]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#19365C] uppercase tracking-wider">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE]">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#3569A8] hover:text-[#19365C] transition-colors cursor-pointer"
                  >
                    <CheckCheck size={13} strokeWidth={2} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[#F1F5F9]">
                {recentNotifications.length === 0 ? (
                  <div className="py-8 px-4 text-center">
                    <div className="w-10 h-10 rounded-full bg-[#F5F7FA] text-[#94A3B8] flex items-center justify-center mx-auto mb-2">
                      <Bell size={18} />
                    </div>
                    <p className="text-xs font-medium text-[#667085]">No notifications yet</p>
                    <p className="text-[11px] text-[#94A3B8] mt-0.5">
                      We'll alert you about drives, applications, and updates here.
                    </p>
                  </div>
                ) : (
                  recentNotifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3.5 flex items-start gap-3 hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left ${
                        !notif.isRead ? 'bg-[#F0F7FF]/50' : 'bg-white'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-white border border-[#E4E8EF] shrink-0 shadow-xs">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs truncate ${!notif.isRead ? 'font-bold text-[#19365C]' : 'font-semibold text-[#202B3C]'}`}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#3569A8] shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#667085] line-clamp-2 mt-0.5 leading-snug">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-[#94A3B8] mt-1.5 font-medium">
                          <Clock size={11} strokeWidth={1.8} />
                          <span>{formatRelativeTime(notif.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Dropdown Footer */}
              <div className="p-2.5 bg-[#F8FAFC] border-t border-[#E4E8EF] text-center">
                <Link
                  to="/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-[#3569A8] hover:text-[#19365C] transition-colors"
                >
                  <span>View all notifications</span>
                  <ArrowRight size={13} strokeWidth={2} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-px bg-[#E4E8EF] hidden sm:block" />

        {/* User Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#F5F7FA] transition-colors cursor-pointer"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-[#19365C] text-white text-xs font-semibold flex items-center justify-center shrink-0">
              {getUserInitials(user?.name)}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#202B3C] leading-tight truncate max-w-[120px]">
                {user?.name || 'User'}
              </span>
              <span className="text-[10px] text-[#667085] leading-tight capitalize">
                {user?.role?.replace('_', ' ').toLowerCase() || 'student'}
              </span>
            </div>
            <ChevronDown
              size={14}
              strokeWidth={1.8}
              className={`text-[#667085] hidden lg:block transition-transform duration-200 ${
                dropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* User Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E4E8EF] rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-[#E4E8EF]">
                <p className="text-xs font-semibold text-[#202B3C] truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] text-[#667085] truncate mt-0.5">
                  {user?.email || 'user@portal.edu'}
                </p>
                <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE]">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/dashboard"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#202B3C] hover:bg-[#F5F7FA] transition-colors"
                >
                  <User size={15} strokeWidth={1.8} className="text-[#667085]" />
                  <span>My Profile</span>
                </Link>
              </div>

              <div className="border-t border-[#E4E8EF] pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#D14343] hover:bg-[#FEF2F2] transition-colors text-left cursor-pointer"
                >
                  <LogOut size={15} strokeWidth={1.8} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
