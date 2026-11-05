import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, Loader2, GraduationCap, ShieldCheck, Briefcase } from 'lucide-react';
import studentPortalArt from '../assets/student-portal-art.jpg';

const ROLES = [
  {
    value: 'STUDENT',
    label: 'Student',
    icon: GraduationCap,
    description: 'Access your placement profile, browse drives & track applications.',
    panelTitle: 'Welcome, Student!',
    panelSub: 'Login to access your student portal',
  },
  {
    value: 'PLACEMENT_OFFICER',
    label: 'TPO Officer',
    icon: ShieldCheck,
    description: 'Manage placement drives, verify students & coordinate recruitment.',
    panelTitle: 'Welcome, TPO Officer!',
    panelSub: 'Login to manage placement activities',
  },
  {
    value: 'ADMIN',
    label: 'Admin',
    icon: Briefcase,
    description: 'Oversee all operations, manage users & export analytics.',
    panelTitle: 'Welcome, Admin!',
    panelSub: 'Login to access the admin portal',
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
      setError('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101014] flex items-center justify-center p-4 sm:p-6 lg:p-10">
      {/* Main Dual-Panel Card */}
      <div className="w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl shadow-black/80 flex flex-col md:flex-row min-h-[640px] border border-white/5 bg-[#18181c]">
        
        {/* Left Column: Dark Login Form */}
        <div className="w-full md:w-[45%] lg:w-[42%] bg-[#18181c] p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2">
                Login
              </h1>
              <p className="text-sm text-zinc-400 font-normal">
                Enter your account details
              </p>
            </div>

            {/* Role Selector */}
            <div className="mb-8">
              <label className="block text-xs text-zinc-400 font-medium mb-3">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(({ value, label, icon: Icon, description }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedRole(value)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer
                      ${selectedRole === value
                        ? 'bg-[#8c52ff]/15 border-[#8c52ff] text-[#a97dff]'
                        : 'bg-[#1e1e24] border-zinc-700/60 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-semibold leading-tight">{label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2.5 text-[11px] text-zinc-500 leading-relaxed">
                {ROLES.find(r => r.value === selectedRole)?.description}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Username / Email Field */}
              <div className="space-y-1">
                <label className="block text-xs text-zinc-400 font-medium">
                  Username
                </label>
                <div className="relative border-b border-zinc-700/80 focus-within:border-purple-400 transition-colors pb-1">
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter email or username"
                    autoComplete="username"
                    className="w-full bg-transparent text-white placeholder-zinc-600 focus:outline-none text-sm py-1.5 transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="block text-xs text-zinc-400 font-medium">
                  Password
                </label>
                <div className="relative border-b border-zinc-700/80 focus-within:border-purple-400 transition-colors pb-1 flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full bg-transparent text-white placeholder-zinc-600 focus:outline-none text-sm py-1.5 pr-8 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => alert('Password recovery: Please contact your campus placement coordinator or admin.')}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-xl bg-[#8c52ff] hover:bg-[#7e45ea] active:bg-[#7036dc] text-white font-medium text-sm shadow-lg shadow-purple-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Footer inside Left Column */}
          <div className="pt-10 mt-6 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
            <span>Don't have an account?</span>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl bg-[#24242c] hover:bg-[#2e2e38] text-zinc-200 border border-zinc-700/60 font-medium transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Right Column: Purple Welcome & Illustration Panel */}
        <div className="hidden md:flex md:w-[55%] lg:w-[58%] bg-[#8c52ff] relative flex-col justify-between overflow-hidden p-8 sm:p-12 lg:p-14 select-none">
          {/* Organic Fluid Blob Background Accents */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 600 600"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M120 -50 C240 20, 320 80, 420 50 C520 20, 580 120, 620 240 C660 360, 560 480, 460 540 C360 600, 220 560, 120 500 C20 440, -40 320, 0 200 C40 80, 0 -120, 120 -50 Z"
                fill="#783be3"
              />
              <path
                d="M450 100 C550 180, 620 300, 580 420 C540 540, 420 620, 300 600 C180 580, 140 480, 80 400 C20 320, 60 200, 140 120 C220 40, 350 20, 450 100 Z"
                fill="#9d6bfc"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Welcome Text Header */}
          <div className="relative z-10 mb-6">
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-[1.15]">
              {ROLES.find(r => r.value === selectedRole)?.panelTitle.split('!')[0]}!
            </h2>
            <p className="text-sm sm:text-base text-purple-100/90 font-normal mt-2.5">
              {ROLES.find(r => r.value === selectedRole)?.panelSub}
            </p>
          </div>

          {/* Central Line-Art Illustration */}
          <div className="relative z-10 flex-1 flex items-end justify-center min-h-[300px] sm:min-h-[380px]">
            <img
              src={studentPortalArt}
              alt="Student Portal Illustration"
              className="w-full max-w-[460px] object-contain drop-shadow-xl"
              draggable="false"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
