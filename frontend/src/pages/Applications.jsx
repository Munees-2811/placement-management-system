import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyApplications,
  getAllApplications,
  updateApplicationStatus,
  shortlistApplication,
  rejectApplication,
} from '../api/applicationApi';
import { getDrives } from '../api/placementDriveApi';

import ApplicationStatusBadge from '../components/applications/ApplicationStatusBadge';
import ApplicationTimeline from '../components/applications/ApplicationTimeline';
import ApplicantActionModal from '../components/applications/ApplicantActionModal';
import PageHeader from '../components/common/PageHeader';

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
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          id="application-toast-notification"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-[#D14343]'
              : 'bg-emerald-50 border-emerald-200 text-[#16845B]'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-[#D14343] shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#16845B] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title={isOfficer ? 'Applicant Management' : 'My Applications'}
        subtitle={
          isOfficer
            ? 'Screen candidate submissions, evaluate qualifications, and manage interview pipeline.'
            : 'Track your placement applications in real time through each stage of recruitment.'
        }
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Applications' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              id="applications-refresh-btn"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              to="/drives"
              id="applications-browse-drives-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>Browse Drives</span>
            </Link>
          </div>
        }
      />

      {/* Stats Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total', count: stats.TOTAL, color: 'text-[#202B3C]', border: 'border-[#E4E8EF]', bg: 'bg-white' },
          { label: 'Applied', count: stats.APPLIED, color: 'text-[#475569]', border: 'border-[#E4E8EF]', bg: 'bg-white' },
          { label: 'Shortlisted', count: stats.SHORTLISTED, color: 'text-[#C58A25]', border: 'border-amber-200', bg: 'bg-amber-50/50' },
          { label: 'Interview', count: stats.INTERVIEW, color: 'text-[#3569A8]', border: 'border-blue-200', bg: 'bg-blue-50/50' },
          { label: 'Selected', count: stats.SELECTED, color: 'text-[#16845B]', border: 'border-emerald-200', bg: 'bg-emerald-50/50' },
          { label: 'Rejected', count: stats.REJECTED, color: 'text-[#D14343]', border: 'border-red-200', bg: 'bg-red-50/50' },
        ].map((item) => (
          <div
            key={item.label}
            onClick={() => setSelectedStatus(item.label === 'Total' ? 'ALL' : item.label.toUpperCase())}
            className={`p-3.5 rounded-xl border ${item.border} ${item.bg} shadow-sm cursor-pointer hover:border-[#CBD5E1] transition-all`}
          >
            <span className="text-[10px] uppercase font-semibold text-[#667085] block tracking-wider mb-1 truncate">
              {item.label}
            </span>
            <div className={`text-2xl font-bold ${item.color}`}>{item.count}</div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#E4E8EF] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input
              id="applications-search-input"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isOfficer ? "Search applicant name, email, department, role..." : "Search job role, company..."}
              className="w-full pl-10 pr-8 py-2 rounded-xl bg-white border border-[#E4E8EF] focus:border-[#3569A8] focus:ring-1 focus:ring-blue-100 text-xs text-[#202B3C] placeholder-[#94A3B8] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#202B3C] p-0.5"
                title="Clear search"
              >
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter by Placement Drive (especially for officers) */}
          <div className="flex flex-wrap items-center gap-3">
            {isOfficer && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#667085] whitespace-nowrap">Drive:</span>
                <select
                  id="applications-drive-filter"
                  value={selectedDriveId}
                  onChange={(e) => setSelectedDriveId(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-[#E4E8EF] text-xs text-[#202B3C] focus:border-[#3569A8] transition-colors max-w-[220px] truncate"
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
              <div className="flex items-center p-1 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF]">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-[#19365C] shadow-sm font-semibold' : 'text-[#667085] hover:text-[#202B3C]'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs transition-colors ${
                    viewMode === 'table' ? 'bg-white text-[#19365C] shadow-sm font-semibold' : 'text-[#667085] hover:text-[#202B3C]'
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-[#E4E8EF]">
          {STATUS_TABS.map((tab) => {
            const active = selectedStatus === tab.id;
            const count = tab.id === 'ALL' ? stats.TOTAL : stats[tab.id];

            return (
              <button
                key={tab.id}
                id={`tab-status-${tab.id.toLowerCase()}`}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-[#19365C] text-white shadow-sm'
                    : 'bg-[#F1F5F9] text-[#667085] hover:text-[#202B3C] hover:bg-[#E2E8F0]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-white text-[#667085] border border-[#E4E8EF]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Applications List Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#667085] bg-white rounded-2xl border border-[#E4E8EF]">
          <Loader2 className="w-8 h-8 text-[#3569A8] animate-spin mb-3" />
          <p className="text-sm font-medium">Loading applications...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
          <AlertCircle className="w-8 h-8 text-[#D14343] mx-auto mb-2" />
          <h3 className="font-semibold text-base text-[#202B3C] mb-1">Failed to Load Applications</h3>
          <p className="text-sm text-[#667085] mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#D14343] text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border border-[#E4E8EF] rounded-2xl shadow-sm">
          <ClipboardList className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#202B3C] mb-1">No Applications Found</h3>
          <p className="text-sm text-[#667085] max-w-md mx-auto mb-6">
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
              className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#202B3C] rounded-lg text-xs font-medium transition-colors"
            >
              Clear Filters
            </button>
          ) : !isOfficer ? (
            <Link
              to="/drives"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-medium shadow-sm transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore Eligible Drives &amp; Apply</span>
            </Link>
          ) : null}
        </div>
      ) : isOfficer && viewMode === 'table' ? (
        /* Table View for Officers */
        <div className="overflow-x-auto rounded-2xl border border-[#E4E8EF] bg-white shadow-sm">
          <table className="w-full text-left text-xs text-[#202B3C]">
            <thead className="bg-[#F8FAFC] text-[11px] uppercase tracking-wider text-[#667085] border-b border-[#E4E8EF]">
              <tr>
                <th className="py-3.5 px-6 font-semibold">Candidate Student</th>
                <th className="py-3.5 px-6 font-semibold">Drive &amp; Role</th>
                <th className="py-3.5 px-6 font-semibold">Academic Stats</th>
                <th className="py-3.5 px-6 font-semibold">Applied Date</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E8EF]">
              {filteredApplications.map((app) => {
                const student = app.student || {};
                const profile = student.profile || {};
                const drive = app.placementDrive || {};
                const company = drive.company || {};

                return (
                  <tr key={app._id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-bold text-[#202B3C] text-sm">{student.name}</div>
                      <div className="text-[#667085] text-[11px] font-mono">{student.email}</div>
                      {profile.resume?.url && (
                        <a
                          href={profile.resume.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#3569A8] hover:underline mt-0.5"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Resume</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      )}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-[#202B3C]">{drive.jobRole}</div>
                      <div className="text-[#667085] text-[11px] flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-[#3569A8]" />
                        <span>{company.companyName || 'Corporate Partner'}</span>
                      </div>
                      <div className="text-[#16845B] text-[11px] font-medium">{drive.salaryPackage}</div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div>
                        <span className="font-bold text-[#19365C]">CGPA: {profile.cgpa ?? 'N/A'}</span>
                        <span className="text-[#94A3B8] mx-1.5">•</span>
                        <span className="text-[#667085]">Backlogs: {profile.backlogs ?? 0}</span>
                      </div>
                      <div className="text-[#667085] text-[11px] truncate max-w-[180px]">
                        {profile.department || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3.5 px-6 text-[#667085]">
                      {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-6">
                      <ApplicationStatusBadge status={app.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {app.status === 'APPLIED' && (
                          <button
                            onClick={(e) => handleQuickShortlist(app._id, e)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#C58A25] border border-amber-200 text-[11px] font-semibold transition-colors"
                            title="Shortlist Applicant"
                          >
                            Shortlist
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenActionModal(app)}
                          className="px-3 py-1 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-[11px] font-semibold transition-colors"
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
                className="bg-white hover:border-[#CBD5E1] border border-[#E4E8EF] rounded-2xl p-5 sm:p-6 transition-all duration-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-[#3569A8] font-semibold mb-0.5">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[170px]" title={company.companyName}>
                          {company.companyName || 'Corporate Partner'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#202B3C] line-clamp-1" title={drive.jobRole}>
                        {drive.jobRole}
                      </h3>
                    </div>
                    <ApplicationStatusBadge status={app.status} size="sm" />
                  </div>

                  {/* Officer view: Applicant student header info */}
                  {isOfficer && (
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E4E8EF] mb-3 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-[#202B3C] flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#3569A8]" />
                          <span>{student.name}</span>
                        </div>
                        <div className="text-[11px] text-[#667085] truncate max-w-[180px]">
                          {student.email}
                        </div>
                      </div>
                      <div className="text-right text-[11px]">
                        <span className="font-bold text-[#16845B] block">
                          CGPA: {profile.cgpa ?? 'N/A'}
                        </span>
                        <span className="text-[#667085]">
                          {profile.batch || 'Batch N/A'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Salary & Drive Date */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-[#16845B] border border-emerald-200">
                      <DollarSign className="w-3.5 h-3.5" />
                      {drive.salaryPackage || 'Package Details'}
                    </span>
                    {drive.driveDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#667085] px-2.5 py-0.5 rounded-full bg-[#F8FAFC] border border-[#E4E8EF]">
                        <Calendar className="w-3 h-3 text-[#3569A8]" />
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
                <div className="pt-3 border-t border-[#E4E8EF] flex items-center justify-between gap-2">
                  {isOfficer ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        {app.status === 'APPLIED' && (
                          <button
                            onClick={(e) => handleQuickShortlist(app._id, e)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-[#C58A25] border border-amber-200 text-xs font-semibold transition-colors"
                          >
                            Shortlist
                          </button>
                        )}
                        {app.status !== 'REJECTED' && app.status !== 'SELECTED' && (
                          <button
                            onClick={(e) => handleQuickReject(app._id, e)}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-[#D14343] border border-red-200 text-xs font-semibold transition-colors"
                          >
                            Reject
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenActionModal(app)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <span>Manage</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] text-[#667085]">
                        Status: <strong className="text-[#202B3C] font-semibold">{app.status}</strong>
                      </span>
                      <Link
                        to="/drives"
                        className="inline-flex items-center gap-1 text-xs text-[#3569A8] hover:underline font-semibold"
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
