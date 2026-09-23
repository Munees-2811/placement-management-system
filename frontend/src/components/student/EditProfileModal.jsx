import React, { useState, useEffect } from 'react';
import { X, Save, User2, Phone, BookOpen, Calendar, GraduationCap, Loader2 } from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Biomedical Engineering',
  'Data Science and Artificial Intelligence',
  'Cybersecurity',
  'Other',
];

const EditProfileModal = ({ profile, isOpen, onClose, onSave, saving }) => {
  const [form, setForm] = useState({
    phone: '',
    department: '',
    batch: '',
    cgpa: '',
    bio: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profile && isOpen) {
      setForm({
        phone: profile.phone || '',
        department: profile.department || '',
        batch: profile.batch || '',
        cgpa: profile.cgpa !== null && profile.cgpa !== undefined ? String(profile.cgpa) : '',
        bio: profile.bio || '',
      });
      setErrors({});
    }
  }, [profile, isOpen]);

  const validate = () => {
    const errs = {};
    if (form.cgpa !== '') {
      const val = Number(form.cgpa);
      if (isNaN(val) || val < 0 || val > 10) {
        errs.cgpa = 'CGPA must be between 0.0 and 10.0';
      }
    }
    if (form.bio && form.bio.length > 500) {
      errs.bio = 'Bio cannot exceed 500 characters';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const payload = {
      phone: form.phone.trim(),
      department: form.department.trim(),
      batch: form.batch.trim(),
      cgpa: form.cgpa !== '' ? Number(form.cgpa) : null,
      bio: form.bio.trim(),
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/50 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <User2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Academic Profile</h2>
              <p className="text-xs text-slate-400">Update your personal and academic details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              placeholder="+91 9876543210"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Department
            </label>
            <select
              id="department"
              name="department"
              value={form.department}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none"
            >
              <option value="">Select your department...</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Batch & CGPA side by side */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="batch" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                Batch / Year
              </label>
              <input
                id="batch"
                name="batch"
                type="text"
                value={form.batch}
                onChange={handleChange}
                placeholder="e.g. 2022-2026"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="cgpa" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                CGPA (0–10)
              </label>
              <input
                id="cgpa"
                name="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={form.cgpa}
                onChange={handleChange}
                placeholder="e.g. 8.75"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                  errors.cgpa ? 'border-rose-500' : 'border-slate-800'
                }`}
              />
              {errors.cgpa && (
                <p className="text-rose-400 text-xs mt-1">{errors.cgpa}</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              <User2 className="w-3.5 h-3.5 text-violet-400" />
              Career Objective / Bio
              <span className="text-slate-500 font-normal ml-auto">{form.bio.length}/500</span>
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={500}
              value={form.bio}
              onChange={handleChange}
              placeholder="A brief personal statement or career objective to attract recruiters..."
              className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none ${
                errors.bio ? 'border-rose-500' : 'border-slate-800'
              }`}
            />
            {errors.bio && (
              <p className="text-rose-400 text-xs mt-1">{errors.bio}</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
