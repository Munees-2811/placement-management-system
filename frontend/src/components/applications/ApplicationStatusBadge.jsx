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
        badgeClass: 'bg-amber-50 text-[#C58A25] border-amber-200',
        dotClass: 'bg-[#C58A25]',
        Icon: Star,
      };
    case 'INTERVIEW':
      return {
        label: 'Interview Round',
        badgeClass: 'bg-blue-50 text-[#3569A8] border-blue-200',
        dotClass: 'bg-[#3569A8]',
        Icon: Users,
      };
    case 'SELECTED':
      return {
        label: 'Selected',
        badgeClass: 'bg-emerald-50 text-[#16845B] border-emerald-200',
        dotClass: 'bg-[#16845B]',
        Icon: CheckCircle2,
      };
    case 'REJECTED':
      return {
        label: 'Rejected',
        badgeClass: 'bg-red-50 text-[#D14343] border-red-200',
        dotClass: 'bg-[#D14343]',
        Icon: XCircle,
      };
    case 'APPLIED':
    default:
      return {
        label: 'Applied',
        badgeClass: 'bg-[#F1F5F9] text-[#475569] border-[#E4E8EF]',
        dotClass: 'bg-[#667085]',
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
