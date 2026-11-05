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
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      isCurrent
                        ? 'bg-[#19365C] text-white ring-4 ring-blue-50 shadow-sm scale-105'
                        : isPast
                        ? 'bg-emerald-50 text-[#16845B] border border-emerald-200'
                        : 'bg-[#F1F5F9] border border-[#E4E8EF] text-[#94A3B8]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 ${
                      isCurrent
                        ? 'text-[#19365C]'
                        : isPast
                        ? 'text-[#16845B]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-[#667085] hidden sm:block">
                    {isCurrent ? 'Current' : isPast ? 'Completed' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Connecting line */}
          <div className="absolute top-4.5 left-6 right-6 h-0.5 bg-[#E4E8EF] -z-10" />
        </div>
      ) : (
        /* Rejected Branch */
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-[#D14343] border border-red-200 flex items-center justify-center shrink-0">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#D14343] block">
                Application Decision: Not Selected
              </span>
              <span className="text-[11px] text-[#667085]">
                Application was not moved forward for this drive.
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-[#D14343] px-2.5 py-1 rounded-full bg-red-100 uppercase tracking-wider">
            Closed
          </span>
        </div>
      )}

      {/* Remarks Section */}
      {remarks && remarks.trim().length > 0 && (
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] flex items-start gap-2.5 text-xs">
          <MessageSquare className="w-4 h-4 text-[#3569A8] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-0.5">
              Placement Officer Remarks:
            </span>
            <p className="text-[#202B3C] leading-relaxed whitespace-pre-line">
              {remarks}
            </p>
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex items-center justify-between text-[11px] text-[#667085] pt-1 border-t border-[#E4E8EF]">
        <span>Applied on: {formattedAppliedDate || 'Recent'}</span>
        {formattedUpdatedDate && formattedUpdatedDate !== formattedAppliedDate && (
          <span>Last updated: {formattedUpdatedDate}</span>
        )}
      </div>
    </div>
  );
};

export default ApplicationTimeline;
