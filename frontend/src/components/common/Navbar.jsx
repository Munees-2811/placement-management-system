import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, LogIn, UserPlus, LogOut, LayoutDashboard, User, Building2, Briefcase, ClipboardList } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              PlacementPortal
            </span>
            <span className="hidden sm:inline-block text-xs text-indigo-400 font-medium ml-2 px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800/40">
              MERN
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link
                id="nav-dashboard-link"
                to="/dashboard"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                id="nav-drives-link"
                to="/drives"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Drives</span>
              </Link>

              <Link
                id="nav-companies-link"
                to="/companies"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <Building2 className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Companies</span>
              </Link>

              <Link
                id="nav-applications-link"
                to="/applications"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">{user?.role === 'STUDENT' ? 'My Applications' : 'Applicants'}</span>
              </Link>

              {user?.role === 'STUDENT' && (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                >
                  <User className="w-4 h-4 text-violet-400" />
                  <span className="hidden sm:inline">My Profile</span>
                </Link>
              )}

              <div className="h-5 w-px bg-slate-800 hidden sm:block mx-1" />

              <div className="hidden sm:flex items-center gap-2 px-2 text-xs">
                <span className="text-slate-400">Hi,</span>
                <span className="font-semibold text-slate-200">{user?.name?.split(' ')[0]}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                  user?.role === 'ADMIN'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : user?.role === 'PLACEMENT_OFFICER'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
