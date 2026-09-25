import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  shortlistApplication,
  rejectApplication,
  getApplicationStats,
} from '../api/applicationApi';
import { getDrives } from '../api/placementDriveApi';

import ApplicationStatusBadge from '../components/applications/ApplicationStatusBadge';
import ApplicationTimeline from '../components/applications/ApplicationTimeline';
import ApplicantActionModal from '../components/applications/ApplicantActionModal';

import {
  ClipboardList,
  Briefcase,
  Building2,
  Calendar,
  DollarSign,
  User,
  Mail,
  GraduationCap,
  FileText,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Star,
  Users,
  AlertCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Clock,
  LayoutGrid,
  List,
} from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Applications' },
  { id: 'APPLIED', label: 'Applied' },
  { id: 'SHORTLISTED', label: 'Shortlisted' },
  { id: 'INTERVIEW', label: 'Interview' },
  { id: 'SELECTED', label: 'Selected' },
  { id: 'REJECTED', label: 'Rejected' },
];

const Applications = () => {
  const { user } = useAuth();
  const isOfficer = user?.role === 'PLACEMENT_OFFICER' || user?.role === 'ADMIN';

  const [applications, setApplications] = useState([]);
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDriveId, setSelectedDriveId] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal State
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const promises = [
        isOfficer ? getAllApplications() : getMyApplications(),
        getDrives().catch(() => ({ data: [] })),
      ];

      const [appsRes, drivesRes] = await Promise.all(promises);
      setApplications(appsRes.data || []);
      setDrives(drivesRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Status metrics
  const stats = useMemo(() => {
    const counts = {
      TOTAL: applications.length,
      APPLIED: 0,
      SHORTLISTED: 0,
      INTERVIEW: 0,
      SELECTED: 0,
      REJECTED: 0,
    };
    applications.forEach((a) => {
      const s = (a.status || 'APPLIED').toUpperCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [applications]);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const q = search.trim().toLowerCase();
      const drive = app.placementDrive || {};
      const company = drive.company || {};
      const student = app.student || {};
      const profile = student.profile || {};

      // Search match
      const matchSearch =
        !q ||
        (drive.jobRole && drive.jobRole.toLowerCase().includes(q)) ||
        (company.companyName && company.companyName.toLowerCase().includes(q)) ||
        (student.name && student.name.toLowerCase().includes(q)) ||
        (student.email && student.email.toLowerCase().includes(q)) ||
        (profile.department && profile.department.toLowerCase().includes(q));

      // Status match
      const matchStatus =
        selectedStatus === 'ALL' ||
        (app.status && app.status.toUpperCase() === selectedStatus.toUpperCase());

      // Drive match
      const appDriveId = drive._id || drive;
      const matchDrive =
        selectedDriveId === 'ALL' || String(appDriveId) === String(selectedDriveId);

      return matchSearch && matchStatus && matchDrive;
    });
  }, [applications, search, selectedStatus, selectedDriveId]);

  // Officer Update Status / Remarks
  const handleUpdateStatus = async (appId, updatePayload) => {
    try {
      setUpdating(true);
      const res = await updateApplicationStatus(appId, updatePayload);
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? res.data : a))
      );
      showToast(`Application updated to ${res.data.status}`);
      setActionModalOpen(false);
      setSelectedApplication(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update application', 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Quick Shortlist
  const handleQuickShortlist = async (appId, e) => {
    e?.stopPropagation();
    try {
      const res = await shortlistApplication(appId, 'Shortlisted by placement officer');
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? res.data : a))
      );
      showToast('Applicant shortlisted successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to shortlist', 'error');
    }
  };

  // Quick Reject
  const handleQuickReject = async (appId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Mark this application as rejected?')) return;
    try {
      const res = await rejectApplication(appId, 'Application not moved forward');
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? res.data : a))
      );
      showToast('Application marked as rejected', 'error');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reject', 'error');
    }
  };

  const handleOpenActionModal = (app) => {
    setSelectedApplication(app);
    setActionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div
          id="application-toast-notification"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-sm font-medium transition-all animate-bounce ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                  <ClipboardList className="w-6 h-6" />
                </span>
                <h1 id="applications-heading" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {isOfficer ? 'Applicant Management' : 'My Placement Applications'}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  isOfficer
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}>
                  {isOfficer ? 'OFFICER PORTAL' : 'STUDENT TRACKER'}
                </span>
              </div>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                {isOfficer
                  ? 'Screen student candidates, evaluate academic qualifications, shortlist students, record interview rounds, and manage placement decisions.'
                  : 'Track your placement applications in real time through each stage — from initial submission to shortlisting, interviews, and final offers.'}
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <button
                id="applications-refresh-btn"
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>

              <Link
                to="/drives"
                id="applications-browse-drives-btn"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
              >
                <Briefcase className="w-4 h-4" />
                <span>Browse Drives</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Total Applications', count: stats.TOTAL, color: 'text-white', border: 'border-slate-800', bg: 'bg-slate-900/60' },
            { label: 'Applied', count: stats.APPLIED, color: 'text-sky-400', border: 'border-sky-500/20', bg: 'bg-sky-950/20' },
            { label: 'Shortlisted', count: stats.SHORTLISTED, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-950/20' },
            { label: 'Interview', count: stats.INTERVIEW, color: 'text-violet-400', border: 'border-violet-500/20', bg: 'bg-violet-950/20' },
            { label: 'Selected', count: stats.SELECTED, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-950/20' },
            { label: 'Rejected', count: stats.REJECTED, color: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-950/20' },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => setSelectedStatus(item.label === 'Total Applications' ? 'ALL' : item.label.toUpperCase())}
              className={`p-4 rounded-2xl border ${item.border} ${item.bg} shadow-lg cursor-pointer hover:scale-[1.02] transition-all`}
            >
              <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider mb-1 truncate">
                {item.label}
              </span>
              <div className={`text-2xl font-bold ${item.color}`}>{item.count}</div>
            </div>
          ))}
        </div>

        {/* Filter and Search Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="applications-search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isOfficer ? "Search applicant name, email, department, role..." : "Search job role, company..."}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs text-white placeholder-slate-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter by Placement Drive (especially for officers) */}
            <div className="flex flex-wrap items-center gap-3">
              {isOfficer && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 whitespace-nowrap">Drive:</span>
                  <select
                    id="applications-drive-filter"
                    value={selectedDriveId}
                    onChange={(e) => setSelectedDriveId(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:border-indigo-500 transition-colors max-w-[220px] truncate"
                  >
                    <option value="ALL">All Placement Drives</option>
                    {drives.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.jobRole} ({d.company?.companyName || 'Corporate Partner'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* View mode toggle for officers */}
              {isOfficer && (
                <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-1.5 rounded-lg text-xs transition-colors ${
                      viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-800/80">
            {STATUS_TABS.map((tab) => {
              const active = selectedStatus === tab.id;
              const count = tab.id === 'ALL' ? stats.TOTAL : stats[tab.id];

              return (
                <button
                  key={tab.id}
                  id={`tab-status-${tab.id.toLowerCase()}`}
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${active ? 'bg-indigo-800/80 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Applications List Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm">Loading applications...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h3 className="font-semibold text-lg mb-1">Failed to Load Applications</h3>
            <p className="text-sm opacity-90 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-medium hover:bg-rose-500 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl">
            <ClipboardList className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Applications Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              {search || selectedStatus !== 'ALL' || selectedDriveId !== 'ALL'
                ? 'No applications match your active search filters.'
                : isOfficer
                ? 'No students have applied to placement drives yet.'
                : 'You have not submitted any placement drive applications yet.'}
            </p>
            {search || selectedStatus !== 'ALL' || selectedDriveId !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedStatus('ALL');
                  setSelectedDriveId('ALL');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
              >
                Clear Filters
              </button>
            ) : !isOfficer ? (
              <Link
                to="/drives"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg transition-all"
              >
                <Briefcase className="w-4 h-4" />
                <span>Explore Eligible Drives &amp; Apply</span>
              </Link>
            ) : null}
          </div>
        ) : isOfficer && viewMode === 'table' ? (
          /* Table View for Officers */
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/60 shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6 font-semibold">Candidate Student</th>
                  <th className="py-4 px-6 font-semibold">Drive &amp; Role</th>
                  <th className="py-4 px-6 font-semibold">Academic Stats</th>
                  <th className="py-4 px-6 font-semibold">Applied Date</th>
                  <th className="py-4 px-6 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredApplications.map((app) => {
                  const student = app.student || {};
                  const profile = student.profile || {};
                  const drive = app.placementDrive || {};
                  const company = drive.company || {};

                  return (
                    <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm">{student.name}</div>
                        <div className="text-slate-400 text-[11px] font-mono">{student.email}</div>
                        {profile.resume?.url && (
                          <a
                            href={profile.resume.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 mt-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span>Resume</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-white">{drive.jobRole}</div>
                        <div className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-indigo-400" />
                          <span>{company.companyName || 'Corporate Partner'}</span>
                        </div>
                        <div className="text-emerald-400 text-[11px] font-medium">{drive.salaryPackage}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className="font-bold text-indigo-400">CGPA: {profile.cgpa ?? 'N/A'}</span>
                          <span className="text-slate-500 mx-1.5">•</span>
                          <span className="text-slate-300">Backlogs: {profile.backlogs ?? 0}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] truncate max-w-[180px]">
                          {profile.department || 'N/A'}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-400">
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6">
                        <ApplicationStatusBadge status={app.status} size="xs" />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status === 'APPLIED' && (
                            <button
                              onClick={(e) => handleQuickShortlist(app._id, e)}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors"
                              title="Shortlist Applicant"
                            >
                              Shortlist
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenActionModal(app)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition-colors"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Grid View for Students and Officers */
          <div id="applications-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApplications.map((app) => {
              const drive = app.placementDrive || {};
              const company = drive.company || {};
              const student = app.student || {};
              const profile = student.profile || {};

              return (
                <div
                  key={app._id}
                  id={`application-card-${app._id}`}
                  className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-3xl p-6 transition-all duration-300 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold mb-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[170px]" title={company.companyName}>
                            {company.companyName || 'Corporate Partner'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white line-clamp-1" title={drive.jobRole}>
                          {drive.jobRole}
                        </h3>
                      </div>
                      <ApplicationStatusBadge status={app.status} size="sm" />
                    </div>

                    {/* Officer view: Applicant student header info */}
                    {isOfficer && (
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 mb-4 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{student.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {student.email}
                          </div>
                        </div>
                        <div className="text-right text-[11px]">
                          <span className="font-bold text-emerald-400 block">
                            CGPA: {profile.cgpa ?? 'N/A'}
                          </span>
                          <span className="text-slate-500">
                            {profile.batch || 'Batch N/A'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Salary & Drive Date */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <DollarSign className="w-3.5 h-3.5" />
                        {drive.salaryPackage || 'Package Details'}
                      </span>
                      {drive.driveDate && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
                          <Calendar className="w-3 h-3 text-indigo-400" />
                          <span>
                            {new Date(drive.driveDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Timeline Tracker */}
                    <div className="mb-4">
                      <ApplicationTimeline
                        status={app.status}
                        appliedAt={app.appliedAt}
                        remarks={app.remarks}
                        updatedAt={app.updatedAt}
                      />
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    {isOfficer ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          {app.status === 'APPLIED' && (
                            <button
                              onClick={(e) => handleQuickShortlist(app._id, e)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors"
                            >
                              Shortlist
                            </button>
                          )}
                          {app.status !== 'REJECTED' && app.status !== 'SELECTED' && (
                            <button
                              onClick={(e) => handleQuickReject(app._id, e)}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
                            >
                              Reject
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleOpenActionModal(app)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all hover:scale-[1.02]"
                        >
                          <span>Manage</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-slate-500">
                          Status: <strong className="text-slate-300 font-semibold">{app.status}</strong>
                        </span>
                        <Link
                          to="/drives"
                          className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          <span>View Drive</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Officer Applicant Action Modal */}
      {isOfficer && (
        <ApplicantActionModal
          isOpen={actionModalOpen}
          onClose={() => {
            setActionModalOpen(false);
            setSelectedApplication(null);
          }}
          application={selectedApplication}
          onUpdateStatus={handleUpdateStatus}
          updating={updating}
        />
      )}
    </div>
  );
};

export default Applications;
