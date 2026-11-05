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
    <div className="min-h-screen bg-[#F5F7FA] text-[#202B3C]">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E4E8EF] text-xs font-semibold text-[#19365C] mb-8 shadow-2xs">
          <Layers className="w-3.5 h-3.5 text-[#3569A8]" />
          <span>University Placement &amp; Career Services Hub</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#19365C] max-w-4xl mx-auto leading-tight">
          Student Placement{' '}
          <span className="text-[#3569A8]">Management System</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-[#667085] max-w-2xl mx-auto leading-relaxed">
          A centralized, role-based enterprise platform connecting university students, Training &amp; Placement Officers (TPO), and recruiting partners.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#19365C] hover:bg-[#132B4A] text-white font-semibold text-sm shadow-xs transition-colors"
            >
              <span>Go to Dashboard ({user?.role?.replace('_', ' ')})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#19365C] hover:bg-[#132B4A] text-white font-semibold text-sm shadow-xs transition-colors"
              >
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] font-semibold text-sm transition-colors"
              >
                <span>Create Student Account</span>
              </Link>
            </>
          )}
        </div>

        {/* Roles Supported */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-5 text-left">
          <div className="p-6 rounded-xl bg-white border border-[#E4E8EF] shadow-xs hover:border-[#CBD5E1] transition-all">
            <div className="w-11 h-11 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#3569A8] mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202B3C]">Students</h3>
            <p className="mt-2 text-xs text-[#667085] leading-relaxed">
              Build verified academic profiles, review eligibility status, apply to drives, and track selection rounds.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E4E8EF] shadow-xs hover:border-[#CBD5E1] transition-all">
            <div className="w-11 h-11 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#19365C] mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202B3C]">TPO Officers</h3>
            <p className="mt-2 text-xs text-[#667085] leading-relaxed">
              Schedule corporate drives, verify candidate credentials, coordinate interviews, and publish notices.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E4E8EF] shadow-xs hover:border-[#CBD5E1] transition-all">
            <div className="w-11 h-11 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] flex items-center justify-center text-[#3569A8] mb-4">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202B3C]">Companies</h3>
            <p className="mt-2 text-xs text-[#667085] leading-relaxed">
              Publish job requisitions, set CGPA thresholds, inspect resumes, and manage applicant progression.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white border border-[#E4E8EF] shadow-xs hover:border-[#CBD5E1] transition-all">
            <div className="w-11 h-11 rounded-lg bg-[#EBFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#16845B] mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#202B3C]">Administrators</h3>
            <p className="mt-2 text-xs text-[#667085] leading-relaxed">
              Oversee the entire placement cycle, audit user permissions, ensure data accuracy, and export analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
