import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

const ProfileCompletionCard = ({ profile, onActionClick }) => {
  const percentage = profile?.completionPercentage || 0;
  const breakdown = profile?.completionBreakdown || {};

  const checklist = [
    { key: 'phone', label: 'Phone Number', weight: 10, done: breakdown.phone, action: 'academic' },
    { key: 'department', label: 'Department', weight: 10, done: breakdown.department, action: 'academic' },
    { key: 'batch', label: 'Batch / Year', weight: 10, done: breakdown.batch, action: 'academic' },
    { key: 'cgpa', label: 'CGPA', weight: 15, done: breakdown.cgpa, action: 'academic' },
    { key: 'skills', label: 'Technical Skills', weight: 15, done: breakdown.skills, action: 'skills' },
    { key: 'projects', label: 'Projects', weight: 20, done: breakdown.projects, action: 'projects' },
    { key: 'certifications', label: 'Certifications', weight: 10, done: breakdown.certifications, action: 'certifications' },
    { key: 'resume', label: 'Resume', weight: 10, done: breakdown.resume, action: 'resume' },
  ];

  const doneCount = checklist.filter((i) => i.done).length;

  const getBarColor = (pct) => {
    if (pct >= 85) return '#16845B';
    if (pct >= 50) return '#3569A8';
    return '#C58A25';
  };

  const getStatusLabel = (pct) => {
    if (pct === 100) return { text: 'Ready for Placement', badgeClass: 'bg-[#EBFDF5] text-[#16845B] border border-[#A7F3D0]' };
    if (pct >= 70) return { text: 'Good Standing', badgeClass: 'bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE]' };
    return { text: 'Incomplete', badgeClass: 'bg-[#FEFCE8] text-[#C58A25] border border-[#FEF08A]' };
  };

  const status = getStatusLabel(percentage);

  return (
    <div className="bg-white border border-[#E4E8EF] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#E4E8EF]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-[#202B3C]">Profile Completion</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${status.badgeClass}`}>
                {status.text}
              </span>
            </div>
            <p className="text-xs text-[#667085]">
              {doneCount} of {checklist.length} sections complete · Improves company shortlisting
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="flex items-baseline justify-end gap-0.5">
              <span className="text-2xl font-bold text-[#202B3C] tracking-tight">{percentage}</span>
              <span className="text-xs font-semibold text-[#667085]">%</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[#E4E8EF] rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${percentage}%`,
              backgroundColor: getBarColor(percentage),
            }}
          />
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2">
          {checklist.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onActionClick && onActionClick(item.action)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer ${
                item.done
                  ? 'bg-[#EBFDF5] border-[#A7F3D0] text-[#16845B]'
                  : 'bg-[#F8FAFC] border-[#E4E8EF] text-[#667085] hover:bg-white hover:border-[#CBD5E1]'
              }`}
            >
              {item.done ? (
                <CheckCircle2 size={14} strokeWidth={2} className="text-[#16845B] shrink-0" />
              ) : (
                <Circle size={14} strokeWidth={1.8} className="text-[#94A3B8] shrink-0" />
              )}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionCard;
