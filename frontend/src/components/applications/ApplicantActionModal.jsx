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
  { value: 'APPLIED', label: 'APPLIED (Initial Submission)', color: 'text-sky-400' },
  { value: 'SHORTLISTED', label: 'SHORTLISTED (Passed Screening)', color: 'text-amber-400' },
  { value: 'INTERVIEW', label: 'INTERVIEW (Invited to Round)', color: 'text-violet-400' },
  { value: 'SELECTED', label: 'SELECTED (Final Job Offer)', color: 'text-emerald-400' },
  { value: 'REJECTED', label: 'REJECTED (Not Selected)', color: 'text-rose-400' },
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !updating) onClose();
      }}
    >
      <div
        id="applicant-action-modal-dialog"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-violet-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Review &amp; Manage Applicant</h2>
              <p className="text-xs text-slate-400">Update status, screening results, and officer remarks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={updating}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Top Summary Banner */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold text-white">{student.name || 'Student Candidate'}</span>
                <ApplicationStatusBadge status={application.status} size="xs" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1 font-mono text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  {student.email}
                </span>
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all hover:scale-[1.02] shrink-0"
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>View Resume</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>
            )}
          </div>

          {/* Academic Profile Snapshot */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Academic Background &amp; Profile
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">CGPA</span>
                <span className="text-sm font-bold text-indigo-400">
                  {profile.cgpa !== null && profile.cgpa !== undefined ? `${profile.cgpa} / 10` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Standing Backlogs</span>
                <span className="text-sm font-bold text-white">
                  {profile.backlogs !== undefined ? profile.backlogs : 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Batch</span>
                <span className="text-sm font-bold text-violet-400">
                  {profile.batch || 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Department</span>
                <span className="text-xs font-semibold text-slate-200 truncate block" title={profile.department}>
                  {profile.department || 'N/A'}
                </span>
              </div>
            </div>

            {/* Skills Tags */}
            {Array.isArray(profile.skills) && profile.skills.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Technical Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-lg text-[11px] bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Drive Applied For */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3 text-xs">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Applied For Position
              </span>
              <div className="font-bold text-white text-sm">{drive.jobRole}</div>
              <div className="text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>{company.companyName || 'Corporate Partner'}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{drive.salaryPackage}</span>
              </div>
            </div>
            <div className="text-right text-slate-500 text-[11px]">
              <span>Applied:</span>
              <div className="text-slate-300 font-medium">
                {application.appliedAt
                  ? new Date(application.appliedAt).toLocaleDateString()
                  : 'N/A'}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons for Placement Officer */}
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300 block">
              Quick Officer Actions
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={handleQuickShortlist}
                disabled={updating}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition-colors disabled:opacity-50"
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
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/40 text-xs font-semibold transition-colors disabled:opacity-50"
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
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Select</span>
              </button>

              <button
                type="button"
                onClick={handleQuickReject}
                disabled={updating}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-colors disabled:opacity-50"
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
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5"
              >
                Application Status
              </label>
              <select
                id="officer-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="officer-remarks-input"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Placement Officer Remarks &amp; Feedback
              </label>
              <textarea
                id="officer-remarks-input"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g., Shortlisted for Technical Assessment Round 1 on Oct 14 at 10:00 AM in Lab 3. Please bring updated printed resume."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 resize-none transition-colors"
                maxLength={1000}
              />
              <span className="text-[10px] text-slate-500 text-right block mt-1">
                {remarks.length} / 1000 characters
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={updating}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            id="save-application-status-btn"
            type="button"
            onClick={() => handleSave()}
            disabled={updating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] disabled:opacity-50"
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
