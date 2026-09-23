import React, { useState, useEffect } from 'react';
import { X, Save, BadgeCheck, Calendar, Link2, Building2, Loader2 } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-600/10 text-amber-400 border border-amber-500/20">
              <BadgeCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? 'Edit Certification' : 'Add Certification'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Update certification details' : 'Add an industry-recognized certificate'}
              </p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="cert-title" className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 block">
              Certificate Name *
            </label>
            <input
              id="cert-title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. AWS Cloud Practitioner, React Developer Certificate..."
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                errors.title ? 'border-rose-500' : 'border-slate-800'
              }`}
            />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Issuer */}
          <div>
            <label htmlFor="cert-issuer" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              Issuing Authority
            </label>
            <input
              id="cert-issuer"
              name="issuer"
              type="text"
              value={form.issuer}
              onChange={handleChange}
              placeholder="e.g. Amazon Web Services, Coursera, Google..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Issue Date */}
          <div>
            <label htmlFor="cert-date" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Issue Date
            </label>
            <input
              id="cert-date"
              name="issueDate"
              type="month"
              value={form.issueDate}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Credential URL */}
          <div>
            <label htmlFor="cert-url" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <Link2 className="w-3.5 h-3.5 text-indigo-400" />
              Credential Verification URL
            </label>
            <input
              id="cert-url"
              name="credentialUrl"
              type="url"
              value={form.credentialUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 text-sm font-medium transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold shadow-md shadow-amber-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : isEditing ? 'Update Certification' : 'Add Certification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificationModal;
