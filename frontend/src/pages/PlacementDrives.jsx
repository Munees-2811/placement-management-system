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
import { getMyApplications, applyToPlacementDrive } from '../api/applicationApi';

import DriveCard from '../components/drives/DriveCard';
import DriveTableView from '../components/drives/DriveTableView';
import DriveModal from '../components/drives/DriveModal';
import DriveDetailModal from '../components/drives/DriveDetailModal';
import DeleteDriveModal from '../components/drives/DeleteDriveModal';
import DriveFilterBar from '../components/drives/DriveFilterBar';
import ApplyConfirmModal from '../components/applications/ApplyConfirmModal';
import PageHeader from '../components/common/PageHeader';

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

  // Applications map: { [driveId]: Application } — only populated for STUDENT role
  const [applicationMap, setApplicationMap] = useState({});
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [driveToApply, setDriveToApply] = useState(null);
  const [applying, setApplying] = useState(false);

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

  // Load drives, companies, student eligibility & applications
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const promises = [
        getDrives(),
        getCompanies().catch(() => ({ data: [] })),
      ];
      // Fetch eligibility and applications only for students
      if (user?.role === 'STUDENT') {
        promises.push(getMyEligibility().catch(() => ({ data: {} })));
        promises.push(getMyApplications().catch(() => ({ data: [] })));
      }
      const results = await Promise.all(promises);
      setDrives(results[0].data || []);
      setCompanies(results[1].data || []);
      if (user?.role === 'STUDENT') {
        if (results[2]) {
          setEligibilityMap(results[2].data || {});
        }
        if (results[3]) {
          const appMap = {};
          (results[3].data || []).forEach((app) => {
            const dId = app.placementDrive?._id || app.placementDrive;
            if (dId) appMap[String(dId)] = app;
          });
          setApplicationMap(appMap);
        }
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

  // Handle student apply action
  const handleOpenApply = (drive) => {
    setDriveToApply(drive);
    setApplyModalOpen(true);
  };

  const handleConfirmApply = async ({ placementDrive, remarks }) => {
    try {
      setApplying(true);
      const res = await applyToPlacementDrive({ placementDrive, remarks });
      setApplicationMap((prev) => ({
        ...prev,
        [String(placementDrive)]: res.data,
      }));
      showToast(`Successfully applied for "${driveToApply?.jobRole || 'placement drive'}"!`);
      setApplyModalOpen(false);
      setDriveToApply(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit application', 'error');
    } finally {
      setApplying(false);
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
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          id="drive-toast-notification"
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
        title="Campus Placement Drives"
        subtitle={
          canManage
            ? 'Create, schedule, and manage campus recruitment drives, specify academic thresholds, and track hiring partners.'
            : 'Explore available campus placement opportunities, view job role scopes, and apply for eligible drives.'
        }
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Placement Drives' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              id="drives-refresh-btn"
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
              title="Refresh drives"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {canManage && (
              <button
                id="drives-create-btn"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Announce Drive</span>
              </button>
            )}
          </div>
        }
      />

      {/* Student Informative Alert */}
      {!canManage && (
        <div
          id="student-drive-notice"
          className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center gap-3 text-xs text-[#1E40AF]"
        >
          <GraduationCap className="w-4 h-4 text-[#3569A8] shrink-0" />
          <span>
            <strong>Student View:</strong> Browse active placement drives below. Check your eligibility criteria (CGPA, backlogs, batch year, and department) before applying.
          </span>
        </div>
      )}

      {/* Stats Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E4E8EF] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Total Drives</span>
            <Briefcase className="w-4 h-4 text-[#3569A8]" />
          </div>
          <div id="stat-total-drives" className="text-2xl font-bold text-[#202B3C]">
            {drives.length}
          </div>
          <span className="text-[11px] text-[#667085] mt-0.5 block">Recruitment schedules</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E4E8EF] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Active Drives</span>
            <Calendar className="w-4 h-4 text-[#16845B]" />
          </div>
          <div id="stat-active-drives" className="text-2xl font-bold text-[#16845B]">
            {activeDrivesCount}
          </div>
          <span className="text-[11px] text-[#667085] mt-0.5 block">Upcoming & ongoing</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E4E8EF] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Partners</span>
            <Building2 className="w-4 h-4 text-[#3569A8]" />
          </div>
          <div id="stat-participating-companies" className="text-2xl font-bold text-[#202B3C]">
            {companies.length}
          </div>
          <span className="text-[11px] text-[#667085] mt-0.5 block">Hiring companies</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E4E8EF] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Access Mode</span>
            <ShieldCheck className="w-4 h-4 text-[#C58A25]" />
          </div>
          <div id="stat-drive-user-role" className="text-sm font-bold text-[#C58A25] truncate mt-1">
            {user?.role?.replace('_', ' ') || 'GUEST'}
          </div>
          <span className="text-[11px] text-[#667085] mt-0.5 block">
            {canManage ? 'Officer Management' : 'Candidate Browser'}
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
        <div className="flex flex-col items-center justify-center py-20 text-[#667085] bg-white rounded-2xl border border-[#E4E8EF]">
          <Loader2 className="w-8 h-8 text-[#3569A8] animate-spin mb-3" />
          <p className="text-sm font-medium">Loading placement drives...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
          <AlertCircle className="w-8 h-8 text-[#D14343] mx-auto mb-2" />
          <h3 className="font-semibold text-base text-[#202B3C] mb-1">Failed to Load Drives</h3>
          <p className="text-sm text-[#667085] mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-[#D14343] text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border border-[#E4E8EF] rounded-2xl shadow-sm">
          <Briefcase className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#202B3C] mb-1">No Placement Drives Found</h3>
          <p className="text-sm text-[#667085] max-w-md mx-auto mb-6">
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
              className="px-4 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#202B3C] rounded-lg text-xs font-medium transition-colors"
            >
              Clear Filters
            </button>
          ) : canManage ? (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-medium shadow-sm transition-all"
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
              application={applicationMap[drive._id] || null}
              onApply={handleOpenApply}
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
          applicationMap={applicationMap}
          onApply={handleOpenApply}
          isStudent={user?.role === 'STUDENT'}
        />
      )}

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
        application={inspectingDrive ? applicationMap[inspectingDrive._id] || null : null}
        onApply={handleOpenApply}
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

      <ApplyConfirmModal
        isOpen={applyModalOpen}
        onClose={() => {
          setApplyModalOpen(false);
          setDriveToApply(null);
        }}
        drive={driveToApply}
        onApply={handleConfirmApply}
        applying={applying}
        eligibility={driveToApply ? eligibilityMap[driveToApply._id] || null : null}
        user={user}
      />
    </div>
  );
};

export default PlacementDrives;
