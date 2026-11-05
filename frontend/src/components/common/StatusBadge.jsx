import React from 'react';

const STATUS_CONFIGS = {
  // Applications
  APPLIED: {
    label: 'Applied',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#3569A8]',
    border: 'border-[#BFDBFE]',
    dot: 'bg-[#3569A8]',
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    bg: 'bg-[#FEFCE8]',
    text: 'text-[#C58A25]',
    border: 'border-[#FEF08A]',
    dot: 'bg-[#C58A25]',
  },
  INTERVIEW: {
    label: 'Interview Round',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#19365C]',
    border: 'border-[#93C5FD]',
    dot: 'bg-[#19365C]',
  },
  SELECTED: {
    label: 'Selected / Offered',
    bg: 'bg-[#EBFDF5]',
    text: 'text-[#16845B]',
    border: 'border-[#A7F3D0]',
    dot: 'bg-[#16845B]',
  },
  REJECTED: {
    label: 'Not Selected',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#D14343]',
    border: 'border-[#FECACA]',
    dot: 'bg-[#D14343]',
  },

  // Drives
  UPCOMING: {
    label: 'Upcoming',
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#3569A8]',
    border: 'border-[#BFDBFE]',
    dot: 'bg-[#3569A8]',
  },
  ONGOING: {
    label: 'Ongoing',
    bg: 'bg-[#FEFCE8]',
    text: 'text-[#C58A25]',
    border: 'border-[#FEF08A]',
    dot: 'bg-[#C58A25]',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-[#EBFDF5]',
    text: 'text-[#16845B]',
    border: 'border-[#A7F3D0]',
    dot: 'bg-[#16845B]',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#D14343]',
    border: 'border-[#FECACA]',
    dot: 'bg-[#D14343]',
  },

  // Generic
  ACTIVE: {
    label: 'Active',
    bg: 'bg-[#EBFDF5]',
    text: 'text-[#16845B]',
    border: 'border-[#A7F3D0]',
    dot: 'bg-[#16845B]',
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-[#FEF2F2]',
    text: 'text-[#D14343]',
    border: 'border-[#FECACA]',
    dot: 'bg-[#D14343]',
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-[#F1F5F9]',
    text: 'text-[#64748B]',
    border: 'border-[#E2E8F0]',
    dot: 'bg-[#64748B]',
  },
};

const StatusBadge = ({
  status = 'PENDING',
  size = 'sm',
  showDot = true,
  customLabel = null,
}) => {
  const normalizedKey = (status || '').toUpperCase().trim();
  const config = STATUS_CONFIGS[normalizedKey] || {
    label: status || 'Unknown',
    bg: 'bg-[#F1F5F9]',
    text: 'text-[#475569]',
    border: 'border-[#E2E8F0]',
    dot: 'bg-[#475569]',
  };

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs font-semibold',
  }[size] || 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses} select-none`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      )}
      <span className="truncate">{customLabel || config.label}</span>
    </span>
  );
};

export default StatusBadge;
