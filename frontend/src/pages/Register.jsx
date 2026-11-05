import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Briefcase,
  Users,
  Award,
} from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

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

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setSubmitting(true);
      await register(formData.name, formData.email, formData.password, formData.role);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Dual-Panel Card Container */}
      <div className="w-full max-w-5xl bg-white border border-[#E4E8EF] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Column: Clean White Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header / Brand */}
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

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[#202B3C] tracking-tight">
                Create an account
              </h1>
              <p className="text-xs sm:text-sm text-[#667085] mt-1">
                Register as a student, placement officer, or administrator.
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
                  Full Name
                </label>
                <div className="relative flex items-center">
                  <User size={16} strokeWidth={1.8} className="absolute left-3.5 text-[#94A3B8] pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Jane Doe"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E8EF] rounded-lg text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-[#3569A8]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B3C] mb-1.5">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <Mail size={16} strokeWidth={1.8} className="absolute left-3.5 text-[#94A3B8] pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="e.g. jane.doe@university.edu"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E8EF] rounded-lg text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-[#3569A8]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B3C] mb-1.5">
                  Password (min 6 characters)
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} strokeWidth={1.8} className="absolute left-3.5 text-[#94A3B8] pointer-events-none" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E8EF] rounded-lg text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-[#3569A8]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#202B3C] mb-1.5">
                  User Role
                </label>
                <div className="relative flex items-center">
                  <Shield size={16} strokeWidth={1.8} className="absolute left-3.5 text-[#94A3B8] pointer-events-none" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-[#E4E8EF] rounded-lg text-[#202B3C] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-[#3569A8]/10 transition-all cursor-pointer"
                  >
                    <option value="STUDENT">Student Candidate</option>
                    <option value="PLACEMENT_OFFICER">Training &amp; Placement Officer</option>
                    <option value="ADMIN">Portal Administrator</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-[#3569A8] hover:bg-[#19365C] text-white font-semibold text-xs sm:text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} strokeWidth={1.8} className="animate-spin" />
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <span>Register Account</span>
                )}
              </button>
            </form>
          </div>

          {/* Footer link */}
          <div className="pt-6 mt-6 border-t border-[#E4E8EF] flex items-center justify-between text-xs text-[#667085]">
            <span>Already registered?</span>
            <Link
              to="/login"
              className="font-semibold text-[#3569A8] hover:text-[#19365C] transition-colors"
            >
              Sign In here →
            </Link>
          </div>
        </div>

        {/* Right Column: Navy Branding Panel */}
        <div className="hidden md:flex md:w-1/2 bg-[#19365C] text-white p-8 sm:p-12 flex-col justify-between relative overflow-hidden select-none">
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium border border-white/15 mb-6">
              <Award size={14} strokeWidth={1.8} />
              <span>Career Advancement Network</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Launch Your Career with Campus Placements
            </h2>
            <p className="text-xs sm:text-sm text-white/80 mt-3 leading-relaxed max-w-md">
              Create your verified profile to participate in campus recruitment drives, verify academic eligibility, and apply to top companies.
            </p>
          </div>

          <div className="relative z-10 my-8 space-y-3">
            <div className="p-4 rounded-xl bg-white/8 border border-white/15 flex items-center gap-3.5">
              <CheckCircle2 size={20} strokeWidth={1.8} className="text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Automated Eligibility Screening</p>
                <p className="text-[11px] text-white/70">Instant match with company CGPA and backlog requirements</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/8 border border-white/15 flex items-center gap-3.5">
              <Briefcase size={20} strokeWidth={1.8} className="text-[#BFDBFE] shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Direct Recruiter Access</p>
                <p className="text-[11px] text-white/70">Submit resumes and track multi-round interview stages</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/8 border border-white/15 flex items-center gap-3.5">
              <Users size={20} strokeWidth={1.8} className="text-[#FEF08A] shrink-0" />
              <div>
                <p className="text-sm font-bold text-white">Centralized TPO Coordination</p>
                <p className="text-[11px] text-white/70">Verified communications from university placement cell</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-white/60">
            Training &amp; Placement Cell • University Management Portal
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
