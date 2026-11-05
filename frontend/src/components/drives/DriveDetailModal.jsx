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
import StatusBadge from '../common/StatusBadge';

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
          ? 'bg-emerald-50/60 border-emerald-200'
          : 'bg-red-50/60 border-red-200'
      }`}
    >
      <div className="shrink-0 mt-0.5">
        {passed ? (
          <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
        ) : (
          <XCircle className="w-4 h-4 text-[#D14343]" />
        )}
      </div>
      <div className="min-w-0">
        <div className={`text-xs font-semibold ${passed ? 'text-[#16845B]' : 'text-[#D14343]'}`}>
          {criterion.label}
        </div>
        <div className="text-xs text-[#667085] mt-0.5 leading-relaxed">{criterion.message}</div>
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
      <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] flex items-center gap-3 text-sm text-[#667085]">
        <Info className="w-5 h-5 shrink-0 text-[#3569A8]" />
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
          ? 'bg-emerald-50/40 border-emerald-200'
          : profileIncomplete
          ? 'bg-amber-50/40 border-amber-200'
          : 'bg-red-50/40 border-red-200'
      }`}
    >
      {/* Summary header */}
      <div className="flex items-center gap-3">
        {eligible ? (
          <CheckCircle2 className="w-6 h-6 text-[#16845B] shrink-0" />
        ) : profileIncomplete ? (
          <AlertTriangle className="w-6 h-6 text-[#C58A25] shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-[#D14343] shrink-0" />
        )}
        <div>
          <p
            id="eligibility-summary-text"
            className={`font-semibold text-sm ${
              eligible
                ? 'text-[#16845B]'
                : profileIncomplete
                ? 'text-[#C58A25]'
                : 'text-[#D14343]'
            }`}
          >
            {eligible
              ? 'You are Eligible for this Drive'
              : profileIncomplete
              ? 'Complete Your Profile to Verify Eligibility'
              : 'You are Not Eligible for this Drive'}
          </p>
          {!eligible && reasons.length > 0 && (
            <p className="text-xs text-[#667085] mt-0.5">
              {reasons.length} reason{reasons.length > 1 ? 's' : ''} for rejection
            </p>
          )}
        </div>
      </div>

      {/* Per-criterion breakdown */}
      {criteria.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] uppercase font-semibold text-[#667085] tracking-wider">
            Eligibility Criteria Breakdown
          </p>
          {criteria.map((c) => (
            <CriterionRow key={c.field} criterion={c} />
          ))}
        </div>
      )}

      {/* Profile incomplete warning */}
      {profileIncomplete && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-[#C58A25]">
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="drive-detail-dialog"
        className="w-full max-w-3xl bg-white border border-[#E4E8EF] rounded-2xl shadow-xl overflow-hidden my-8"
      >
        {/* Top Header Banner */}
        <div className="relative px-6 pt-6 pb-5 bg-[#F8FAFC] border-b border-[#E4E8EF]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#19365C] text-white font-bold text-lg flex items-center justify-center shadow-sm shrink-0">
                {getInitials(companyName)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <StatusBadge status={drive.status} />
                  <span className="text-xs text-[#667085] font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#3569A8]" />
                    {companyName}
                  </span>
                </div>
                <h2 id="drive-detail-role" className="text-xl font-bold text-[#202B3C] tracking-tight">
                  {drive.jobRole}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#667085]">
                  <span className="inline-flex items-center gap-1 text-[#16845B] font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    <DollarSign className="w-3.5 h-3.5" />
                    {drive.salaryPackage}
                  </span>
                  {company.location && (
                    <span className="flex items-center gap-1 text-[#667085]">
                      <MapPin className="w-3.5 h-3.5 text-[#94A3B8]" />
                      {company.location}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              id="drive-detail-close-btn"
              onClick={onClose}
              className="p-1.5 text-[#667085] hover:text-[#202B3C] rounded-lg hover:bg-[#E2E8F0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Key Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Application Deadline */}
            <div className={`p-4 rounded-xl border ${
              isDeadlinePassed
                ? 'bg-red-50 border-red-200'
                : 'bg-[#F8FAFC] border-[#E4E8EF]'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C58A25]" />
                  Application Deadline
                </span>
                {isDeadlinePassed && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-[#D14343] font-medium">
                    Deadline Passed
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-[#202B3C]">
                {formatDateTime(drive.applicationDeadline)}
              </div>
            </div>

            {/* Drive Date */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF]">
              <span className="text-xs font-semibold text-[#667085] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#3569A8]" />
                Recruitment Drive Date
              </span>
              <div className="text-sm font-bold text-[#19365C]">
                {formatDateTime(drive.driveDate)}
              </div>
            </div>
          </div>

          {/* ── ELIGIBILITY SECTION (Students only) ── */}
          {isStudent && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3569A8]" />
                Your Eligibility Status
              </h3>
              <EligibilitySection eligibility={eligibility} />
            </div>
          )}

          {/* Academic Eligibility Criteria Section */}
          <div className="p-5 rounded-2xl bg-[#F8FAFC] border border-[#E4E8EF] space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[#202B3C]">
              <Award className="w-4 h-4 text-[#C58A25]" />
              <span>Eligibility &amp; Academic Criteria</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`p-3 rounded-xl border ${
                isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'cgpa')?.passed === false
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-[#E4E8EF]'
              }`}>
                <span className="text-[10px] uppercase font-semibold text-[#667085] block mb-0.5">
                  Minimum CGPA
                </span>
                <span className={`text-base font-bold ${
                  isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'cgpa')?.passed === false
                    ? 'text-[#D14343]'
                    : 'text-[#19365C]'
                }`}>
                  {drive.minimumCGPA !== undefined ? `${drive.minimumCGPA} / 10.0` : 'None'}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${
                isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'backlogs')?.passed === false
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-[#E4E8EF]'
              }`}>
                <span className="text-[10px] uppercase font-semibold text-[#667085] block mb-0.5">
                  Max Standing Backlogs
                </span>
                <span className={`text-base font-bold ${
                  isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'backlogs')?.passed === false
                    ? 'text-[#D14343]'
                    : 'text-[#202B3C]'
                }`}>
                  {drive.maximumBacklogs !== undefined ? drive.maximumBacklogs : 0}
                </span>
              </div>

              <div className={`p-3 rounded-xl border ${
                isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'graduationYear')?.passed === false
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-[#E4E8EF]'
              }`}>
                <span className="text-[10px] uppercase font-semibold text-[#667085] block mb-0.5">
                  Graduation Batch
                </span>
                <span className={`text-base font-bold ${
                  isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'graduationYear')?.passed === false
                    ? 'text-[#D14343]'
                    : 'text-[#3569A8]'
                }`}>
                  {drive.graduationYear || 'All Batches'}
                </span>
              </div>
            </div>

            {/* Eligible Departments list */}
            <div>
              <span className={`text-xs font-semibold block mb-2 ${
                isStudent && eligibility && eligibility.criteria?.find(c => c.field === 'department')?.passed === false
                  ? 'text-[#D14343]'
                  : 'text-[#667085]'
              }`}>
                Eligible Academic Departments:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(drive.eligibleDepartments) && drive.eligibleDepartments.length > 0 ? (
                  drive.eligibleDepartments.map((dept) => (
                    <span
                      key={dept}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]"
                    >
                      {dept}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#94A3B8] italic">Open to all departments</span>
                )}
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#667085] mb-2">
              Role Description &amp; Expectations
            </h3>
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] text-sm text-[#202B3C] leading-relaxed whitespace-pre-line">
              {drive.jobDescription || 'No description provided.'}
            </div>
          </div>

          {/* Company Liaison / Recruiter Contacts */}
          {company.contactPerson && (
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF]">
              <span className="text-[11px] uppercase tracking-wider text-[#667085] font-semibold block mb-2">
                Company Recruitment Liaison
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#202B3C] font-medium">
                  <User className="w-4 h-4 text-[#3569A8]" />
                  <span>{company.contactPerson}</span>
                </div>
                {company.contactEmail && (
                  <a
                    href={`mailto:${company.contactEmail}`}
                    className="flex items-center gap-1.5 text-[#3569A8] hover:underline font-mono"
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
                    className="inline-flex items-center gap-1 text-[#667085] hover:text-[#202B3C]"
                  >
                    <Globe className="w-3.5 h-3.5 text-[#94A3B8]" />
                    <span>Company Website</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E4E8EF] bg-[#F8FAFC] flex items-center justify-between gap-3 flex-wrap">
          <button
            id="drive-detail-close-footer-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[#667085] hover:text-[#202B3C] hover:bg-[#E2E8F0] transition-colors"
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1E40AF] text-xs font-semibold transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#3569A8]" />
                    <span>Applied ({application.status})</span>
                  </Link>
                ) : canApply ? (
                  <button
                    id="drive-detail-apply-btn"
                    onClick={() => {
                      onClose();
                      if (onApply) onApply(drive);
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#16845B] hover:bg-[#126848] text-white text-xs font-semibold transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply Now</span>
                  </button>
                ) : (
                  <div
                    id="drive-detail-blocked-apply"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 border border-red-200 text-[#D14343] text-xs font-medium"
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
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold transition-all shadow-sm"
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
