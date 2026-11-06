import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  LogOut,
  ArrowRight,
  KeyRound,
} from 'lucide-react';

const ChangePassword = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password Strength Indicators
  const hasMinLength = newPassword.length >= 6;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please enter your current temporary password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from your temporary password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match. Please verify.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setSuccess('Password updated successfully! Redirecting to your dashboard…');

      // Update auth context state & local storage
      if (res.data?.data?.user) {
        updateUser(res.data.data.user);
      } else {
        updateUser({ ...user, mustChangePassword: false });
      }

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update password. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col justify-between text-[#202B3C]">
      {/* Top Navbar */}
      <header className="bg-[#19365C] text-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0">
            <GraduationCap size={20} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">University Placement Portal</h1>
            <p className="text-[11px] text-white/70">Candidate Account Setup &amp; Verification</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-lg bg-white border border-[#E4E8EF] rounded-2xl shadow-lg p-6 sm:p-8">
          
          {/* Header Icon & Title */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE] flex items-center justify-center mx-auto mb-3 shadow-xs">
              <KeyRound size={26} strokeWidth={1.8} />
            </div>
            <h2 className="text-xl font-bold text-[#202B3C]">Set Permanent Password</h2>
            <p className="text-xs text-[#667085] mt-1">
              Welcome, <strong className="text-[#202B3C]">{user?.name || 'Student'}</strong> ({user?.email})
            </p>
          </div>

          {/* Security Notice Alert */}
          <div className="mb-6 p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3 text-xs text-[#1E40AF]">
            <ShieldCheck size={18} className="text-[#3569A8] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[#1E40AF]">First-Time Sign-In Security Policy</p>
              <p className="text-[#1E40AF]/85 mt-0.5 leading-relaxed">
                Your account was created via the campus placement system with a temporary password. You must establish a secure personal password before accessing the student hub and placement drives.
              </p>
            </div>
          </div>

          {/* Error & Success Messages */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2.5 text-xs text-[#D14343]">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-[#16845B]">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Change Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Current Temporary Password */}
            <div>
              <label className="block text-xs font-semibold text-[#202B3C] mb-1.5">
                Current Temporary Password <span className="text-[#D14343]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]">
                  <Lock size={15} />
                </span>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter the password sent to your email"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#E4E8EF] rounded-lg bg-white text-[#202B3C] placeholder:text-[#A0AABA] focus:outline-none focus:ring-2 focus:ring-[#3569A8]/25 focus:border-[#3569A8] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#202B3C]"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#202B3C] mb-1.5">
                New Permanent Password <span className="text-[#D14343]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]">
                  <Lock size={15} />
                </span>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Choose a strong password (min. 6 characters)"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#E4E8EF] rounded-lg bg-white text-[#202B3C] placeholder:text-[#A0AABA] focus:outline-none focus:ring-2 focus:ring-[#3569A8]/25 focus:border-[#3569A8] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#202B3C]"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password Requirement Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                    hasMinLength ? 'bg-emerald-50 text-[#16845B]' : 'bg-[#F1F5F9] text-[#667085]'
                  }`}
                >
                  {hasMinLength ? <CheckCircle2 size={11} /> : '○'} 6+ characters
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                    hasUpper ? 'bg-emerald-50 text-[#16845B]' : 'bg-[#F1F5F9] text-[#667085]'
                  }`}
                >
                  {hasUpper ? <CheckCircle2 size={11} /> : '○'} Uppercase letter
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${
                    hasNumberOrSymbol ? 'bg-emerald-50 text-[#16845B]' : 'bg-[#F1F5F9] text-[#667085]'
                  }`}
                >
                  {hasNumberOrSymbol ? <CheckCircle2 size={11} /> : '○'} Number or symbol
                </span>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold text-[#202B3C] mb-1.5">
                Confirm New Password <span className="text-[#D14343]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085]">
                  <Lock size={15} />
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#E4E8EF] rounded-lg bg-white text-[#202B3C] placeholder:text-[#A0AABA] focus:outline-none focus:ring-2 focus:ring-[#3569A8]/25 focus:border-[#3569A8] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#202B3C]"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {confirmPassword && (
                <p
                  className={`text-xs mt-1.5 flex items-center gap-1 ${
                    passwordsMatch ? 'text-[#16845B]' : 'text-[#D14343]'
                  }`}
                >
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 size={12} /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} /> Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !hasMinLength || !passwordsMatch}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#19365C] hover:bg-[#122844] text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating Password…</span>
                  </>
                ) : (
                  <>
                    <span>Activate Account &amp; Proceed to Dashboard</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E4E8EF] py-4 text-center text-xs text-[#667085] bg-white">
        <p>© {new Date().getFullYear()} University Placement &amp; Training Cell • All rights reserved</p>
      </footer>
    </div>
  );
};

export default ChangePassword;

