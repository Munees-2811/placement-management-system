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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !applying) onClose();
      }}
    >
      <div
        id="apply-modal-dialog"
        className="w-full max-w-lg bg-white border border-[#E4E8EF] rounded-2xl shadow-xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F8FAFC] border-b border-[#E4E8EF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-[#16845B] border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202B3C]">Apply for Placement Drive</h2>
              <p className="text-xs text-[#667085]">Confirm your application submission</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={applying}
            className="p-1.5 text-[#667085] hover:text-[#202B3C] rounded-lg hover:bg-[#E2E8F0] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Drive Card */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs text-[#3569A8] font-semibold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {companyName}
                </span>
                <h3 className="text-base font-bold text-[#202B3C] mt-0.5">{drive.jobRole}</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-[#16845B] border border-emerald-200 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {drive.salaryPackage}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-[#667085] border-t border-[#E4E8EF]">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#3569A8]" />
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
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-[#16845B]">
            <ShieldCheck className="w-5 h-5 text-[#16845B] shrink-0" />
            <div>
              <span className="font-semibold block">Verified Candidate Eligibility</span>
              <span className="text-[#667085] text-[11px]">
                Your academic profile meets the CGPA, backlog limit, and department criteria.
              </span>
            </div>
          </div>

          {/* Student Profile Info snapshot */}
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] flex items-center justify-between text-xs text-[#667085]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#3569A8]" />
              <span className="font-medium text-[#202B3C]">{user?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#667085]">
              <GraduationCap className="w-4 h-4 text-[#3569A8]" />
              <span>{user?.email}</span>
            </div>
          </div>

          {/* Remarks input */}
          <div>
            <label
              htmlFor="apply-remarks-input"
              className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#3569A8]" />
              Applicant Note / Remarks (Optional)
            </label>
            <textarea
              id="apply-remarks-input"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g., Interested in backend systems, experienced with React/Node.js, available for immediate start..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E4E8EF] focus:border-[#3569A8] focus:ring-1 focus:ring-blue-100 text-xs text-[#202B3C] placeholder-[#94A3B8] resize-none transition-colors"
              maxLength={1000}
            />
            <span className="text-[10px] text-[#667085] text-right block mt-1">
              {remarks.length} / 1000 characters
            </span>
          </div>

          {/* Duplicate warning note */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-[#C58A25] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#C58A25] shrink-0 mt-0.5" />
            <span>
              Duplicate applications are prevented. Once applied, your application status can be tracked anytime on the portal.
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E4E8EF]">
            <button
              type="button"
              onClick={onClose}
              disabled={applying}
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#667085] hover:text-[#202B3C] hover:bg-[#F1F5F9] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="confirm-submit-application-btn"
              type="submit"
              disabled={applying}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#16845B] hover:bg-[#126848] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
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
