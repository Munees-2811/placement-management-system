import React from 'react';
import {
  Clock,
  Star,
  Users,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from 'lucide-react';

const STEPS = [
  { id: 'APPLIED', label: 'Applied', icon: Clock, desc: 'Application received' },
  { id: 'SHORTLISTED', label: 'Shortlisted', icon: Star, desc: 'Profile screened' },
  { id: 'INTERVIEW', label: 'Interview', icon: Users, desc: 'Interview round' },
  { id: 'SELECTED', label: 'Selected', icon: CheckCircle2, desc: 'Offer extended' },
];

const ApplicationTimeline = ({ status, appliedAt, remarks, updatedAt }) => {
  const currentStatus = (status || 'APPLIED').toUpperCase();
  const isRejected = currentStatus === 'REJECTED';

  // Determine active step index
  const activeIndex = STEPS.findIndex((s) => s.id === currentStatus);

  const formattedAppliedDate = appliedAt
    ? new Date(appliedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const formattedUpdatedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <div className="space-y-4">
      {/* Progress track */}
      {!isRejected ? (
        <div className="relative">
          <div className="grid grid-cols-4 gap-2 relative">
            {STEPS.map((step, idx) => {
              const isPast = idx < activeIndex;
              const isCurrent = idx === activeIndex;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                      isCurrent
                        ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white ring-4 ring-indigo-500/20 scale-105'
                        : isPast
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-2 ${
                      isCurrent
                        ? 'text-white'
                        : isPast
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-500 hidden sm:block">
                    {isCurrent ? 'Current' : isPast ? 'Completed' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Connecting line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-10" />
        </div>
      ) : (
        /* Rejected Branch */
        <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-rose-300 block">
                Application Decision: Not Selected
              </span>
              <span className="text-[11px] text-slate-400">
                Application was not moved forward for this drive.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-medium text-rose-400 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 uppercase tracking-wider">
            Closed
          </span>
        </div>
      )}

      {/* Remarks Section (if provided by officer or student) */}
      {remarks && remarks.trim().length > 0 && (
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-2.5 text-xs">
          <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
              Placement Officer Remarks &amp; Updates:
            </span>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">
              {remarks}
            </p>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
        <span>Applied on: {formattedAppliedDate || 'Recent'}</span>
        {formattedUpdatedDate && formattedUpdatedDate !== formattedAppliedDate && (
          <span>Last updated: {formattedUpdatedDate}</span>
        )}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
