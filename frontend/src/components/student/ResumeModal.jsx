import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Link2, FileEdit, Loader2 } from 'lucide-react';

const ResumeModal = ({ resume, isOpen, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ url: '', fileName: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        url: resume?.url || '',
        fileName: resume?.fileName || '',
      });
      setErrors({});
    }
  }, [resume, isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.url.trim()) {
      errs.url = 'Resume URL is required';
    } else if (!form.url.startsWith('http')) {
      errs.url = 'Please enter a valid URL starting with http:// or https://';
    }
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
    onSave({
      url: form.url.trim(),
      fileName: form.fileName.trim() || 'student_resume.pdf',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {resume?.url ? 'Update Resume' : 'Upload Resume'}
              </h2>
              <p className="text-xs text-slate-400">
                Add a shareable link to your CV or resume document
              </p>
            </div>
          </div>
          <button onClick={onClose} type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* URL */}
          <div>
            <label htmlFor="resume-url" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <Link2 className="w-3.5 h-3.5 text-emerald-400" />
              Resume Document URL *
            </label>
            <input
              id="resume-url"
              name="url"
              type="text"
              value={form.url}
              onChange={handleChange}
              placeholder="https://drive.google.com/file/d/... or any public link"
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                errors.url ? 'border-rose-500' : 'border-slate-800'
              }`}
            />
            {errors.url && <p className="text-rose-400 text-xs mt-1">{errors.url}</p>}
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-1">
              <span>💡</span> Share a Google Drive, Dropbox, or OneDrive link with view permission enabled.
            </p>
          </div>

          {/* File Name */}
          <div>
            <label htmlFor="resume-name" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Display Name <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              id="resume-name"
              name="fileName"
              type="text"
              value={form.fileName}
              onChange={handleChange}
              placeholder="e.g. Raj_Kumar_Resume_2026.pdf"
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : resume?.url ? 'Update Resume' : 'Save Resume'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeModal;
