import React, { useState } from 'react';
import {
  X,
  Briefcase,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  FileText,
  AlertCircle,
  Loader2,
  User,
  GraduationCap,
} from 'lucide-react';

const ApplyConfirmModal = ({ isOpen, onClose, drive, onApply, applying, eligibility, user }) => {
  const [remarks, setRemarks] = useState('');

  if (!isOpen || !drive) return null;

  const company = drive.company || {};
  const companyName = company.companyName || 'Corporate Partner';

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply({
      placementDrive: drive._id,
      remarks: remarks.trim(),
    });
  };

  return (
    <div
      id="apply-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !applying) onClose();
      }}
    >
      <div
        id="apply-modal-dialog"
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Apply for Placement Drive</h2>
              <p className="text-xs text-slate-400">Confirm your application submission</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={applying}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Target Drive Card */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {companyName}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{drive.jobRole}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {drive.salaryPackage}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  Drive Date:{' '}
                  {drive.driveDate
                    ? new Date(drive.driveDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'TBA'}
                </span>
              </div>
            </div>
          </div>

          {/* Eligibility Verified Pill */}
          <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold block">Verified Candidate Eligibility</span>
              <span className="text-slate-400 text-[11px]">
                Your academic profile meets the CGPA, backlog limit, and department criteria.
              </span>
            </div>
          </div>

          {/* Student Profile Info snapshot */}
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-violet-400" />
              <span className="font-medium text-slate-200">{user?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
              <span>{user?.email}</span>
            </div>
          </div>

          {/* Remarks input */}
          <div>
            <label
              htmlFor="apply-remarks-input"
              className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Applicant Note / Remarks (Optional)
            </label>
            <textarea
              id="apply-remarks-input"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Interested in backend systems, experienced with React/Node.js, available for immediate start..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 resize-none transition-colors"
              maxLength={1000}
            />
            <span className="text-[10px] text-slate-500 text-right block mt-1">
              {remarks.length} / 1000 characters
            </span>
          </div>

          {/* Duplicate warning note */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Duplicate applications are prevented. Once applied, your application status can be tracked anytime on the portal.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={applying}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="confirm-submit-application-btn"
              type="submit"
              disabled={applying}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {applying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Application...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm &amp; Apply</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyConfirmModal;
