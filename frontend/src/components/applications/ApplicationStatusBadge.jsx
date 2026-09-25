import React from 'react';
import {
  Clock,
  Star,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';

export const getStatusConfig = (status) => {
  switch (status?.toUpperCase()) {
    case 'SHORTLISTED':
      return {
        label: 'Shortlisted',
        badgeClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        dotClass: 'bg-amber-400',
        Icon: Star,
      };
    case 'INTERVIEW':
      return {
        label: 'Interview Round',
        badgeClass: 'bg-violet-500/10 text-violet-300 border-violet-500/30',
        dotClass: 'bg-violet-400',
        Icon: Users,
      };
    case 'SELECTED':
      return {
        label: 'Selected',
        badgeClass: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        dotClass: 'bg-emerald-400',
        Icon: CheckCircle2,
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        badgeClass: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
        dotClass: 'bg-rose-400',
        Icon: XCircle,
      };
    case 'APPLIED':
    default:
      return {
        label: 'Applied',
        badgeClass: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
        dotClass: 'bg-sky-400',
        Icon: Clock,
      };
  }
};

const ApplicationStatusBadge = ({ status, size = 'sm', showIcon = true }) => {
  const config = getStatusConfig(status);
  const Icon = config.Icon;

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-[10px] gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-xs font-bold gap-2'
      : 'px-2.5 py-1 text-xs font-semibold gap-1.5';

  const iconSizes =
    size === 'xs' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border uppercase tracking-wider font-semibold ${config.badgeClass} ${sizeClasses}`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};

export default ApplicationStatusBadge;
