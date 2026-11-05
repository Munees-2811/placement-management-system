import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  FileText,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Star,
  Users,
  Edit3,
  Loader2,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import ApplicationStatusBadge from './ApplicationStatusBadge';

const STATUS_OPTIONS = [
  { value: 'APPLIED', label: 'APPLIED (Initial Submission)' },
  { value: 'SHORTLISTED', label: 'SHORTLISTED (Passed Screening)' },
  { value: 'INTERVIEW', label: 'INTERVIEW (Invited to Round)' },
  { value: 'SELECTED', label: 'SELECTED (Final Job Offer)' },
  { value: 'REJECTED', label: 'REJECTED (Not Selected)' },
];

const ApplicantActionModal = ({ isOpen, onClose, application, onUpdateStatus, updating }) => {
  const [selectedStatus, setSelectedStatus] = useState('APPLIED');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (application) {
      setSelectedStatus(application.status || 'APPLIED');
      setRemarks(application.remarks || '');
    }
  }, [application]);

  if (!isOpen || !application) return null;

  const student = application.student || {};
  const profile = student.profile || {};
  const drive = application.placementDrive || {};
  const company = drive.company || {};

  const handleSave = (statusToSave) => {
    onUpdateStatus(application._id, {
      status: statusToSave || selectedStatus,
      remarks: remarks.trim(),
    });
  };

  const handleQuickShortlist = () => {
    setSelectedStatus('SHORTLISTED');
    handleSave('SHORTLISTED');
  };

  const handleQuickReject = () => {
    setSelectedStatus('REJECTED');
    handleSave('REJECTED');
  };

  return (
    <div
      id="applicant-action-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !updating) onClose();
      }}
    >
      <div
        id="applicant-action-modal-dialog"
        className="w-full max-w-2xl bg-white border border-[#E4E8EF] rounded-2xl shadow-xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E4E8EF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202B3C]">Review &amp; Manage Applicant</h2>
              <p className="text-xs text-[#667085]">Update status, screening results, and officer remarks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={updating}
            className="p-1.5 text-[#667085] hover:text-[#202B3C] rounded-lg hover:bg-[#E2E8F0] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Summary Banner */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold text-[#202B3C]">{student.name || 'Student Candidate'}</span>
                <ApplicationStatusBadge status={application.status} size="xs" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#667085]">
                <span className="flex items-center gap-1 font-mono text-[#202B3C]">
                  <Mail className="w-3.5 h-3.5 text-[#3569A8]" />
                  {student.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#16845B]" />
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Resume button if uploaded */}
            {profile.resume?.url && (
              <a
                href={profile.resume.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1E40AF] border border-[#BFDBFE] text-xs font-semibold transition-all shrink-0"
              >
                <FileText className="w-4 h-4 text-[#3569A8]" />
                <span>View Resume</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}
          </div>

          {/* Academic Profile Snapshot */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] space-y-3">
            <span className="text-[11px] font-semibold text-[#667085] uppercase tracking-wider block">
              Academic Background &amp; Profile
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg bg-white border border-[#E4E8EF]">
                <span className="text-[10px] text-[#667085] uppercase block font-medium">CGPA</span>
                <span className="text-sm font-bold text-[#19365C]">
                  {profile.cgpa !== null && profile.cgpa !== undefined ? `${profile.cgpa} / 10` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#E4E8EF]">
                <span className="text-[10px] text-[#667085] uppercase block font-medium">Standing Backlogs</span>
                <span className="text-sm font-bold text-[#202B3C]">
                  {profile.backlogs !== undefined ? profile.backlogs : 0}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#E4E8EF]">
                <span className="text-[10px] text-[#667085] uppercase block font-medium">Batch</span>
                <span className="text-sm font-bold text-[#3569A8]">
                  {profile.batch || 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#E4E8EF]">
                <span className="text-[10px] text-[#667085] uppercase block font-medium">Department</span>
                <span className="text-xs font-semibold text-[#202B3C] truncate block" title={profile.department}>
                  {profile.department || 'N/A'}
                </span>
              </div>
            </div>

            {/* Skills Tags */}
            {Array.isArray(profile.skills) && profile.skills.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] text-[#667085] block mb-1.5 font-medium">Technical Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-md text-[11px] bg-white text-[#475569] border border-[#E4E8EF]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drive Applied For */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] flex items-start justify-between gap-3 text-xs">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block mb-1">
                Applied For Position
              </span>
              <div className="font-bold text-[#202B3C] text-sm">{drive.jobRole}</div>
              <div className="text-[#667085] mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#3569A8]" />
                <span>{company.companyName || 'Corporate Partner'}</span>
                <span>•</span>
                <span className="text-[#16845B] font-semibold">{drive.salaryPackage}</span>
              </div>
            </div>
            <div className="text-right text-[#667085] text-[11px]">
              <span>Applied:</span>
              <div className="text-[#202B3C] font-medium">
                {application.appliedAt
                  ? new Date(application.appliedAt).toLocaleDateString()
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons for Placement Officer */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] space-y-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] block">
              Quick Officer Actions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleQuickShortlist}
                disabled={updating}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#C58A25] border border-amber-200 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Shortlist</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('INTERVIEW');
                  handleSave('INTERVIEW');
                }}
                disabled={updating}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#3569A8] border border-blue-200 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Interview</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedStatus('SELECTED');
                  handleSave('SELECTED');
                }}
                disabled={updating}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#16845B] border border-emerald-200 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Select</span>
              </button>

              <button
                type="button"
                onClick={handleQuickReject}
                disabled={updating}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-[#D14343] border border-red-200 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>

          {/* Form: Select Status & Remarks */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="officer-status-select"
                className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5"
              >
                Application Status
              </label>
              <select
                id="officer-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4E8EF] text-xs text-[#202B3C] focus:border-[#3569A8] focus:ring-1 focus:ring-blue-100 transition-colors"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="officer-remarks-input"
                className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#3569A8]" />
                Placement Officer Remarks &amp; Feedback
              </label>
              <textarea
                id="officer-remarks-input"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g., Shortlisted for Technical Assessment Round 1 on Oct 14 at 10:00 AM in Lab 3. Please bring updated printed resume."
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-[#E4E8EF] text-xs text-[#202B3C] focus:border-[#3569A8] focus:ring-1 focus:ring-blue-100 placeholder-[#94A3B8] resize-none transition-colors"
                maxLength={1000}
              />
              <span className="text-[10px] text-[#667085] text-right block mt-1">
                {remarks.length} / 1000 characters
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-t border-[#E4E8EF] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="px-4 py-2 rounded-lg text-xs font-medium text-[#667085] hover:text-[#202B3C] hover:bg-[#E2E8F0] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="save-application-status-btn"
            type="button"
            onClick={() => handleSave()}
            disabled={updating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {updating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Application...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Status &amp; Remarks</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicantActionModal;
