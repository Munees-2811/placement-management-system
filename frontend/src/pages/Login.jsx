import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Building2,
  Award,
  Users,
} from 'lucide-react';

const ROLES = [
  {
    value: 'STUDENT',
    label: 'Student',
    icon: GraduationCap,
    description: 'Browse campus placement drives, track applications & manage portfolio.',
  },
  {
    value: 'PLACEMENT_OFFICER',
    label: 'TPO Officer',
    icon: ShieldCheck,
    description: 'Announce recruitment drives, verify candidates & screen applicant pools.',
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    icon: Briefcase,
    description: 'Oversee placement operations, manage enterprise partners & portal records.',
  },
];

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(formData.email, formData.password);
      if (res.data?.user?.mustChangePassword) {
        navigate('/change-password', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Dual-Panel Card Container */}
      <div className="w-full max-w-5xl bg-white border border-[#E4E8EF] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Column: Clean White Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Logo at top */}
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-lg bg-[#19365C] text-white flex items-center justify-center shrink-0">
                <GraduationCap size={20} strokeWidth={1.8} />
              </div>
              <div>
                <span className="font-bold text-lg text-[#19365C] tracking-tight block leading-tight">
                  PlacementPortal
                </span>
                <span className="text-[11px] text-[#667085]">
                  University Career Services
                </span>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#202B3C] tracking-tight">
                Login to your account
              </h1>
              <p className="text-xs sm:text-sm text-[#667085] mt-1">
                Enter your credentials to access the placement management portal.
              </p>
            </div>

            {/* Role Selector Tabs */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#202B3C] mb-2 uppercase tracking-wider">
                Select Your Role
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#F5F7FA] border border-[#E4E8EF] rounded-xl">
                {ROLES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedRole(value)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === value
                        ? 'bg-white text-[#19365C] shadow-sm border border-[#E4E8EF]'
                        : 'text-[#667085] hover:text-[#202B3C]'
                    }`}
                  >
                    <Icon size={14} strokeWidth={1.8} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-[#667085] leading-normal">
                {ROLES.find((r) => r.value === selectedRole)?.description}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#D14343] text-xs">
                <AlertCircle size={16} strokeWidth={1.8} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202B3C] mb-1.5">
                  Email Address or Username
                </label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="e.g. student@university.edu"
                  autoComplete="username"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E8EF] rounded-lg text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-[#3569A8]/10 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#202B3C]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert('Password recovery: Please contact your campus placement coordinator or administrator.')}
                    className="text-[11px] font-medium text-[#3569A8] hover:text-[#19365C] transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 pr-10 text-xs sm:text-sm bg-white border border-[#E4E8EF] rounded-lg text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-[#3569A8]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[#667085] hover:text-[#202B3C] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff size={16} strokeWidth={1.8} />
                    ) : (
                      <Eye size={16} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#3569A8] hover:bg-[#19365C] text-white font-semibold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} strokeWidth={1.8} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Footer */}
          <div className="pt-6 mt-6 border-t border-[#E4E8EF] flex items-center justify-between text-xs text-[#667085]">
            <span>Don't have an account?</span>
            <Link
              to="/register"
              className="font-semibold text-[#3569A8] hover:text-[#19365C] transition-colors"
            >
              Register here →
            </Link>
          </div>
        </div>

        {/* Right Column: Professional Navy Branding Panel */}
        <div className="hidden md:flex md:w-1/2 bg-[#19365C] text-white p-8 sm:p-12 flex-col justify-between relative overflow-hidden select-none">
          {/* Subtle background geometric accent */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

          {/* Branding Content */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/15 mb-6">
              <Award size={14} strokeWidth={1.8} />
              <span>Campus Recruitment Management</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Student Placement Management System
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-3 leading-relaxed max-w-md">
              Connecting university scholars with world-class corporate recruitment partners. Streamline eligibility checks, drive applications, and interview selections.
            </p>
          </div>

          {/* Key Portal Statistics */}
          <div className="relative z-10 my-8 space-y-3">
            <div className="p-4 rounded-xl bg-white/8 border border-white/15 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                <Users size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xl font-bold text-white tracking-tight">500+ Students Placed</p>
                <p className="text-[11px] text-white/70">Across leading national &amp; global tech firms</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/8 border border-white/15 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                <Building2 size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xl font-bold text-white tracking-tight">150+ Partner Companies</p>
                <p className="text-[11px] text-white/70">Actively hiring for engineering &amp; management roles</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/8 border border-white/15 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
                <ShieldCheck size={20} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xl font-bold text-white tracking-tight">95% Placement Rate</p>
                <p className="text-[11px] text-white/70">Verified eligible candidate recruitment benchmark</p>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-white/60">
            Training &amp; Placement Cell • Verified Academic Portal
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
