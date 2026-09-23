import React from 'react';
import { Award, BookOpen, Calendar, Phone, Edit3, UserCheck, GraduationCap } from 'lucide-react';

const AcademicStatsCard = ({ profile, onEdit }) => {
  const cgpa = profile?.cgpa !== null && profile?.cgpa !== undefined ? Number(profile.cgpa).toFixed(2) : null;

  const getCgpaStatus = (val) => {
    if (!val) return { label: 'Not Provided', color: 'text-slate-400 bg-slate-800/40 border-slate-700' };
    const num = Number(val);
    if (num >= 9.0) return { label: 'Outstanding (O)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (num >= 8.0) return { label: 'First Class with Distinction', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
    if (num >= 7.0) return { label: 'First Class', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    if (num >= 6.0) return { label: 'Second Class', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Eligible', color: 'text-slate-300 bg-slate-800 border-slate-700' };
  };

  const status = getCgpaStatus(cgpa);

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Academic & Contact Info</h2>
            <p className="text-xs text-slate-400">Verified placement eligibility credentials</p>
          </div>
        </div>

        <button
          onClick={onEdit}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-sm"
        >
          <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Edit Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CGPA Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              CGPA Score
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white">
                {cgpa ?? '—'}
              </span>
              <span className="text-xs text-slate-500 font-medium">/ 10.0</span>
            </div>
            <div className={`mt-2 inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold border ${status.color}`}>
              {status.label}
            </div>
          </div>
        </div>

        {/* Department Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Department
            </span>
          </div>
          <div>
            <div className="text-base font-bold text-white line-clamp-2">
              {profile?.department || (
                <span className="text-slate-500 italic font-normal text-sm">Not specified</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Undergraduate / Degree</div>
          </div>
        </div>

        {/* Batch / Year Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Batch / Year
            </span>
          </div>
          <div>
            <div className="text-base font-bold text-white">
              {profile?.batch || (
                <span className="text-slate-500 italic font-normal text-sm">Not specified</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Graduation Batch</div>
          </div>
        </div>

        {/* Phone Contact Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Phone Number
            </span>
          </div>
          <div>
            <div className="text-base font-bold text-white font-mono">
              {profile?.phone || (
                <span className="text-slate-500 italic font-normal text-sm font-sans">Not specified</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Placement Alerts SMS / Call</div>
          </div>
        </div>
      </div>

      {/* Bio / Objective */}
      {profile?.bio && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300 flex items-start gap-2.5">
          <UserCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{profile.bio}</p>
        </div>
      )}
    </div>
  );
};

export default AcademicStatsCard;
