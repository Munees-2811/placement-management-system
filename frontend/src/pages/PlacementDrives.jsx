import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getDrives,
  createDrive,
  updateDrive,
  deleteDrive,
  getMyEligibility,
} from '../api/placementDriveApi';
import { getCompanies } from '../api/companyApi';

import DriveCard from '../components/drives/DriveCard';
import DriveTableView from '../components/drives/DriveTableView';
import DriveModal from '../components/drives/DriveModal';
import DriveDetailModal from '../components/drives/DriveDetailModal';
import DeleteDriveModal from '../components/drives/DeleteDriveModal';
import DriveFilterBar from '../components/drives/DriveFilterBar';

import {
  Briefcase,
  Plus,
  RefreshCw,
  Building2,
  Calendar,
  DollarSign,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Award,
} from 'lucide-react';

const PlacementDrives = () => {
  const { user } = useAuth();
  const [drives, setDrives] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Eligibility map: { [driveId]: EligibilityResult } — only populated for STUDENT role
  const [eligibilityMap, setEligibilityMap] = useState({});

  // Filters & View State
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState(null);
  const [saving, setSaving] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [inspectingDrive, setInspectingDrive] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingDrive, setDeletingDrive] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const canManage = user?.role === 'PLACEMENT_OFFICER' || user?.role === 'ADMIN';

  // Load drives and companies
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const promises = [
        getDrives(),
        getCompanies().catch(() => ({ data: [] })),
      ];
      // Fetch eligibility map only for students
      if (user?.role === 'STUDENT') {
        promises.push(getMyEligibility().catch(() => ({ data: {} })));
      }
      const results = await Promise.all(promises);
      setDrives(results[0].data || []);
      setCompanies(results[1].data || []);
      if (user?.role === 'STUDENT' && results[2]) {
        setEligibilityMap(results[2].data || {});
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load placement drives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute all unique departments for filter dropdown
  const departments = useMemo(() => {
    const set = new Set();
    drives.forEach((d) => {
      if (Array.isArray(d.eligibleDepartments)) {
        d.eligibleDepartments.forEach((dept) => set.add(dept));
      }
    });
    return Array.from(set).sort();
  }, [drives]);

  // Compute active drives count
  const activeDrivesCount = useMemo(() => {
    return drives.filter(
      (d) => d.status === 'UPCOMING' || d.status === 'ONGOING'
    ).length;
  }, [drives]);

  // Client-side filtering
  const filteredDrives = useMemo(() => {
    return drives.filter((d) => {
      const q = search.toLowerCase().trim();
      const companyName = d.company?.companyName || '';
      const matchSearch =
        !q ||
        (d.jobRole && d.jobRole.toLowerCase().includes(q)) ||
        companyName.toLowerCase().includes(q) ||
        (d.salaryPackage && d.salaryPackage.toLowerCase().includes(q)) ||
        (d.jobDescription && d.jobDescription.toLowerCase().includes(q));

      const matchStatus =
        selectedStatus === 'All' ||
        (d.status && d.status.toUpperCase() === selectedStatus.toUpperCase());

      const matchDept =
        selectedDepartment === 'All' ||
        (Array.isArray(d.eligibleDepartments) &&
          d.eligibleDepartments.some((dept) =>
            dept.toLowerCase().includes(selectedDepartment.toLowerCase())
          ));

      return matchSearch && matchStatus && matchDept;
    });
  }, [drives, search, selectedStatus, selectedDepartment]);

  // Modal Handlers
  const handleOpenCreate = () => {
    setEditingDrive(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (drive) => {
    setEditingDrive(drive);
    setModalOpen(true);
  };

  const handleOpenView = (drive) => {
    setInspectingDrive(drive);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (drive) => {
    setDeletingDrive(drive);
    setDeleteModalOpen(true);
  };

  // Submit Create / Edit Drive
  const handleSaveDrive = async (formData) => {
    try {
      setSaving(true);
      if (editingDrive) {
        const res = await updateDrive(editingDrive._id, formData);
        setDrives((prev) =>
          prev.map((d) => (d._id === editingDrive._id ? res.data : d))
        );
        showToast(`Placement drive for "${formData.jobRole}" updated successfully`);
      } else {
        const res = await createDrive(formData);
        setDrives((prev) => [res.data, ...prev]);
        showToast(`Placement drive for "${formData.jobRole}" announced successfully`);
      }
      setModalOpen(false);
      setEditingDrive(null);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Submit Delete Drive
  const handleConfirmDelete = async (driveId) => {
    try {
      setDeleting(true);
      await deleteDrive(driveId);
      setDrives((prev) => prev.filter((d) => d._id !== driveId));
      showToast('Placement drive deleted successfully');
      setDeleteModalOpen(false);
      setDeletingDrive(null);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to delete drive', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div
          id="drive-toast-notification"
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
                  <Briefcase className="w-6 h-6" />
                </span>
                <h1 id="drives-page-heading" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Campus Placement Drives
                </h1>
                <span
                  id="drives-role-badge"
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    canManage
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  {canManage ? `${user?.role?.replace('_', ' ')} PORTAL` : 'STUDENT OPPORTUNITIES'}
                </span>
              </div>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                {canManage
                  ? 'Create, schedule, and manage campus recruitment drives, specify academic thresholds (CGPA, backlogs, batches), and track participating organizations.'
                  : 'Explore available campus placement opportunities, view job role scopes, review corporate eligibility rules, and track upcoming recruitment drive dates.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <button
                id="drives-refresh-btn"
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                title="Refresh drives"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {canManage && (
                <button
                  id="drives-create-btn"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Announce Drive</span>
                </button>
              )}
            </div>
          </div>

          {/* Student Info Alert */}
          {!canManage && (
            <div
              id="student-drive-notice"
              className="mt-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center gap-3 text-xs text-indigo-200"
            >
              <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>
                <strong>Student Available Drives:</strong> Browse active placement drives below. Please inspect each drive's details to review required CGPA, backlog thresholds, and eligible departments specified by each hiring partner.
              </span>
            </div>
          )}
        </div>

        {/* Stats Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Drives</span>
              <Briefcase className="w-4 h-4 text-indigo-400" />
            </div>
            <div id="stat-total-drives" className="text-2xl sm:text-3xl font-bold text-white">
              {drives.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Recruitment drives scheduled</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Active Drives</span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div id="stat-active-drives" className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {activeDrivesCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Upcoming & ongoing drives</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Participating Partners</span>
              <Building2 className="w-4 h-4 text-violet-400" />
            </div>
            <div id="stat-participating-companies" className="text-2xl sm:text-3xl font-bold text-violet-400">
              {companies.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Registered enterprise recruiters</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Your Role</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div id="stat-drive-user-role" className="text-sm sm:text-base font-bold text-amber-400 truncate">
              {user?.role?.replace('_', ' ') || 'GUEST'}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {canManage ? 'Officer Drive Management' : 'Candidate Drive Browser'}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <DriveFilterBar
          search={search}
          setSearch={setSearch}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          departments={departments}
          viewMode={viewMode}
          setViewMode={setViewMode}
          totalCount={drives.length}
          filteredCount={filteredDrives.length}
          onReset={() => {
            setSearch('');
            setSelectedStatus('All');
            setSelectedDepartment('All');
          }}
        />

        {/* Drives List / Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm">Loading placement drives...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h3 className="font-semibold text-lg mb-1">Failed to Load Drives</h3>
            <p className="text-sm opacity-90 mb-4">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-medium hover:bg-rose-500 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredDrives.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Placement Drives Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              {search || selectedStatus !== 'All' || selectedDepartment !== 'All'
                ? 'No recruitment drives matched your search filters or selected department.'
                : 'There are currently no placement drives scheduled on the portal.'}
            </p>
            {search || selectedStatus !== 'All' || selectedDepartment !== 'All' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedStatus('All');
                  setSelectedDepartment('All');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-colors"
              >
                Clear Filters
              </button>
            ) : canManage ? (
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule First Placement Drive</span>
              </button>
            ) : null}
          </div>
        ) : viewMode === 'grid' ? (
          <div id="drives-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.map((drive) => (
              <DriveCard
                key={drive._id}
                drive={drive}
                canManage={canManage}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onView={handleOpenView}
                eligibility={eligibilityMap[drive._id] || null}
                isStudent={user?.role === 'STUDENT'}
              />
            ))}
          </div>
        ) : (
          <DriveTableView
            drives={filteredDrives}
            canManage={canManage}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onView={handleOpenView}
            eligibilityMap={eligibilityMap}
            isStudent={user?.role === 'STUDENT'}
          />
        )}
      </div>

      {/* Modals */}
      <DriveModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingDrive(null);
        }}
        onSave={handleSaveDrive}
        drive={editingDrive}
        companies={companies}
        saving={saving}
      />

      <DriveDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setInspectingDrive(null);
        }}
        drive={inspectingDrive}
        canManage={canManage}
        onEdit={handleOpenEdit}
        eligibility={inspectingDrive ? eligibilityMap[inspectingDrive._id] || null : null}
        isStudent={user?.role === 'STUDENT'}
      />

      <DeleteDriveModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingDrive(null);
        }}
        onConfirm={handleConfirmDelete}
        drive={deletingDrive}
        deleting={deleting}
      />
    </div>
  );
};

export default PlacementDrives;
