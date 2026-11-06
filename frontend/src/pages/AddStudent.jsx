import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users,
  GraduationCap,
  Mail,
  Lock,
  Hash,
  BookOpen,
  CalendarDays,
  RefreshCw,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { adminCreateStudent, adminListStudents } from '../api/adminApi';

// ─── Departments list ────────────────────────────────────────────────────────
const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Information Technology',
  'Electronics and Communication Engineering',
  'Electrical and Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Data Science and Artificial Intelligence',
  'Artificial Intelligence and Machine Learning',
  'Cybersecurity',
  'Biotechnology',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Other',
];

const ACADEMIC_YEARS = [
  'I Year',
  'II Year',
  'III Year',
  'IV Year',
  'Batch 2021-2025',
  'Batch 2022-2026',
  'Batch 2023-2027',
  'Batch 2024-2028',
  'Batch 2025-2029',
];

// ─── FormInput helper component ──────────────────────────────────────────────
const FormInput = ({
  label,
  id,
  icon: Icon,
  error,
  required,
  hint,
  ...inputProps
}) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium text-[#202B3C]">
      {label}
      {required && <span className="text-[#D14343] ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none">
          <Icon size={16} strokeWidth={1.8} />
        </span>
      )}
      <input
        id={id}
        {...inputProps}
        className={`w-full border rounded-lg bg-white text-[#202B3C] text-sm placeholder:text-[#A0AABA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3569A8]/30 focus:border-[#3569A8] ${
          Icon ? 'pl-9 pr-3' : 'px-3'
        } py-2.5 ${
          error
            ? 'border-[#D14343] bg-red-50/40'
            : 'border-[#E4E8EF] hover:border-[#B5C0CF]'
        }`}
      />
    </div>
    {error && (
      <p className="text-xs text-[#D14343] flex items-center gap-1 mt-0.5">
        <AlertCircle size={12} /> {error}
      </p>
    )}
    {hint && !error && (
      <p className="text-xs text-[#667085] mt-0.5">{hint}</p>
    )}
  </div>
);

