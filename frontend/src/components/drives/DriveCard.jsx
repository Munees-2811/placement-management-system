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

const GRADIENTS = [
  'from-indigo-600 to-violet-600',
  'from-blue-600 to-cyan-600',
  'from-emerald-600 to-teal-600',
  'from-violet-600 to-purple-600',
  'from-amber-600 to-orange-600',
  'from-rose-600 to-pink-600',
];

const getInitials = (name) => {
  if (!name) return 'CO';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getGradientForName = (name) => {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
};

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'UPCOMING':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    case 'ONGOING':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'COMPLETED':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    case 'CANCELLED':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    default:
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  }
};

/**
 * Eligibility banner shown on the card for STUDENT role.
 * Shows a green "Eligible" or red "Not Eligible: <reason>" strip.
 */
const EligibilityBanner = ({ eligibility }) => {
  if (!eligibility) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-400">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>Eligibility loading…</span>
      </div>
    );
  }

  if (eligibility.profileIncomplete) {
    return (
      <div
        id="eligibility-banner-incomplete"
        className="flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300"
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
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 font-semibold"
      >
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
        <span>Eligible</span>
      </div>
    );
  }

  // Not eligible — show first reason
  const firstReason = eligibility.reasons?.[0] || 'Does not meet requirements';
  return (
    <div
      id="eligibility-banner-not-eligible"
      className="flex items-start gap-2 px-3 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300"
    >
      <XCircle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
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
  const gradient = getGradientForName(companyName);

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
      className="group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/20 flex flex-col justify-between"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} text-white font-bold text-base flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200 shrink-0`}
            >
              {getInitials(companyName)}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="truncate max-w-[170px]" title={companyName}>
                  {companyName}
                </span>
              </div>
              <h3
                id={`drive-role-${drive._id}`}
                onClick={() => onView(drive)}
                className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-1"
                title={drive.jobRole}
              >
                {drive.jobRole}
              </h3>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getStatusBadge(drive.status)}`}>
            {drive.status}
          </span>
        </div>

        {/* Package & Location Row */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-3.5 h-3.5" />
            {drive.salaryPackage}
          </span>
          {company.location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span className="truncate max-w-[150px]">{company.location}</span>
            </span>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {drive.jobDescription || 'No description provided.'}
        </p>

        {/* Eligibility Banner — students only */}
        {isStudent && (
          <div className="mb-4">
            <EligibilityBanner eligibility={eligibility} />
          </div>
        )}

        {/* Academic Criteria Pills */}
        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/70 mb-4 space-y-2">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-1.5 rounded-xl border ${
              isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'cgpa')?.passed
                ? 'bg-rose-950/40 border-rose-500/30'
                : 'bg-slate-900/90 border-slate-800/80'
            }`}>
              <span className="text-[10px] text-slate-500 block uppercase">Min CGPA</span>
              <span className={`font-bold ${
                isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'cgpa')?.passed
                  ? 'text-rose-400'
                  : 'text-indigo-400'
              }`}>
                {drive.minimumCGPA !== undefined ? drive.minimumCGPA : '0.0'}+
              </span>
            </div>
            <div className={`p-1.5 rounded-xl border ${
              isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'backlogs')?.passed
                ? 'bg-rose-950/40 border-rose-500/30'
                : 'bg-slate-900/90 border-slate-800/80'
            }`}>
              <span className="text-[10px] text-slate-500 block uppercase">Max Backlogs</span>
              <span className={`font-bold ${
                isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'backlogs')?.passed
                  ? 'text-rose-400'
                  : 'text-white'
              }`}>
                {drive.maximumBacklogs !== undefined ? drive.maximumBacklogs : 0}
              </span>
            </div>
            <div className={`p-1.5 rounded-xl border ${
              isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'graduationYear')?.passed
                ? 'bg-rose-950/40 border-rose-500/30'
                : 'bg-slate-900/90 border-slate-800/80'
            }`}>
              <span className="text-[10px] text-slate-500 block uppercase">Batch</span>
              <span className={`font-bold ${
                isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'graduationYear')?.passed
                  ? 'text-rose-400'
                  : 'text-violet-400'
              }`}>
                {drive.graduationYear}
              </span>
            </div>
          </div>

          {/* Department Count */}
          <div className={`flex items-center justify-between text-[11px] pt-1 rounded-lg px-1 ${
            isStudent && eligibility && !eligibility.criteria?.find(c => c.field === 'department')?.passed
              ? 'text-rose-400'
              : 'text-slate-400'
          }`}>
            <span className="truncate">
              {Array.isArray(drive.eligibleDepartments) && drive.eligibleDepartments.length > 0
                ? `${drive.eligibleDepartments.length} Eligible Departments`
                : 'All Branches'}
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              {Array.isArray(drive.eligibleDepartments) && drive.eligibleDepartments[0]
                ? drive.eligibleDepartments[0].split(' ')[0]
                : ''}
            </span>
          </div>
        </div>

        {/* Deadlines bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Drive: {formattedDriveDate}</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isDeadlinePassed ? 'text-rose-400' : 'text-slate-400'}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>Apply by: {formattedDeadline}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <button
          id={`drive-view-details-btn-${drive._id}`}
          onClick={() => onView(drive)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </button>

        {/* Student Apply / Not-Eligible / Applied indicator */}
        {isStudent && (
          <div>
            {hasApplied ? (
              <Link
                to="/applications"
                id={`drive-applied-badge-${drive._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-colors"
                title="View your application status"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Applied ({application.status})</span>
              </Link>
            ) : canApply ? (
              <button
                id={`drive-apply-btn-${drive._id}`}
                onClick={() => onApply ? onApply(drive) : onView(drive)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all hover:scale-[1.02] shadow-md shadow-emerald-600/20"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply Now</span>
              </button>
            ) : (
              <span
                id={`drive-not-eligible-tag-${drive._id}`}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium border ${
                  isDeadlinePassed
                    ? 'bg-slate-800/60 border-slate-700 text-slate-400'
                    : eligibility?.profileIncomplete
                    ? 'bg-amber-950/40 border-amber-500/30 text-amber-400'
                    : eligibility?.eligible === false
                    ? 'bg-rose-950/40 border-rose-500/30 text-rose-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
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
              className="p-2 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/10 transition-colors"
              title="Edit Drive"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              id={`drive-delete-btn-${drive._id}`}
              onClick={() => onDelete(drive)}
              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
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
