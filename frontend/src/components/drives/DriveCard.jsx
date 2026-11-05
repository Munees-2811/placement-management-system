import React from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  GraduationCap,
  MapPin,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const getInitials = (name) => {
  if (!name) return 'CO';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/**
 * Eligibility banner shown on the card for STUDENT role.
 * Shows a green "Eligible" or red "Not Eligible: <reason>" strip.
 */
const EligibilityBanner = ({ eligibility }) => {
  if (!eligibility) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] text-xs text-[#667085]">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>Eligibility loading…</span>
      </div>
    );
  }

  if (eligibility.profileIncomplete) {
    return (
      <div
        id="eligibility-banner-incomplete"
        className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#C58A25]"
      >
        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Complete your profile to check eligibility</span>
      </div>
    );
  }

  if (eligibility.eligible) {
    return (
      <div
        id="eligibility-banner-eligible"
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#16845B] font-semibold"
      >
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-[#16845B]" />
        <span>Eligible</span>
      </div>
    );
  }

  // Not eligible — show first reason
  const firstReason = eligibility.reasons?.[0] || 'Does not meet requirements';
  return (
    <div
      id="eligibility-banner-not-eligible"
      className="flex items-start gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-xs text-[#D14343]"
    >
      <XCircle className="w-3.5 h-3.5 shrink-0 text-[#D14343] mt-0.5" />
      <span>
        <span className="font-semibold">Not Eligible: </span>
        {firstReason}
      </span>
    </div>
  );
};

