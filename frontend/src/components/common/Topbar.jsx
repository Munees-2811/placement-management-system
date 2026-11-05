import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  ChevronDown,
  User,
  LogOut,
  GraduationCap,
} from 'lucide-react';

const Topbar = ({
  title = 'Dashboard',
  breadcrumb = [],
  onMenuClick = () => {},
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

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

        {/* Notification Bell */}
        <button
          className="relative p-2 text-[#667085] hover:text-[#202B3C] hover:bg-[#F5F7FA] rounded-lg transition-colors cursor-pointer"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={18} strokeWidth={1.8} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3569A8] rounded-full border-2 border-white" />
        </button>

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
