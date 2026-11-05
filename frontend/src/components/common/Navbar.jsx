import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#E4E8EF] bg-white/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#19365C] text-white flex items-center justify-center transition-transform group-hover:scale-105">
            <GraduationCap size={18} strokeWidth={1.8} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-[#19365C] tracking-tight leading-none">
              PlacementPortal
            </span>
            <span className="text-[10px] text-[#667085] font-medium leading-tight">
              University Career Services
            </span>
          </div>
        </Link>

        {/* Public Navigation */}
        <nav className="flex items-center gap-2">
          {!isLoginPage ? (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#19365C] hover:bg-[#F5F7FA] border border-[#E4E8EF] transition-colors"
            >
              <LogIn size={15} strokeWidth={1.8} />
              <span>Sign In</span>
            </Link>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#3569A8] hover:bg-[#19365C] transition-colors shadow-sm"
            >
              <UserPlus size={15} strokeWidth={1.8} />
              <span>Create Account</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
