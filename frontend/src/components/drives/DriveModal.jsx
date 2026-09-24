import React, { useState, useEffect } from 'react';
import {
  X,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  DollarSign,
  AlertCircle,
  Loader2,
  Plus,
  Check,
  Award,
} from 'lucide-react';

const POPULAR_DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Data Science & AI',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
];

const DriveModal = ({ isOpen, onClose, onSave, drive, companies = [], saving }) => {
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    company: '',
    jobRole: '',
    jobDescription: '',
    salaryPackage: '',
    eligibleDepartments: [],
    minimumCGPA: 7.0,
    maximumBacklogs: 0,
    graduationYear: currentYear,
    applicationDeadline: '',
    driveDate: '',
    status: 'UPCOMING',
  });

  const [customDept, setCustomDept] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (drive) {
      // Format ISO string to datetime-local friendly string (YYYY-MM-DDTHH:mm)
      const formatDateForInput = (isoStr) => {
        if (!isoStr) return '';
        try {
          const d = new Date(isoStr);
          return d.toISOString().slice(0, 16);
        } catch {
          return '';
        }
      };

      setFormData({
        company: drive.company?._id || drive.company || '',
        jobRole: drive.jobRole || '',
        jobDescription: drive.jobDescription || '',
        salaryPackage: drive.salaryPackage || '',
        eligibleDepartments: Array.isArray(drive.eligibleDepartments)
          ? [...drive.eligibleDepartments]
          : [],
        minimumCGPA: drive.minimumCGPA !== undefined ? drive.minimumCGPA : 7.0,
        maximumBacklogs: drive.maximumBacklogs !== undefined ? drive.maximumBacklogs : 0,
        graduationYear: drive.graduationYear || currentYear,
        applicationDeadline: formatDateForInput(drive.applicationDeadline),
        driveDate: formatDateForInput(drive.driveDate),
        status: drive.status || 'UPCOMING',
      });
    } else {
      // Default dates: deadline in 14 days, drive in 21 days
      const now = new Date();
      const deadlineDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      const driveDay = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000);

      setFormData({
        company: companies[0]?._id || '',
        jobRole: '',
        jobDescription: '',
        salaryPackage: '',
        eligibleDepartments: [
          'Computer Science and Engineering',
          'Information Technology',
        ],
        minimumCGPA: 7.0,
        maximumBacklogs: 0,
        graduationYear: currentYear,
        applicationDeadline: deadlineDate.toISOString().slice(0, 16),
        driveDate: driveDay.toISOString().slice(0, 16),
        status: 'UPCOMING',
      });
    }
    setErrors({});
    setTouched({});
  }, [drive, isOpen, companies, currentYear]);

  if (!isOpen) return null;

  const validateField = (name, value) => {
    switch (name) {
      case 'company':
        if (!value) return 'Please select an associated company';
        return null;
      case 'jobRole':
        if (!value.trim()) return 'Job role is required';
        if (value.trim().length < 2) return 'Must be at least 2 characters';
        if (value.trim().length > 120) return 'Cannot exceed 120 characters';
        return null;
      case 'jobDescription':
        if (!value.trim()) return 'Job description is required';
        if (value.length > 4000) return 'Cannot exceed 4000 characters';
        return null;
      case 'salaryPackage':
        if (!value.trim()) return 'Salary package is required';
        if (value.length > 100) return 'Cannot exceed 100 characters';
        return null;
      case 'eligibleDepartments':
        if (!Array.isArray(value) || value.length === 0) {
          return 'Select at least one eligible department';
        }
        return null;
      case 'minimumCGPA': {
        const val = Number(value);
        if (isNaN(val) || val < 0 || val > 10) return 'CGPA must be between 0.0 and 10.0';
        return null;
      }
      case 'maximumBacklogs': {
        const val = Number(value);
        if (isNaN(val) || val < 0) return 'Backlogs must be 0 or positive';
        return null;
      }
      case 'graduationYear': {
        const val = Number(value);
        if (isNaN(val) || val < 2020 || val > 2035) return 'Year must be between 2020 and 2035';
        return null;
      }
      case 'applicationDeadline':
        if (!value) return 'Application deadline is required';
        return null;
      case 'driveDate':
        if (!value) return 'Drive date is required';
        return null;
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err }));
  };

  const toggleDepartment = (dept) => {
    setFormData((prev) => {
      const exists = prev.eligibleDepartments.includes(dept);
      const updated = exists
        ? prev.eligibleDepartments.filter((d) => d !== dept)
        : [...prev.eligibleDepartments, dept];
      const err = validateField('eligibleDepartments', updated);
      setErrors((p) => ({ ...p, eligibleDepartments: err }));
      return { ...prev, eligibleDepartments: updated };
    });
  };

  const handleAddCustomDept = (e) => {
    e.preventDefault();
    if (customDept.trim()) {
      const trimmed = customDept.trim();
      if (!formData.eligibleDepartments.includes(trimmed)) {
        toggleDepartment(trimmed);
      }
      setCustomDept('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    setTouched({
      company: true,
      jobRole: true,
      jobDescription: true,
      salaryPackage: true,
      eligibleDepartments: true,
      minimumCGPA: true,
      maximumBacklogs: true,
      graduationYear: true,
      applicationDeadline: true,
      driveDate: true,
      status: true,
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  const isEdit = Boolean(drive);

  return (
    <div
      id="drive-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        id="drive-modal-dialog"
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 id="drive-modal-title" className="text-xl font-bold text-white tracking-tight">
                {isEdit ? 'Edit Placement Drive' : 'Schedule New Placement Drive'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEdit
                  ? 'Update campus drive schedule, eligibility criteria, and job details'
                  : 'Announce a new campus recruitment drive and set eligibility rules for students'}
              </p>
            </div>
          </div>
          <button
            id="drive-modal-close-btn"
            onClick={onClose}
            disabled={saving}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Company & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label htmlFor="drive-input-company" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Partner Company <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building2 className="w-4 h-4" />
                </div>
                <select
                  id="drive-input-company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-8 py-2.5 bg-slate-950 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.company
                      ? 'border-rose-500/60 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                >
                  <option value="">Select a registered company...</option>
                  {companies.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.companyName} ({c.location})
                    </option>
                  ))}
                </select>
              </div>
              {errors.company && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.company}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="drive-input-status" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Drive Status <span className="text-rose-400">*</span>
              </label>
              <select
                id="drive-input-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="UPCOMING">Upcoming</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Job Role and Salary Package */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="drive-input-jobrole" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Job Role / Designation <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Briefcase className="w-4 h-4" />
                </div>
                <input
                  id="drive-input-jobrole"
                  name="jobRole"
                  type="text"
                  placeholder="e.g. Graduate Software Engineer"
                  value={formData.jobRole}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.jobRole
                      ? 'border-rose-500/60 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.jobRole && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.jobRole}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="drive-input-salary" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Salary Package (CTC) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                </div>
                <input
                  id="drive-input-salary"
                  name="salaryPackage"
                  type="text"
                  placeholder="e.g. 14 LPA (or ₹12,00,000 / annum)"
                  value={formData.salaryPackage}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.salaryPackage
                      ? 'border-rose-500/60 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.salaryPackage && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.salaryPackage}
                </p>
              )}
            </div>
          </div>

          {/* Job Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="drive-input-description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Job Description & Scope <span className="text-rose-400">*</span>
              </label>
              <span className={`text-[11px] ${formData.jobDescription.length > 4000 ? 'text-rose-400' : 'text-slate-500'}`}>
                {formData.jobDescription.length} / 4000
              </span>
            </div>
            <textarea
              id="drive-input-description"
              name="jobDescription"
              rows={3}
              placeholder="Outline responsibilities, core tech stacks, interview rounds, and required proficiencies..."
              value={formData.jobDescription}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full p-3 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all resize-none ${
                errors.jobDescription
                  ? 'border-rose-500/60 focus:ring-rose-500/30'
                  : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
              }`}
            />
            {errors.jobDescription && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.jobDescription}
              </p>
            )}
          </div>

          {/* Eligibility Criteria Box */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Eligibility & Academic Criteria</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Minimum CGPA */}
              <div>
                <label htmlFor="drive-input-cgpa" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Minimum CGPA (0-10) <span className="text-rose-400">*</span>
                </label>
                <input
                  id="drive-input-cgpa"
                  name="minimumCGPA"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.minimumCGPA}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                {errors.minimumCGPA && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.minimumCGPA}</p>
                )}
              </div>

              {/* Maximum Backlogs */}
              <div>
                <label htmlFor="drive-input-backlogs" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Max Backlogs Allowed <span className="text-rose-400">*</span>
                </label>
                <input
                  id="drive-input-backlogs"
                  name="maximumBacklogs"
                  type="number"
                  min="0"
                  max="20"
                  value={formData.maximumBacklogs}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                {errors.maximumBacklogs && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.maximumBacklogs}</p>
                )}
              </div>

              {/* Graduation Year */}
              <div>
                <label htmlFor="drive-input-batch" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Graduation Batch Year <span className="text-rose-400">*</span>
                </label>
                <input
                  id="drive-input-batch"
                  name="graduationYear"
                  type="number"
                  min="2020"
                  max="2035"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                {errors.graduationYear && (
                  <p className="mt-1 text-[11px] text-rose-400">{errors.graduationYear}</p>
                )}
              </div>
            </div>

            {/* Eligible Departments */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Eligible Departments ({formData.eligibleDepartments.length} selected) <span className="text-rose-400">*</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {POPULAR_DEPARTMENTS.map((dept) => {
                  const isSelected = formData.eligibleDepartments.includes(dept);
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => toggleDepartment(dept)}
                      className={`text-xs px-2.5 py-1 rounded-xl transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white border-slate-800'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{dept}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom department add */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Other department name..."
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCustomDept(e);
                  }}
                  className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 flex-1 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomDept}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium transition-colors"
                >
                  + Add
                </button>
              </div>

              {errors.eligibleDepartments && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.eligibleDepartments}
                </p>
              )}
            </div>
          </div>

          {/* Dates: Deadline and Drive Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="drive-input-deadline" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Application Deadline <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <input
                  id="drive-input-deadline"
                  name="applicationDeadline"
                  type="datetime-local"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.applicationDeadline
                      ? 'border-rose-500/60 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.applicationDeadline && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.applicationDeadline}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="drive-input-drivedate" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Drive Date (Event Day) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                </div>
                <input
                  id="drive-input-drivedate"
                  name="driveDate"
                  type="datetime-local"
                  value={formData.driveDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white focus:outline-none focus:ring-2 transition-all ${
                    errors.driveDate
                      ? 'border-rose-500/60 focus:ring-rose-500/30'
                      : 'border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
              </div>
              {errors.driveDate && (
                <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.driveDate}
                </p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              id="drive-modal-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              id="drive-modal-submit-btn"
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEdit ? 'Saving Changes...' : 'Creating Drive...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'Save Changes' : 'Announce Placement Drive'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriveModal;
