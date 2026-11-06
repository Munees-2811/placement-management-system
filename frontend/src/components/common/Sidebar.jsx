import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  BriefcaseBusiness,
  Building2,
  FileCheck,
  UserPlus,
  LogOut,
  X,
} from 'lucide-react';

const Sidebar = ({ mobileOpen = false, onClose = () => {} }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/drives',
      label: 'Placement Drives',
      icon: BriefcaseBusiness,
    },
    {
      to: '/companies',
      label: 'Companies',
      icon: Building2,
    },
    {
      to: '/applications',
      label: user?.role === 'STUDENT' ? 'My Applications' : 'All Applications',
      icon: FileCheck,
    },
  ];

  // Admin-only navigation items
  const adminItems = user?.role === 'ADMIN'
    ? [
        {
          to: '/admin/add-student',
          label: 'Add Students',
          icon: UserPlus,
        },
      ]
    : [];

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'PLACEMENT_OFFICER':
        return 'TPO Officer';
      case 'STUDENT':
        return 'Student';
      default:
        return role ? role.replace('_', ' ') : 'User';
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#19365C] text-[#CBD5E1] select-none">
      {/* Brand & Logo Header */}
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
            <GraduationCap size={20} strokeWidth={1.8} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-white text-base tracking-tight leading-tight truncate">
              PlacementPortal
            </span>
            <span className="text-[11px] text-white/60 font-medium">
              University Career Hub
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="md:hidden text-white/70 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Close menu"
        >
          <X size={18} strokeWidth={1.8} />
        </button>
      </div>

      {/* Role Badge */}
      <div className="px-5 pt-4 pb-2">
        <div className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-white/10 text-white/90 border border-white/15">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
          {getRoleDisplayName(user?.role)}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isItemActive =
            location.pathname === item.to ||
            (item.to === '/dashboard' &&
              (location.pathname === '/officer-portal' || location.pathname === '/admin-portal'));

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={() =>
                `group flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                  isItemActive
                    ? 'text-white bg-white/12 border-l-[3px] border-[#3569A8] font-semibold pl-[11px]'
                    : 'text-[#CBD5E1] hover:text-white hover:bg-white/8 border-l-[3px] border-transparent pl-[11px]'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.8} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}

        {/* Admin-only section */}
        {adminItems.length > 0 && (
          <>
            <div className="pt-3 pb-1 px-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
                Administration
              </p>
            </div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isItemActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={() =>
                    `group flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-150 ${
                      isItemActive
                        ? 'text-white bg-white/12 border-l-[3px] border-[#3569A8] font-semibold pl-[11px]'
                        : 'text-[#CBD5E1] hover:text-white hover:bg-white/8 border-l-[3px] border-transparent pl-[11px]'
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      {/* Divider */}
      <div className="px-3">
        <div className="border-t border-white/10" />
      </div>

      {/* Bottom Section: User Profile & Logout */}
      <div className="p-4 bg-black/10">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#3569A8] text-white text-xs font-bold flex items-center justify-center shrink-0 border border-white/20">
              {getUserInitials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] text-white/60 truncate leading-tight mt-0.5">
                {user?.email || 'user@portal.edu'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-md transition-colors shrink-0 cursor-pointer"
            aria-label="Log Out"
          >
            <LogOut size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:block fixed top-0 left-0 bottom-0 w-[240px] z-30 shadow-lg border-r border-[#19365C]/80">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer */}
          <div className="fixed top-0 left-0 bottom-0 w-[240px] shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
