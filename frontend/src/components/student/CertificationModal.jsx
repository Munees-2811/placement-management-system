import React, { useState, useEffect } from 'react';
import { X, Save, BadgeCheck, Calendar, Link2, Building2, Loader2, AlertCircle } from 'lucide-react';

const CertificationModal = ({ cert, isOpen, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    credentialUrl: '',
  });
  const [errors, setErrors] = useState({});

  const isEditing = !!cert?._id;

  useEffect(() => {
    if (isOpen) {
      if (cert) {
        setForm({
          title: cert.title || '',
          issuer: cert.issuer || '',
          issueDate: cert.issueDate || '',
          credentialUrl: cert.credentialUrl || '',
        });
      } else {
        setForm({ title: '', issuer: '', issueDate: '', credentialUrl: '' });
      }
      setErrors({});
    }
  }, [cert, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Certification title is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave(
      {
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        issueDate: form.issueDate.trim(),
        credentialUrl: form.credentialUrl.trim(),
      },
      cert?._id
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white border border-[#E4E8EF] rounded-2xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E8EF] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#3569A8]">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202B3C]">
                {isEditing ? 'Edit Certification' : 'Add Certification'}
              </h2>
              <p className="text-xs text-[#667085]">
                {isEditing ? 'Update credential details' : 'Add an industry-recognized certification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            disabled={saving}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#202B3C] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="cert-title" className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5">
              Certificate Name <span className="text-[#D14343]">*</span>
            </label>
            <input
              id="cert-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. AWS Certified Solutions Architect, Meta React Specialist"
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all ${
                errors.title
                  ? 'border-[#D14343] focus:ring-red-100'
                  : 'border-[#E4E8EF] focus:border-[#3569A8] focus:ring-blue-100'
              }`}
            />
            {errors.title && (
              <p className="text-[#D14343] text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Issuer */}
          <div>
            <label htmlFor="cert-issuer" className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5">
              Issuing Organization
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Building2 className="w-4 h-4" />
              </div>
              <input
                id="cert-issuer"
                name="issuer"
                type="text"
                value={form.issuer}
                onChange={handleChange}
                placeholder="e.g. Amazon Web Services, Google, Coursera"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E8EF] rounded-lg text-sm text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Issue Date */}
          <div>
            <label htmlFor="cert-date" className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5">
              Issue Month &amp; Year
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                id="cert-date"
                name="issueDate"
                type="month"
                value={form.issueDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E8EF] rounded-lg text-sm text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Credential URL */}
          <div>
            <label htmlFor="cert-url" className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5">
              Credential Verification Link
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Link2 className="w-4 h-4" />
              </div>
              <input
                id="cert-url"
                name="credentialUrl"
                type="url"
                value={form.credentialUrl}
                onChange={handleChange}
                placeholder="https://credly.com/badges/..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E8EF] rounded-lg text-sm text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-blue-100 transition-all font-mono text-xs"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E8EF]">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#667085] hover:text-[#202B3C] hover:bg-[#F1F5F9] border border-[#E4E8EF] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#19365C] hover:bg-[#132B4A] text-white text-sm font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditing ? 'Update Certification' : 'Save Certificate'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificationModal;
