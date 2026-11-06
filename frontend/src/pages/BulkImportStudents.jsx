import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  FileUp,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Users,
  UserCheck,
  UserX,
  FileCheck,
  RefreshCw,
  Trash2,
  HelpCircle,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Filter,
  Mail,
  Send,
  KeyRound,
} from 'lucide-react';
import { adminBulkImportStudents, adminResendCredentials } from '../api/adminApi';

// ── Sample Template Data ───────────────────────────────────────────────────────
const SAMPLE_TEMPLATE_ROWS = [
  {
    'Name': 'Rahul Sharma',
    'Register Number': '21CS001',
    'Email': 'rahul.s@university.edu',
    'Department': 'Computer Science and Engineering',
    'Academic Year': 'Batch 2021-2025',
    'CGPA': '8.75',
    'Backlogs': '0',
    'Phone': '+91 9876543210',
    'Password': '',
  },
  {
    'Name': 'Priya Patel',
    'Register Number': '21IT042',
    'Email': 'priya.p@university.edu',
    'Department': 'Information Technology',
    'Academic Year': 'Batch 2021-2025',
    'CGPA': '9.10',
    'Backlogs': '0',
    'Phone': '+91 9876543211',
    'Password': '',
  },
  {
    'Name': 'Karthik Raja',
    'Register Number': '22EC018',
    'Email': 'karthik.r@university.edu',
    'Department': 'Electronics and Communication Engineering',
    'Academic Year': 'Batch 2022-2026',
    'CGPA': '7.80',
    'Backlogs': '1',
    'Phone': '+91 9876543212',
    'Password': '',
  },
  {
    'Name': 'Ananya Iyer',
    'Register Number': '23DS009',
    'Email': 'ananya.i@university.edu',
    'Department': 'Data Science and Artificial Intelligence',
    'Academic Year': 'Batch 2023-2027',
    'CGPA': '8.95',
    'Backlogs': '0',
    'Phone': '+91 9876543213',
    'Password': '',
  },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Normalize Column Names from CSV/Excel Headers ──────────────────────────────
const normalizeRow = (rawRow, rowIndex) => {
  const getVal = (...keys) => {
    for (const k of keys) {
      for (const rawKey of Object.keys(rawRow)) {
        if (rawKey.trim().toLowerCase() === k.toLowerCase()) {
          return String(rawRow[rawKey] || '').trim();
        }
      }
    }
    return '';
  };

  const name = getVal('name', 'full name', 'student name', 'candidate name');
  const registerNumber = getVal('register number', 'reg number', 'reg no', 'reg_no', 'roll no', 'roll number', 'id');
  const email = getVal('email', 'email address', 'mail', 'student email').toLowerCase();
  const department = getVal('department', 'dept', 'branch', 'stream');
  const academicYear = getVal('academic year', 'batch', 'year', 'year / batch');
  const cgpa = getVal('cgpa', 'gpa', 'score');
  const backlogs = getVal('backlogs', 'arrears', 'backlog');
  const phone = getVal('phone', 'phone number', 'mobile', 'contact');
  const password = getVal('password', 'temp password', 'initial password');

  // Validate record
  const errors = [];
  if (!name || name.length < 2) {
    errors.push('Name is required (min 2 characters)');
  }
  if (!email) {
    errors.push('Email is required');
  } else if (!EMAIL_REGEX.test(email)) {
    errors.push('Invalid email format');
  }

  return {
    rowNumber: rowIndex + 1,
    name,
    registerNumber,
    email,
    department,
    academicYear,
    cgpa,
    backlogs,
    phone,
    password,
    isValid: errors.length === 0,
    errors,
  };
};

const BulkImportStudents = () => {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'VALID' | 'INVALID'
  const [autoGeneratePasswords, setAutoGeneratePasswords] = useState(true);
  const [defaultPassword, setDefaultPassword] = useState('Student@Password123');

  // Import State
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState(null); // { summary, createdStudents, failedRecords }

  // Resend State
  const [resendingId, setResendingId] = useState(null);
  const [resendStatusMap, setResendStatusMap] = useState({});

  const fileInputRef = useRef(null);

  // ── Drag & Drop Handlers ──────────────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      processFile(droppedFiles[0]);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      processFile(selected[0]);
    }
  };

  // ── Process File via SheetJS (handles .xlsx, .xls, .csv) ─────────────────
  const processFile = (uploadedFile) => {
    const validExts = ['.csv', '.xlsx', '.xls'];
    const hasValidExt = validExts.some((ext) => uploadedFile.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      alert('Please upload a valid CSV (.csv) or Excel (.xlsx, .xls) spreadsheet.');
      return;
    }

    setFile(uploadedFile);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('The uploaded file appears to be empty or contains no valid rows.');
          setParsedRows([]);
          return;
        }

        // Intra-batch duplicate detection
        const emailCounts = {};
        const regCounts = {};

        rawJson.forEach((raw) => {
          const em = String(raw.Email || raw.email || raw['Email Address'] || '').trim().toLowerCase();
          const reg = String(raw['Register Number'] || raw.registerNumber || raw['Reg No'] || '').trim().toLowerCase();
          if (em) emailCounts[em] = (emailCounts[em] || 0) + 1;
          if (reg) regCounts[reg] = (regCounts[reg] || 0) + 1;
        });

        const normalized = rawJson.map((raw, idx) => {
          const rowObj = normalizeRow(raw, idx);
          if (rowObj.email && emailCounts[rowObj.email] > 1) {
            rowObj.isValid = false;
            rowObj.errors.push('Duplicate email address in this file');
          }
          if (rowObj.registerNumber && regCounts[rowObj.registerNumber.toLowerCase()] > 1) {
            rowObj.isValid = false;
            rowObj.errors.push('Duplicate register number in this file');
          }
          return rowObj;
        });

        setParsedRows(normalized);
      } catch (err) {
        alert('Failed to parse file: ' + err.message);
      }
    };

    reader.readAsBinaryString(uploadedFile);
  };

  // ── Template Download Handlers ─────────────────────────────────────────────
  const downloadExcelTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student_Import');
    XLSX.writeFile(wb, 'student_bulk_import_template.xlsx');
  };

  const downloadCsvTemplate = () => {
    const ws = XLSX.utils.json_to_sheet(SAMPLE_TEMPLATE_ROWS);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_bulk_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Clear / Reset File ─────────────────────────────────────────────────────
  const handleClear = () => {
    setFile(null);
    setParsedRows([]);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ── Filter Parsed Rows ─────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    if (filterMode === 'VALID') return parsedRows.filter((r) => r.isValid);
    if (filterMode === 'INVALID') return parsedRows.filter((r) => !r.isValid);
    return parsedRows;
  }, [parsedRows, filterMode]);

  const validCount = useMemo(() => parsedRows.filter((r) => r.isValid).length, [parsedRows]);
  const invalidCount = useMemo(() => parsedRows.filter((r) => !r.isValid).length, [parsedRows]);

  // ── Submit Import ──────────────────────────────────────────────────────────
  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('There are no valid student records to import.');
      return;
    }

    setImporting(true);
    setImportProgress(20);
    setResendStatusMap({});

    try {
      const timer = setInterval(() => {
        setImportProgress((p) => (p < 85 ? p + 15 : p));
      }, 300);

      const payload = {
        students: validRows,
        autoGeneratePasswords,
        defaultPassword: defaultPassword.trim() || 'Student@Password123',
      };

      const res = await adminBulkImportStudents(payload);

      clearInterval(timer);
      setImportProgress(100);
      setImportResult(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Bulk import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  // ── Resend Credentials ─────────────────────────────────────────────────────
  const handleResendCredentials = async (studentId, studentEmail) => {
    try {
      setResendingId(studentId);
      const res = await adminResendCredentials(studentId);
      setResendStatusMap((prev) => ({
        ...prev,
        [studentId]: {
          success: true,
          message: res.data?.message || `New credentials dispatched to ${studentEmail}.`,
        },
      }));
    } catch (err) {
      setResendStatusMap((prev) => ({
        ...prev,
        [studentId]: {
          success: false,
          message: err.response?.data?.message || 'Failed to dispatch credentials email.',
        },
      }));
    } finally {
      setResendingId(null);
    }
  };

  // ── Export Failed Records to CSV ───────────────────────────────────────────
  const exportFailedRecords = () => {
    if (!importResult?.failedRecords || importResult.failedRecords.length === 0) return;
    const exportData = importResult.failedRecords.map((f) => ({
      'Row #': f.row,
      'Name': f.name,
      'Register Number': f.registerNumber,
      'Email': f.email,
      'Failure Reason': f.reason,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Failed_Records');
    XLSX.writeFile(wb, 'failed_student_imports.xlsx');
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#667085] mb-1.5">
            <span>Portal</span>
            <span>›</span>
            <span>Admin</span>
            <span>›</span>
            <span className="text-[#202B3C] font-medium">Bulk Import Students</span>
          </div>
          <h1 className="text-2xl font-bold text-[#202B3C] leading-tight">Bulk Import Students</h1>
          <p className="text-sm text-[#667085] mt-1">
            Upload CSV or Excel spreadsheets to batch register student candidate accounts.
          </p>
        </div>

        {/* Quick Template Download Actions */}
        <div className="flex items-center gap-2.5 shrink-0 self-start">
          <button
            onClick={downloadExcelTemplate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            title="Download Excel Template"
          >
            <FileSpreadsheet size={14} className="text-[#16845B]" />
            <span>Excel Template</span>
          </button>
          <button
            onClick={downloadCsvTemplate}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            title="Download CSV Template"
          >
            <Download size={14} className="text-[#3569A8]" />
            <span>CSV Template</span>
          </button>
          <Link
            to="/admin/add-student"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <span>Single Student</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ── Drag & Drop Upload Zone ────────────────────────────────────────── */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !file && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          file
            ? 'border-[#E4E8EF] bg-white cursor-default'
            : isDragging
            ? 'border-[#3569A8] bg-[#EFF6FF] cursor-pointer scale-[1.005]'
            : 'border-[#CBD5E1] hover:border-[#3569A8] bg-white hover:bg-[#F8FAFC] cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleFileChange}
          className="hidden"
        />

        {!file ? (
          <div className="flex flex-col items-center justify-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] text-[#3569A8] flex items-center justify-center mb-4 border border-[#BFDBFE]">
              <UploadCloud size={28} strokeWidth={1.8} />
            </div>
            <h3 className="text-base font-bold text-[#202B3C] mb-1">
              Drop your student sheet here, or <span className="text-[#3569A8] underline">browse</span>
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed mb-4">
              Supports <strong>.xlsx</strong>, <strong>.xls</strong>, and <strong>.csv</strong> spreadsheets up to 500 records per upload.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-[#667085]">
              <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] font-mono">Name</span>
              <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] font-mono">Register Number</span>
              <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] font-mono">Email</span>
              <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] font-mono">Department</span>
              <span className="px-2.5 py-1 rounded-md bg-[#F1F5F9] font-mono">Academic Year</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-[#EBFDF5] text-[#16845B] border border-[#A7F3D0] flex items-center justify-center shrink-0">
                <FileSpreadsheet size={24} strokeWidth={1.8} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#202B3C]">{file.name}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE]">
                    {file.name.split('.').pop()?.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-[#667085] mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} total rows parsed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="px-3 py-1.5 rounded-lg border border-[#E4E8EF] bg-white text-xs font-semibold text-[#202B3C] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={handleClear}
                disabled={importing}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-xs font-semibold text-[#D14343] hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Post-Import Result Summary Banner ─────────────────────────────── */}
      {importResult && (
        <div className="bg-white rounded-xl border border-[#E4E8EF] shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBFDF5] text-[#16845B] border border-[#A7F3D0] flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#202B3C]">Bulk Import Completed</h3>
                <p className="text-xs text-[#667085] mt-0.5">{importResult.message}</p>
              </div>
            </div>

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#19365C] text-white text-xs font-semibold shadow-sm hover:bg-[#122844] transition-colors"
            >
              <span>View in Portal</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Metric KPI Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E4E8EF]">
              <p className="text-[11px] font-semibold uppercase text-[#667085]">Total Processed</p>
              <p className="text-xl font-bold text-[#202B3C] mt-0.5">{importResult.summary?.total || 0}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#EBFDF5] border border-[#A7F3D0]">
              <p className="text-[11px] font-semibold uppercase text-[#16845B]">Accounts Created</p>
              <p className="text-xl font-bold text-[#16845B] mt-0.5">{importResult.summary?.successfulCount || 0}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE]">
              <p className="text-[11px] font-semibold uppercase text-[#1E40AF]">Emails Dispatched</p>
              <p className="text-xl font-bold text-[#1E40AF] mt-0.5">{importResult.summary?.emailsSent || 0}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA]">
              <p className="text-[11px] font-semibold uppercase text-[#D14343]">Failed Records</p>
              <p className="text-xl font-bold text-[#D14343] mt-0.5">{importResult.summary?.failedCount || 0}</p>
            </div>
          </div>

          {/* Created Students Account & Email Delivery Table */}
          {importResult.createdStudents && importResult.createdStudents.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#16845B]" />
                  <h4 className="text-xs font-bold text-[#202B3C] uppercase tracking-wider">
                    Created Student Accounts ({importResult.createdStudents.length})
                  </h4>
                </div>
                <span className="text-xs text-[#667085]">
                  First login requires student to set permanent password
                </span>
              </div>

              <div className="overflow-x-auto border border-[#E4E8EF] rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#F8FAFC] text-[#667085] uppercase tracking-wider font-semibold border-b border-[#E4E8EF]">
                    <tr>
                      <th className="px-4 py-2.5">Student Name</th>
                      <th className="px-4 py-2.5">Email Address</th>
                      <th className="px-4 py-2.5">Reg. No.</th>
                      <th className="px-4 py-2.5">Department</th>
                      <th className="px-4 py-2.5">Email Delivery Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E8EF] bg-white">
                    {importResult.createdStudents.map((s) => {
                      const resendInfo = resendStatusMap[s._id];
                      const isResending = resendingId === s._id;

                      return (
                        <tr key={s._id} className="hover:bg-[#F8FAFC]">
                          <td className="px-4 py-3 font-semibold text-[#202B3C]">{s.name}</td>
                          <td className="px-4 py-3 text-[#667085]">{s.email}</td>
                          <td className="px-4 py-3 font-mono text-[#202B3C]">{s.registerNumber || '—'}</td>
                          <td className="px-4 py-3 text-[#667085]">{s.department || '—'}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                                s.emailSent
                                  ? 'bg-[#EBFDF5] text-[#16845B] border border-[#A7F3D0]'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <Mail size={11} />
                              <span>{s.emailSent ? (s.emailMode === 'LIVE_SMTP' ? 'Delivered (SMTP)' : 'Sent (Simulated)') : 'Pending / Failed'}</span>
                            </span>
                            {resendInfo && (
                              <p className={`text-[11px] mt-1 ${resendInfo.success ? 'text-[#16845B]' : 'text-[#D14343]'}`}>
                                {resendInfo.message}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleResendCredentials(s._id, s.email)}
                              disabled={isResending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E4E8EF] bg-white hover:bg-[#F8FAFC] text-[#19365C] font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                              title="Generate new temporary password and resend email"
                            >
                              {isResending ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" />
                                  <span>Sending…</span>
                                </>
                              ) : (
                                <>
                                  <Send size={12} className="text-[#3569A8]" />
                                  <span>Resend Credentials</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Failed Records Detailed Report */}
          {importResult.failedRecords && importResult.failedRecords.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-[#D14343]" />
                  <h4 className="text-xs font-bold text-[#202B3C] uppercase tracking-wider">
                    Failed Records Report ({importResult.failedRecords.length})
                  </h4>
                </div>
                <button
                  onClick={exportFailedRecords}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#3569A8] hover:underline"
                >
                  <Download size={13} />
                  <span>Download Error Report (.xlsx)</span>
                </button>
              </div>

              <div className="overflow-x-auto border border-[#E4E8EF] rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FEF2F2] text-[#991B1B] border-b border-[#FECACA]">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Row #</th>
                      <th className="px-4 py-2.5 font-semibold">Student Name</th>
                      <th className="px-4 py-2.5 font-semibold">Email</th>
                      <th className="px-4 py-2.5 font-semibold">Reg. No.</th>
                      <th className="px-4 py-2.5 font-semibold">Failure Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4E8EF] bg-white">
                    {importResult.failedRecords.map((f, i) => (
                      <tr key={i} className="hover:bg-red-50/40">
                        <td className="px-4 py-2 font-mono text-[#667085]">{f.row}</td>
                        <td className="px-4 py-2 font-medium text-[#202B3C]">{f.name}</td>
                        <td className="px-4 py-2 text-[#667085]">{f.email}</td>
                        <td className="px-4 py-2 font-mono text-[#667085]">{f.registerNumber || '—'}</td>
                        <td className="px-4 py-2 text-[#D14343] font-medium">{f.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Pre-Import Preview Table ───────────────────────────────────────── */}
      {parsedRows.length > 0 && !importResult && (
        <div className="bg-white rounded-xl border border-[#E4E8EF] shadow-sm overflow-hidden">
          {/* Header & Controls */}
          <div className="p-5 border-b border-[#E4E8EF] flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="font-bold text-[#202B3C]">{parsedRows.length}</span>
                <span className="text-[#667085]">Total Rows</span>
              </div>
              <span className="text-[#CBD5E1]">|</span>
              <div className="flex items-center gap-1.5 text-xs text-[#16845B]">
                <CheckCircle2 size={14} />
                <span className="font-bold">{validCount}</span>
                <span>Valid</span>
              </div>
              <span className="text-[#CBD5E1]">|</span>
              <div className="flex items-center gap-1.5 text-xs text-[#D14343]">
                <XCircle size={14} />
                <span className="font-bold">{invalidCount}</span>
                <span>Invalid</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white border border-[#E4E8EF] rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('ALL')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filterMode === 'ALL'
                    ? 'bg-[#19365C] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#202B3C]'
                }`}
              >
                All ({parsedRows.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('VALID')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filterMode === 'VALID'
                    ? 'bg-[#16845B] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#202B3C]'
                }`}
              >
                Valid ({validCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('INVALID')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filterMode === 'INVALID'
                    ? 'bg-[#D14343] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#202B3C]'
                }`}
              >
                Invalid ({invalidCount})
              </button>
            </div>
          </div>

          {/* Import Settings Strip */}
          <div className="px-5 py-3.5 border-b border-[#E4E8EF] bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16845B]" />
              <ShieldCheck size={16} className="text-[#3569A8]" />
              <span className="font-semibold text-[#202B3C]">Automatic Secure Credentials Mode:</span>
              <span className="text-[#667085]">
                Each student receives a unique 10-char temporary password emailed upon creation.
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#667085]">
              <span className="px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1E40AF] font-medium border border-[#BFDBFE]">
                Force Password Change: Active
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#202B3C] font-medium border border-[#E4E8EF]">
                Role: STUDENT
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F8FAFC] text-[#667085] uppercase tracking-wider font-semibold border-b border-[#E4E8EF] sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Register Number</th>
                  <th className="px-4 py-3">Email Address</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Academic Year</th>
                  <th className="px-4 py-3">Validation Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E8EF] bg-white">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-[#667085]">
                      No rows match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((r) => (
                    <tr
                      key={r.rowNumber}
                      className={`hover:bg-[#F8FAFC] transition-colors ${
                        !r.isValid ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-[#667085]">{r.rowNumber}</td>
                      <td className="px-4 py-3">
                        {r.isValid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#EBFDF5] text-[#16845B] border border-[#A7F3D0]">
                            <CheckCircle2 size={11} /> Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#FEF2F2] text-[#D14343] border border-[#FECACA]">
                            <XCircle size={11} /> Invalid
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#202B3C]">{r.name || '—'}</td>
                      <td className="px-4 py-3 font-mono text-[#202B3C]">{r.registerNumber || '—'}</td>
                      <td className="px-4 py-3 text-[#667085]">{r.email || '—'}</td>
                      <td className="px-4 py-3 text-[#667085] max-w-[180px] truncate">{r.department || '—'}</td>
                      <td className="px-4 py-3 text-[#667085]">{r.academicYear || '—'}</td>
                      <td className="px-4 py-3">
                        {r.isValid ? (
                          <span className="text-[#16845B]">All fields verified</span>
                        ) : (
                          <span className="text-[#D14343] font-medium">{r.errors.join(', ')}</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Action Footer */}
          <div className="p-5 border-t border-[#E4E8EF] bg-[#F8FAFC] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#667085]">
              Ready to import <strong className="text-[#16845B]">{validCount}</strong> valid student{validCount !== 1 ? 's' : ''}.
              {invalidCount > 0 && (
                <span className="text-[#D14343] ml-1">
                  ({invalidCount} invalid row{invalidCount !== 1 ? 's' : ''} will be skipped)
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleClear}
                disabled={importing}
                className="px-4 py-2 rounded-lg border border-[#E4E8EF] bg-white text-xs font-semibold text-[#202B3C] hover:bg-[#F8FAFC] transition-colors w-full sm:w-auto cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmImport}
                disabled={importing || validCount === 0}
                className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto cursor-pointer"
              >
                {importing ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Importing ({importProgress}%)…</span>
                  </>
                ) : (
                  <>
                    <FileUp size={14} />
                    <span>Confirm &amp; Import {validCount} Students</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Guidelines Card ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-[#E4E8EF] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#202B3C] mb-3 flex items-center gap-2">
          <HelpCircle size={16} className="text-[#3569A8]" />
          Bulk Import Guidelines &amp; Best Practices
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#667085] leading-relaxed">
          <div className="space-y-2">
            <p>
              • <strong>Header Row:</strong> Keep the first row as the column headers (e.g., Name, Register Number, Email, Department, Academic Year).
            </p>
            <p>
              • <strong>Email Uniqueness:</strong> Each student must have a valid, unique institutional or personal email address.
            </p>
            <p>
              • <strong>Register Numbers:</strong> Register numbers must be unique across all student records.
            </p>
          </div>
          <div className="space-y-2">
            <p>
              • <strong>Password Handling:</strong> Passwords left blank will automatically receive the specified default temporary password. All passwords are automatically salted and hashed with bcrypt.
            </p>
            <p>
              • <strong>Role Assignment:</strong> Every imported account is automatically granted the <strong>STUDENT</strong> role and profile hub access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkImportStudents;

