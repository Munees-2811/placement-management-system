import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  GraduationCap, 
  ShieldCheck, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="relative isolate overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-indigo-600 to-violet-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-indigo-400 mb-8 shadow-inner">
          <Layers className="w-3.5 h-3.5" />
          <span>Full-Stack MERN Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Student Placement{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-sky-400 bg-clip-text text-transparent">
            Management System
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          A centralized, role-based portal connecting students, training & placement officers (TPO), 
          and recruiting companies seamlessly.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
            >
              <span>Go to Dashboard ({user?.role})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-base transition-colors"
              >
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        {/* Roles Supported */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Students</h3>
            <p className="mt-2 text-sm text-slate-400">
              Build profiles, browse eligible campus drives, track applications, and receive interview alerts.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4 border border-violet-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">TPO Officers</h3>
            <p className="mt-2 text-sm text-slate-400">
              Manage drives, verify student credentials, publish notices, and coordinate on-campus recruitment.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 mb-4 border border-sky-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Companies</h3>
            <p className="mt-2 text-sm text-slate-400">
              Post job openings, specify eligibility criteria, review candidate resumes, and update recruitment status.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-500/20">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-white">Administrators</h3>
            <p className="mt-2 text-sm text-slate-400">
              Oversee the entire placement lifecycle, manage user access, audit logs, and export placement analytics.
            </p>
          </div>
        </div>

        {/* Tech Stack Pills */}
        <div className="mt-16 pt-10 border-t border-slate-900 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            Underlying Core Stack
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React.js (Vite)', 'Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'Tailwind CSS', 'Axios', 'JWT & bcrypt'].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 text-xs font-medium text-slate-300 border border-slate-800"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
