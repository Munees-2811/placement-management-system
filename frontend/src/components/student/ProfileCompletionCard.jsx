import React from 'react';
import { CheckCircle2, Circle, AlertCircle, ArrowUpRight } from 'lucide-react';

const ProfileCompletionCard = ({ profile, onActionClick }) => {
  const percentage = profile?.completionPercentage || 0;
  const breakdown = profile?.completionBreakdown || {};

  const checklist = [
    { key: 'phone', label: 'Contact Phone', weight: '10%', done: breakdown.phone, action: 'academic' },
    { key: 'department', label: 'Department', weight: '10%', done: breakdown.department, action: 'academic' },
    { key: 'batch', label: 'Batch / Year', weight: '10%', done: breakdown.batch, action: 'academic' },
    { key: 'cgpa', label: 'Academic CGPA', weight: '15%', done: breakdown.cgpa, action: 'academic' },
    { key: 'skills', label: 'Key Skills', weight: '15%', done: breakdown.skills, action: 'skills' },
    { key: 'projects', label: 'Projects Showcase', weight: '20%', done: breakdown.projects, action: 'projects' },
    { key: 'certifications', label: 'Certifications', weight: '10%', done: breakdown.certifications, action: 'certifications' },
    { key: 'resume', label: 'Resume Upload', weight: '10%', done: breakdown.resume, action: 'resume' },
  ];

  const getProgressColor = (pct) => {
    if (pct >= 85) return 'from-emerald-500 to-teal-400';
    if (pct >= 50) return 'from-indigo-500 to-violet-400';
    return 'from-amber-500 to-orange-400';
  };

  const getStatusBadge = (pct) => {
    if (pct === 100) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Ready for Placements
        </span>
      );
    }
    if (pct >= 70) {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Good Standing
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Action Needed
      </span>
    );
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-bold text-white tracking-tight">Profile Completion</h2>
            {getStatusBadge(percentage)}
          </div>
          <p className="text-xs text-slate-400">
            A comprehensive profile dramatically boosts campus placement shortlisting.
          </p>
        </div>
        <div className="flex items-baseline gap-1 self-start sm:self-center">
          <span className="text-3xl font-extrabold text-white tracking-tight">{percentage}%</span>
          <span className="text-xs font-medium text-slate-400">/ 100%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800 mb-6 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(
            percentage
          )} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {checklist.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onActionClick && onActionClick(item.action)}
            className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
              item.done
                ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300 hover:border-emerald-800/60'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-indigo-500/40'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <span className="text-xs font-medium truncate">{item.label}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 shrink-0 ml-1">
              +{item.weight}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
