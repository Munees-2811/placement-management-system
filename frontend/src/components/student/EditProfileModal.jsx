import React, { useState, useEffect } from 'react';
import { X, Save, User2, Phone, BookOpen, Calendar, GraduationCap, Loader2, AlertCircle } from 'lucide-react';

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
    backlogs: '0',
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
        backlogs: profile.backlogs !== null && profile.backlogs !== undefined ? String(profile.backlogs) : '0',
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
    if (form.backlogs !== '') {
      const bl = Number(form.backlogs);
      if (isNaN(bl) || bl < 0 || !Number.isInteger(bl)) {
        errs.backlogs = 'Backlogs must be a non-negative whole number (0, 1, 2…)';
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
      backlogs: form.backlogs !== '' ? Number(form.backlogs) : 0,
      bio: form.bio.trim(),
    };
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white border border-[#E4E8EF] rounded-2xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E8EF] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#3569A8]">
              <User2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#202B3C]">Edit Academic Profile</h2>
              <p className="text-xs text-[#667085]">Update your academic standing and placement contact</p>
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
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <Phone className="w-4 h-4" />
              </div>
              <input
                id="phone"
                name="phone"
                type="text"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E8EF] rounded-lg text-sm text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-blue-100 transition-all font-mono"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label htmlFor="department" className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5">
              Department
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                <BookOpen className="w-4 h-4" />
              </div>
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-[#E4E8EF] rounded-lg text-sm text-[#202B3C] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer"
              >
                <option value="">Select your department...</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Batch & CGPA side by side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="batch" className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5">
                Batch / Year
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  id="batch"
                  name="batch"
                  type="text"
                  value={form.batch}
                  onChange={handleChange}
                  placeholder="e.g. 2022-2026"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4E8EF] rounded-lg text-sm text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:border-[#3569A8] focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cgpa" className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5">
                CGPA (0.00 – 10.00)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <GraduationCap className="w-4 h-4" />
                </div>
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
                  className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all ${
                    errors.cgpa
                      ? 'border-[#D14343] focus:ring-red-100'
                      : 'border-[#E4E8EF] focus:border-[#3569A8] focus:ring-blue-100'
                  }`}
                />
              </div>
              {errors.cgpa && (
                <p className="text-[#D14343] text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.cgpa}
                </p>
              )}
            </div>
          </div>

          {/* Active Backlogs */}
          <div>
            <label htmlFor="backlogs" className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider mb-1.5">
              Active Backlogs
              <span className="text-[#667085] font-normal text-[11px] ml-1">(Standing Arrears)</span>
            </label>
            <input
              id="backlogs"
              name="backlogs"
              type="number"
              step="1"
              min="0"
              max="20"
              value={form.backlogs}
              onChange={handleChange}
              placeholder="0"
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all ${
                errors.backlogs
                  ? 'border-[#D14343] focus:ring-red-100'
                  : 'border-[#E4E8EF] focus:border-[#3569A8] focus:ring-blue-100'
              }`}
            />
            {errors.backlogs && (
              <p className="text-[#D14343] text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.backlogs}
              </p>
            )}
            <p className="text-[#667085] text-[11px] mt-1">
              Enter 0 if all semesters are cleared. Automated drive filters evaluate this count.
            </p>
          </div>

          {/* Bio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="bio" className="block text-xs font-semibold text-[#202B3C] uppercase tracking-wider">
                Career Objective / Brief Bio
              </label>
              <span className="text-[#667085] text-[11px]">{form.bio.length}/500</span>
            </div>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              maxLength={500}
              value={form.bio}
              onChange={handleChange}
              placeholder="Brief professional summary highlighting your career goals and core strengths..."
              className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-[#202B3C] placeholder-[#94A3B8] focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.bio
                  ? 'border-[#D14343] focus:ring-red-100'
                  : 'border-[#E4E8EF] focus:border-[#3569A8] focus:ring-blue-100'
              }`}
            />
            {errors.bio && (
              <p className="text-[#D14343] text-xs mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.bio}
              </p>
            )}
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
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