const DriveCard = ({ drive, canManage, onEdit, onDelete, onView, eligibility, isStudent, application, onApply }) => {
  const company = drive.company || {};
  const companyName = company.companyName || 'Corporate Partner';

  const formattedDriveDate = drive.driveDate
    ? new Date(drive.driveDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'TBA';

  const formattedDeadline = drive.applicationDeadline
    ? new Date(drive.applicationDeadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Open';

  const isDeadlinePassed = drive.applicationDeadline
    ? new Date(drive.applicationDeadline).getTime() < Date.now()
    : false;

  const hasApplied = Boolean(application);
  // Students can only apply if eligible, deadline hasn't passed, and haven't already applied
  const canApply = isStudent && !hasApplied && eligibility?.eligible && !isDeadlinePassed;

  return (
    <div
      id={`drive-card-${drive._id}`}
      className="group relative bg-white hover:border-[#CBD5E1] border border-[#E4E8EF] rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm flex flex-col justify-between"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-[#19365C] text-white font-bold text-sm flex items-center justify-center shrink-0">
              {getInitials(companyName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-[#667085] font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#3569A8] shrink-0" />
                <span className="truncate" title={companyName}>
                  {companyName}
                </span>
              </div>
              <h3
                id={`drive-role-${drive._id}`}
                onClick={() => onView(drive)}
                className="text-base font-bold text-[#202B3C] group-hover:text-[#3569A8] transition-colors cursor-pointer truncate"
                title={drive.jobRole}
              >
                {drive.jobRole}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            <StatusBadge status={drive.status} />
          </div>
        </div>

        {/* Package & Location Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-[#16845B] border border-emerald-200">
            <DollarSign className="w-3.5 h-3.5" />
            {drive.salaryPackage}
          </span>
          {company.location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-[#667085] px-2.5 py-0.5 rounded-full bg-[#F8FAFC] border border-[#E4E8EF]">
              <MapPin className="w-3 h-3 text-[#94A3B8]" />
              <span className="truncate max-w-[150px]">{company.location}</span>
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-[#667085] line-clamp-2 mb-4 leading-relaxed min-h-[36px]">
          {drive.jobDescription || 'No description provided.'}
        </p>

        {/* Eligibility Banner — students only */}
        {isStudent && (
          <div className="mb-3">
            <EligibilityBanner eligibility={eligibility} />
          </div>
        )}

        {/* Academic Criteria Pills */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] mb-4 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-1.5 rounded-lg border ${
              isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'cgpa')?.passed
                ? 'bg-red-50 border-red-200 text-[#D14343]'
                : 'bg-white border-[#E4E8EF]'
            }`}>
              <span className="text-[10px] text-[#667085] block uppercase font-medium">Min CGPA</span>
              <span className={`font-bold ${
                isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'cgpa')?.passed
                  ? 'text-[#D14343]'
                  : 'text-[#19365C]'
              }`}>
                {drive.minimumCGPA !== undefined ? drive.minimumCGPA : '0.0'}+
              </span>
            </div>
            <div className={`p-1.5 rounded-lg border ${
              isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'backlogs')?.passed
                ? 'bg-red-50 border-red-200 text-[#D14343]'
                : 'bg-white border-[#E4E8EF]'
            }`}>
              <span className="text-[10px] text-[#667085] block uppercase font-medium">Max Backlogs</span>
              <span className={`font-bold ${
                isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'backlogs')?.passed
                  ? 'text-[#D14343]'
                  : 'text-[#202B3C]'
              }`}>
                {drive.maximumBacklogs !== undefined ? drive.maximumBacklogs : 0}
              </span>
            </div>
            <div className={`p-1.5 rounded-lg border ${
              isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'graduationYear')?.passed
                ? 'bg-red-50 border-red-200 text-[#D14343]'
                : 'bg-white border-[#E4E8EF]'
            }`}>
              <span className="text-[10px] text-[#667085] block uppercase font-medium">Batch</span>
              <span className={`font-bold ${
                isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'graduationYear')?.passed
                  ? 'text-[#D14343]'
                  : 'text-[#3569A8]'
              }`}>
                {drive.graduationYear}
              </span>
            </div>
          </div>

          {/* Department Count */}
          <div className={`flex items-center justify-between text-[11px] pt-1 px-1 ${
            isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'department')?.passed
              ? 'text-[#D14343]'
              : 'text-[#667085]'
          }`}>
            <span className="truncate">
              {Array.isArray(drive.eligibleDepartments) && drive.eligibleDepartments.length > 0
                ? `${drive.eligibleDepartments.length} Eligible Departments`
                : 'All Branches'}
            </span>
            <span className="text-[#94A3B8] font-mono text-[10px]">
              {Array.isArray(drive.eligibleDepartments) && drive.eligibleDepartments[0]
                ? drive.eligibleDepartments[0].split(' ')[0]
                : ''}
            </span>
          </div>
        </div>

        {/* Deadlines bar */}
        <div className="flex items-center justify-between text-xs text-[#667085] mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#3569A8]" />
            <span>Drive: {formattedDriveDate}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isDeadlinePassed ? 'text-[#D14343]' : 'text-[#667085]'}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>Apply by: {formattedDeadline}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-[#E4E8EF] flex items-center justify-between gap-2">
        <button
          id={`drive-view-details-btn-${drive._id}`}
          onClick={() => onView(drive)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#202B3C] text-xs font-semibold transition-colors"
        >
          <Eye className="w-3.5 h-3.5 text-[#667085]" />
          <span>View Details</span>
        </button>

        {/* Student Apply / Not-Eligible / Applied indicator */}
        {isStudent && (
          <div>
            {hasApplied ? (
              <Link
                to="/applications"
                id={`drive-applied-badge-${drive._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1E40AF] text-xs font-semibold transition-colors"
                title="View your application status"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3569A8]" />
                <span>Applied ({application.status})</span>
              </Link>
            ) : canApply ? (
              <button
                id={`drive-apply-btn-${drive._id}`}
                onClick={() => onApply ? onApply(drive) : onView(drive)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#16845B] hover:bg-[#126848] text-white text-xs font-semibold transition-all shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Now</span>
              </button>
            ) : (
              <span
                id={`drive-not-eligible-tag-${drive._id}`}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border ${
                  isDeadlinePassed
                    ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#667085]'
                    : eligibility?.profileIncomplete
                    ? 'bg-amber-50 border-amber-200 text-[#C58A25]'
                    : eligibility?.eligible === false
                    ? 'bg-red-50 border-red-200 text-[#D14343]'
                    : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#667085]'
                }`}
              >
                {isDeadlinePassed ? (
                  <><Clock className="w-3 h-3" /> Deadline Passed</>
                ) : eligibility?.profileIncomplete ? (
                  <><AlertTriangle className="w-3 h-3" /> Incomplete Profile</>
                ) : eligibility?.eligible === false ? (
                  <><XCircle className="w-3 h-3" /> Not Eligible</>
                ) : (
                  <><Info className="w-3 h-3" /> Checking…</>
                )}
              </span>
            )}
          </div>
        )}

        {canManage && (
          <div className="flex items-center gap-1">
            <button
              id={`drive-edit-btn-${drive._id}`}
              onClick={() => onEdit(drive)}
              className="p-1.5 rounded-lg text-[#3569A8] hover:text-[#19365C] hover:bg-[#EFF6FF] transition-colors"
              title="Edit Drive"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id={`drive-delete-btn-${drive._id}`}
              onClick={() => onDelete(drive)}
              className="p-1.5 rounded-lg text-[#D14343] hover:text-[#991B1B] hover:bg-[#FEF2F2] transition-colors"
              title="Delete Drive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriveCard;
