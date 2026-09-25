import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  DollarSign,
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  MapPin,
  Globe,
  Mail,
  User,
  Edit3,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

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

const getInitials = (name) => {
  if (!name) return 'CO';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

/**
 * Per-criterion row in the eligibility breakdown table.
 */
const CriterionRow = ({ criterion }) => {
  const passed = criterion.passed;
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
        passed
          ? 'bg-emerald-950/20 border-emerald-500/20'
          : 'bg-rose-950/25 border-rose-500/25'
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {passed ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        ) : (
          <XCircle className="w-4 h-4 text-rose-400" />
        )}
      </div>
      <div className="min-w-0">
        <div className={`text-xs font-semibold ${passed ? 'text-emerald-300' : 'text-rose-300'}`}>
          {criterion.label}
        </div>
        <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{criterion.message}</div>
      </div>
    </div>
  );
};

/**
 * Full eligibility section displayed inside the detail modal for students.
 */
const EligibilitySection = ({ eligibility }) => {
  if (!eligibility) {
    return (
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-3 text-sm text-slate-400">
        <Info className="w-5 h-5 shrink-0" />
        <span>Eligibility information is loading…</span>
      </div>
    );
  }

  if (eligibility.notApplicable) return null;

  const { eligible, summary, criteria, profileIncomplete, reasons } = eligibility;

  return (
    <div
      id="eligibility-section"
      className={`p-5 rounded-2xl border space-y-3 ${
        eligible
          ? 'bg-emerald-950/20 border-emerald-500/25'
          : profileIncomplete
          ? 'bg-amber-950/20 border-amber-500/25'
          : 'bg-rose-950/20 border-rose-500/25'
      }`}
    >
      {/* Summary header */}
      <div className="flex items-center gap-3">
        {eligible ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
        ) : profileIncomplete ? (
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
        )}
        <div>
          <p
            id="eligibility-summary-text"
            className={`font-semibold text-sm ${
              eligible
                ? 'text-emerald-300'
                : profileIncomplete
                ? 'text-amber-300'
                : 'text-rose-300'
            }`}
          >
            {eligible
              ? 'You are Eligible for this Drive'
              : profileIncomplete
              ? 'Complete Your Profile to Verify Eligibility'
              : 'You are Not Eligible for this Drive'}
          </p>
          {!eligible && reasons.length > 0 && (
            <p className="text-xs text-slate-400 mt-0.5">
              {reasons.length} reason{reasons.length > 1 ? 's' : ''} for rejection
            </p>
          )}
        </div>
      </div>

      {/* Per-criterion breakdown */}
      {criteria.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
            Eligibility Criteria Breakdown
          </p>
          {criteria.map((c) => (
            <CriterionRow key={c.field} criterion={c} />
          ))}
        </div>
      )}

      {/* Profile incomplete warning */}
      {profileIncomplete && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Some profile fields (department, CGPA, or batch year) are missing. Please update your
            profile on the Dashboard to get an accurate eligibility result.
          </span>
        </div>
      )}
    </div>
  );
};