// ─── SelectInput helper ──────────────────────────────────────────────────────
const FormSelect = ({ label, id, icon: Icon, error, required, options, ...selectProps }) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={id} className="text-sm font-medium text-[#202B3C]">
      {label}
      {required && <span className="text-[#D14343] ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none">
          <Icon size={16} strokeWidth={1.8} />
        </span>
      )}
      <select
        id={id}
        {...selectProps}
        className={`w-full border rounded-lg bg-white text-[#202B3C] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#3569A8]/30 focus:border-[#3569A8] appearance-none ${
          Icon ? 'pl-9 pr-8' : 'px-3 pr-8'
        } py-2.5 ${
          error
            ? 'border-[#D14343] bg-red-50/40'
            : 'border-[#E4E8EF] hover:border-[#B5C0CF]'
        }`}
      >
        {options.map((opt) =>
          typeof opt === 'string' ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </div>
    {error && (
      <p className="text-xs text-[#D14343] flex items-center gap-1 mt-0.5">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

// ─── Empty initial form state ─────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '',
  registerNumber: '',
  email: '',
  department: '',
  academicYear: '',
  password: '',
  confirmPassword: '',
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AddStudent = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  // Student list panel
  const [students, setStudents] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState(null);

  // Auto-dismiss toast after 5 s
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // Fetch student list
  const fetchStudents = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await adminListStudents();
      setStudents(res.data?.data || []);
    } catch (err) {
      setListError(err.response?.data?.message || 'Failed to load student list.');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required.';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';

    if (!form.email.trim()) errs.email = 'Email address is required.';
    else if (!/^[\w.+-]+@[\w-]+\.[\w.]{2,}$/.test(form.email.trim()))
      errs.email = 'Please enter a valid email address.';

    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';

    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm the password.';
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';

    return errs;
  };

  // ── Handle Change ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        registerNumber: form.registerNumber.trim(),
        email: form.email.trim(),
        department: form.department,
        academicYear: form.academicYear,
        password: form.password,
      };
      const res = await adminCreateStudent(payload);
      setToast({
        type: 'success',
        message: res.data?.message || 'Student account created successfully.',
      });
      setForm(EMPTY_FORM);
      setErrors({});
      // Refresh student list
      fetchStudents();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create student account.';
      setToast({ type: 'error', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset form ──────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-[#D14343]'
              : 'bg-emerald-50 border-emerald-200 text-[#16845B]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#667085] mb-1.5">
            <span>Portal</span>
            <span>›</span>
            <span>Admin</span>
            <span>›</span>
            <span className="text-[#202B3C] font-medium">Add Student</span>
          </div>
          <h1 className="text-2xl font-bold text-[#202B3C] leading-tight">Add Student</h1>
          <p className="text-sm text-[#667085] mt-1">
            Create a new student account and pre-fill their academic profile details.
          </p>
        </div>
        <Link
          to="/admin-portal"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] text-sm font-medium shadow-sm transition-colors shrink-0 self-start"
        >
          <Users size={16} strokeWidth={1.8} />
          Admin Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">

        {/* ── Registration Form ─────────────────────────────────────── */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-[#E4E8EF] shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="px-6 py-4 border-b border-[#E4E8EF] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
              <UserPlus size={16} strokeWidth={1.8} className="text-[#3569A8]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#202B3C]">Student Registration Form</h2>
              <p className="text-xs text-[#667085]">Fields marked with <span className="text-[#D14343]">*</span> are required</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* Full Name */}
              <div className="sm:col-span-2">
                <FormInput
                  label="Full Name"
                  id="name"
                  name="name"
                  type="text"
                  icon={GraduationCap}
                  placeholder="e.g. Arjun Kumar"
                  value={form.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  autoComplete="off"
                />
              </div>

              {/* Register Number */}
              <FormInput
                label="Register Number"
                id="registerNumber"
                name="registerNumber"
                type="text"
                icon={Hash}
                placeholder="e.g. 21CS001"
                value={form.registerNumber}
                onChange={handleChange}
                error={errors.registerNumber}
                hint="Must be unique per student"
                autoComplete="off"
              />

              {/* Email */}
              <FormInput
                label="Email Address"
                id="email"
                name="email"
                type="email"
                icon={Mail}
                placeholder="student@university.edu"
                value={form.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="off"
              />

              {/* Department */}
              <FormSelect
                label="Department"
                id="department"
                name="department"
                icon={BookOpen}
                value={form.department}
                onChange={handleChange}
                error={errors.department}
                options={[
                  { value: '', label: '— Select Department —' },
                  ...DEPARTMENTS.map((d) => ({ value: d, label: d })),
                ]}
              />

              {/* Academic Year */}
              <FormSelect
                label="Academic Year / Batch"
                id="academicYear"
                name="academicYear"
                icon={CalendarDays}
                value={form.academicYear}
                onChange={handleChange}
                error={errors.academicYear}
                options={[
                  { value: '', label: '— Select Year / Batch —' },
                  ...ACADEMIC_YEARS.map((y) => ({ value: y, label: y })),
                ]}
              />

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="password" className="text-sm font-medium text-[#202B3C]">
                  Password <span className="text-[#D14343]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none">
                    <Lock size={16} strokeWidth={1.8} />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`w-full border rounded-lg bg-white text-[#202B3C] text-sm placeholder:text-[#A0AABA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3569A8]/30 focus:border-[#3569A8] pl-9 pr-10 py-2.5 ${
                      errors.password
                        ? 'border-[#D14343] bg-red-50/40'
                        : 'border-[#E4E8EF] hover:border-[#B5C0CF]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#202B3C] transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[#D14343] flex items-center gap-1 mt-0.5">
                    <AlertCircle size={12} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-[#202B3C]">
                  Confirm Password <span className="text-[#D14343]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none">
                    <Lock size={16} strokeWidth={1.8} />
                  </span>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    className={`w-full border rounded-lg bg-white text-[#202B3C] text-sm placeholder:text-[#A0AABA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#3569A8]/30 focus:border-[#3569A8] pl-9 pr-10 py-2.5 ${
                      errors.confirmPassword
                        ? 'border-[#D14343] bg-red-50/40'
                        : 'border-[#E4E8EF] hover:border-[#B5C0CF]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] hover:text-[#202B3C] transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-[#D14343] flex items-center gap-1 mt-0.5">
                    <AlertCircle size={12} /> {errors.confirmPassword}
                  </p>
                )}
                {form.confirmPassword &&
                  !errors.confirmPassword &&
                  form.password === form.confirmPassword && (
                    <p className="text-xs text-[#16845B] flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={12} /> Passwords match
                    </p>
                  )}
              </div>
            </div>

            {/* Role info banner */}
            <div className="mt-5 flex items-start gap-3 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] px-4 py-3">
              <GraduationCap size={16} strokeWidth={1.8} className="text-[#3569A8] shrink-0 mt-0.5" />
              <p className="text-xs text-[#1E40AF]">
                The account will be automatically assigned the <strong>STUDENT</strong> role.
                The student can log in and update their profile after account creation.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-[#E4E8EF]">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#19365C] hover:bg-[#122844] active:bg-[#0e1f38] text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <UserPlus size={16} strokeWidth={1.8} />
                )}
                {submitting ? 'Creating Account…' : 'Create Student Account'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] font-medium text-sm shadow-sm transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                <Trash2 size={15} strokeWidth={1.8} />
                Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* ── Student List Panel ────────────────────────────────────── */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#E4E8EF] shadow-sm overflow-hidden">
          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-[#E4E8EF] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#F0FDF4] flex items-center justify-center shrink-0">
                <Users size={14} strokeWidth={1.8} className="text-[#16845B]" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#202B3C]">Registered Students</h2>
                <p className="text-xs text-[#667085]">
                  {loadingList ? 'Loading…' : `${students.length} student${students.length !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
            <button
              onClick={fetchStudents}
              disabled={loadingList}
              title="Refresh list"
              className="p-1.5 rounded-md text-[#667085] hover:text-[#202B3C] hover:bg-[#F5F7FA] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} strokeWidth={1.8} className={loadingList ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* List Body */}
          <div className="divide-y divide-[#E4E8EF] max-h-[520px] overflow-y-auto">
            {loadingList ? (
              <div className="flex items-center justify-center gap-2 py-12 text-[#667085]">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading students…</span>
              </div>
            ) : listError ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
                <AlertCircle size={28} className="text-[#D14343]/60" />
                <p className="text-sm text-[#D14343]">{listError}</p>
                <button
                  onClick={fetchStudents}
                  className="mt-1 text-xs text-[#3569A8] hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Retry
                </button>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
                <GraduationCap size={32} strokeWidth={1.5} className="text-[#CBD5E1]" />
                <p className="text-sm font-medium text-[#667085]">No students registered yet</p>
                <p className="text-xs text-[#A0AABA]">Use the form to add the first student.</p>
              </div>
            ) : (
              students.map((s) => (
                <div key={s._id} className="px-5 py-3.5 hover:bg-[#F8FAFC] transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-[#19365C] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {s.name
                        .trim()
                        .split(' ')
                        .slice(0, 2)
                        .map((w) => w[0])
                        .join('')
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#202B3C] truncate leading-tight">
                        {s.name}
                      </p>
                      <p className="text-xs text-[#667085] truncate">{s.email}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                        {s.registerNumber && (
                          <span className="text-[11px] text-[#667085] flex items-center gap-1">
                            <Hash size={10} /> {s.registerNumber}
                          </span>
                        )}
                        {s.department && (
                          <span className="text-[11px] text-[#667085] truncate max-w-[140px]">
                            {s.department.split(' ').slice(0, 3).join(' ')}
                          </span>
                        )}
                        {s.academicYear && (
                          <span className="text-[11px] text-[#667085]">{s.academicYear}</span>
                        )}
                      </div>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE] mt-1">
                      STUDENT
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {students.length > 0 && (
            <div className="px-5 py-3 border-t border-[#E4E8EF] bg-[#F8FAFC]">
              <p className="text-xs text-[#667085] text-center">
                Showing all {students.length} registered student{students.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudent;