const DriveDetailModal = ({ isOpen, onClose, drive, canManage, onEdit, eligibility, isStudent, application, onApply }) => {
  if (!isOpen || !drive) return null;

  const company = drive.company || {};
  const companyName = company.companyName || 'Corporate Partner';

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const isDeadlinePassed = drive.applicationDeadline
    ? new Date(drive.applicationDeadline).getTime() < Date.now()
    : false;

  const hasApplied = Boolean(application);
  // Apply button state for students
  const canApply = isStudent && !hasApplied && eligibility?.eligible && !isDeadlinePassed;
  const applyBlockReason = isStudent
    ? hasApplied
      ? `Applied: ${application.status}`
      : isDeadlinePassed
      ? 'Application deadline has passed'
      : eligibility?.eligible === false
      ? eligibility.reasons?.[0] || 'You do not meet the eligibility requirements'
      : eligibility?.profileIncomplete
      ? 'Complete your profile to apply'
      : null
    : null;

  return (
    <div
      id="drive-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="drive-detail-dialog"
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Top Header Banner */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-violet-950/40 border-b border-slate-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-lg flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
                {getInitials(companyName)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getStatusBadge(drive.status)}`}>
                    {drive.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                    {companyName}
                  </span>
                </div>
                <h2 id="drive-detail-role" className="text-2xl font-bold text-white tracking-tight">
                  {drive.jobRole}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <DollarSign className="w-3.5 h-3.5" />
                    {drive.salaryPackage}
                  </span>
                  {company.location && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {company.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              id="drive-detail-close-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Application Deadline */}
            <div className={`p-4 rounded-2xl border ${
              isDeadlinePassed
                ? 'bg-rose-950/20 border-rose-500/30'
                : 'bg-slate-950 border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Application Deadline
                </span>
                {isDeadlinePassed && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium">
                    Deadline Passed
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-white">
                {formatDateTime(drive.applicationDeadline)}
              </div>
            </div>

            {/* Drive Date */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Recruitment Drive Date
              </span>
              <div className="text-sm font-bold text-indigo-300">
                {formatDateTime(drive.driveDate)}
              </div>
            </div>
          </div>

          {/* ── ELIGIBILITY SECTION (Students only) ───────────────────────── */}
          {isStudent && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Your Eligibility Status
              </h3>
              <EligibilitySection eligibility={eligibility} />
            </div>
          )}

          {/* Academic Eligibility Criteria Section */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Eligibility &amp; Academic Criteria</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl border ${
                isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'cgpa')?.passed === false
                  ? 'bg-rose-950/30 border-rose-500/25'
                  : 'bg-slate-900 border-slate-800/70'
              }`}>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                  Minimum CGPA
                </span>
                <span className={`text-lg font-bold ${
                  isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'cgpa')?.passed === false
                    ? 'text-rose-400'
                    : 'text-indigo-400'
                }`}>
                  {drive.minimumCGPA !== undefined ? `${drive.minimumCGPA} / 10.0` : 'None'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${
                isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'backlogs')?.passed === false
                  ? 'bg-rose-950/30 border-rose-500/25'
                  : 'bg-slate-900 border-slate-800/70'
              }`}>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                  Max Standing Backlogs
                </span>
                <span className={`text-lg font-bold ${
                  isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'backlogs')?.passed === false
                    ? 'text-rose-400'
                    : 'text-white'
                }`}>
                  {drive.maximumBacklogs !== undefined ? drive.maximumBacklogs : 0}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${
                isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'graduationYear')?.passed === false
                  ? 'bg-rose-950/30 border-rose-500/25'
                  : 'bg-slate-900 border-slate-800/70'
              }`}>
                <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-0.5">
                  Graduation Batch
                </span>
                <span className={`text-lg font-bold ${
                  isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'graduationYear')?.passed === false
                    ? 'text-rose-400'
                    : 'text-violet-400'
                }`}>
                  {drive.graduationYear || 'All Batches'}
                </span>
              </div>
            </div>

            {/* Eligible Departments list */}
            <div>
              <span className={`text-xs font-semibold block mb-2 ${
                isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'department')?.passed === false
                  ? 'text-rose-400'
                  : 'text-slate-400'
              }`}>
                Eligible Academic Departments:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(drive.eligibleDepartments) && drive.eligibleDepartments.length > 0 ? (
                  drive.eligibleDepartments.map((dept) => (
                    <span
                      key={dept}
                      className="px-2.5 py-1 rounded-xl text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                    >
                      {dept}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">Open to all departments</span>
                )}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Role Description &amp; Expectations
            </h3>
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {drive.jobDescription || 'No description provided.'}
            </div>
          </div>

          {/* Company Liaison / Recruiter Contacts */}
          {company.contactPerson && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block mb-2">
                Company Recruitment Liaison
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-white font-medium">
                  <User className="w-4 h-4 text-violet-400" />
                  <span>{company.contactPerson}</span>
                </div>
                {company.contactEmail && (
                  <a
                    href={`mailto:${company.contactEmail}`}
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-mono"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{company.contactEmail}</span>
                  </a>
                )}
                {company.website && (
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Company Website</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3 flex-wrap">
          <button
            id="drive-detail-close-footer-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Student Apply / Blocked / Applied Button */}
            {isStudent && (
              <div>
                {hasApplied ? (
                  <Link
                    to="/applications"
                    id="drive-detail-applied-link"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-sky-400" />
                    <span>Applied ({application.status})</span>
                  </Link>
                ) : canApply ? (
                  <button
                    id="drive-detail-apply-btn"
                    onClick={() => {
                      onClose();
                      if (onApply) onApply(drive);
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all hover:scale-[1.02] shadow-md shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Now</span>
                  </button>
                ) : (
                  <div
                    id="drive-detail-blocked-apply"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-medium"
                    title={applyBlockReason || ''}
                  >
                    <XCircle className="w-4 h-4 shrink-0" />
                    <span className="line-clamp-1">
                      {isDeadlinePassed
                        ? 'Applications Closed'
                        : eligibility?.profileIncomplete
                        ? 'Complete Profile to Apply'
                        : eligibility?.eligible === false
                        ? `Not Eligible: ${eligibility.reasons?.[0] || 'Requirements not met'}`
                        : 'Checking eligibility…'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {canManage && (
              <button
                id="drive-detail-edit-shortcut-btn"
                onClick={() => {
                  onClose();
                  onEdit(drive);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all hover:scale-[1.02] shadow-md shadow-indigo-600/20"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Drive</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriveDetailModal;
