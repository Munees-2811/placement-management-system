import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../api/companyApi';

import CompanyCard from '../components/companies/CompanyCard';
import CompanyTableView from '../components/companies/CompanyTableView';
import CompanyModal from '../components/companies/CompanyModal';
import CompanyDetailModal from '../components/companies/CompanyDetailModal';
import DeleteConfirmModal from '../components/companies/DeleteConfirmModal';
import CompanyFilterBar from '../components/companies/CompanyFilterBar';
import PageHeader from '../components/common/PageHeader';

import {
  Building2,
  Plus,
  RefreshCw,
  Briefcase,
  MapPin,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

const Companies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [saving, setSaving] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [inspectingCompany, setInspectingCompany] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Determine permissions
  const canManage = user?.role === 'ADMIN' || user?.role === 'PLACEMENT_OFFICER';

  // Load companies from API
  const fetchCompanyList = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCompanies();
      setCompanies(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyList();
  }, []);

  // Compute unique industries for filter dropdown
  const industries = useMemo(() => {
    const set = new Set();
    companies.forEach((c) => {
      if (c.industry) set.add(c.industry.trim());
    });
    return Array.from(set).sort();
  }, [companies]);

  // Compute unique locations count
  const locationsCount = useMemo(() => {
    const set = new Set();
    companies.forEach((c) => {
      if (c.location) set.add(c.location.trim().toLowerCase());
    });
    return set.size;
  }, [companies]);

  // Client-side search and filtering
  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (c.companyName && c.companyName.toLowerCase().includes(q)) ||
        (c.industry && c.industry.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q));

      const matchIndustry =
        selectedIndustry === 'All' ||
        (c.industry && c.industry.toLowerCase() === selectedIndustry.toLowerCase());

      return matchSearch && matchIndustry;
    });
  }, [companies, search, selectedIndustry]);

  // Modal Handlers
  const handleOpenCreate = () => {
    setEditingCompany(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (company) => {
    setEditingCompany(company);
    setModalOpen(true);
  };

  const handleOpenView = (company) => {
    setInspectingCompany(company);
    setDetailModalOpen(true);
  };

  const handleOpenDelete = (company) => {
    setDeletingCompany(company);
    setDeleteModalOpen(true);
  };

  // Submit Create / Edit
  const handleSaveCompany = async (formData) => {
    try {
      setSaving(true);
      if (editingCompany) {
        const res = await updateCompany(editingCompany._id, formData);
        setCompanies((prev) =>
          prev.map((c) => (c._id === editingCompany._id ? res.data : c))
        );
        showToast(`Company "${formData.companyName}" updated successfully`);
      } else {
        const res = await createCompany(formData);
        setCompanies((prev) => [res.data, ...prev]);
        showToast(`Company "${formData.companyName}" registered successfully`);
      }
      setModalOpen(false);
      setEditingCompany(null);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Operation failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Delete Action
  const handleConfirmDelete = async (companyId) => {
    try {
      setDeleting(true);
      await deleteCompany(companyId);
      setCompanies((prev) => prev.filter((c) => c._id !== companyId));
      showToast('Company deleted successfully');
      setDeleteModalOpen(false);
      setDeletingCompany(null);
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to delete company', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          id="company-toast-notification"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${toast.type === 'error'
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
        title="Company Directory"
        subtitle={
          canManage
            ? 'Manage recruitment partners, register new participating organizations, and maintain corporate relationships.'
            : 'Explore campus recruitment partners, view job eligibility domains, and recruiter contact personnel.'
        }
        breadcrumb={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Companies' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              id="companies-refresh-btn"
              onClick={fetchCompanyList}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
              title="Refresh companies"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {canManage && (
              <button
                id="companies-add-btn"
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white font-medium text-xs sm:text-sm shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Company</span>
              </button>
            )}
          </div>
        }
      />

      {/* Student View Informative Alert */}
      {!canManage && (
        <div
          id="student-view-alert"
          className="p-3.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-center gap-3 text-xs text-[#1E40AF]"
        >
          <GraduationCap className="w-4 h-4 text-[#3569A8] shrink-0" />
          <span>
            <strong>Student Access:</strong> You have read-only directory access to discover partner companies and recruiters. Editing is reserved for Placement Officers and Administrators.
          </span>
        </div>
      )}

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-[#E4E8EF] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Companies</span>
            <Building2 className="w-4 h-4 text-[#3569A8]" />
          </div>
          <div id="stat-total-companies" className="text-2xl font-bold text-[#202B3C]">
            {companies.length}
          </div>
          <span className="text-[11px] text-[#667085] mt-0.5 block">Active recruiters</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E4E8EF] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Industries</span>
            <Briefcase className="w-4 h-4 text-[#3569A8]" />
          </div>
          <div id="stat-total-industries" className="text-2xl font-bold text-[#202B3C]">
            {industries.length}
          </div>
          <span className="text-[11px] text-[#667085] mt-0.5 block">Domain sectors</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E4E8EF] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Locations</span>
            <MapPin className="w-4 h-4 text-[#3569A8]" />
          </div>
          <div id="stat-total-locations" className="text-2xl font-bold text-[#202B3C]">
            {locationsCount}
          </div>
          <span className="text-[11px] text-[#667085] mt-0.5 block">Geographic hubs</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-[#E4E8EF] shadow-sm">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold uppercase tracking-wider mb-1.5">
            <span>Access Mode</span>
            <ShieldCheck className="w-4 h-4 text-[#16845B]" />
          </div>
          <div id="stat-user-role" className="text-sm font-bold text-[#16845B] truncate mt-1">
            {user?.role?.replace('_', ' ') || 'GUEST'}
          </div>
          <span className="text-[11px] text-[#667085] mt-0.5 block">
            {canManage ? 'Full Management Privileges' : 'Directory View'}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <CompanyFilterBar
        search={search}
        setSearch={setSearch}
        selectedIndustry={selectedIndustry}
        setSelectedIndustry={setSelectedIndustry}
        industries={industries}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalCount={companies.length}
        filteredCount={filteredCompanies.length}
        onReset={() => {
          setSearch('');
          setSelectedIndustry('All');
        }}
      />

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#667085] bg-white rounded-2xl border border-[#E4E8EF]">
          <Loader2 className="w-8 h-8 text-[#3569A8] animate-spin mb-3" />
          <p className="text-sm font-medium">Loading partner companies directory...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center">
          <AlertCircle className="w-8 h-8 text-[#D14343] mx-auto mb-2" />
          <h3 className="font-semibold text-base text-[#202B3C] mb-1">Failed to Load Companies</h3>
          <p className="text-sm text-[#667085] mb-4">{error}</p>
          <button
            onClick={fetchCompanyList}
            className="px-4 py-2 bg-[#D14343] text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white border border-[#E4E8EF] rounded-2xl shadow-sm">
          <Building2 className="w-12 h-12 text-[#94A3B8] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#202B3C] mb-1">No Companies Found</h3>
          <p className="text-sm text-[#667085] max-w-md mx-auto mb-6">
            {search || selectedIndustry !== 'All'
              ? 'No partner companies matched your active filter or search keywords.'
              : 'There are currently no companies registered in the placement portal.'}
          </p>
          {search || selectedIndustry !== 'All' ? (
            <button
              onClick={() => {
                setSearch('');
                setSelectedIndustry('All');
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
              <span>Add Your First Company</span>
            </button>
          ) : null}
        </div>
      ) : viewMode === 'grid' ? (
        <div id="companies-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => (
            <CompanyCard
              key={company._id}
              company={company}
              canManage={canManage}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
              onView={handleOpenView}
            />
          ))}
        </div>
      ) : (
        <CompanyTableView
          companies={filteredCompanies}
          canManage={canManage}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
          onView={handleOpenView}
        />
      )}

      {/* Modals */}
      <CompanyModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingCompany(null);
        }}
        onSave={handleSaveCompany}
        company={editingCompany}
        saving={saving}
      />

      <CompanyDetailModal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setInspectingCompany(null);
        }}
        company={inspectingCompany}
        canManage={canManage}
        onEdit={handleOpenEdit}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeletingCompany(null);
        }}
        onConfirm={handleConfirmDelete}
        company={deletingCompany}
        deleting={deleting}
      />
    </div>
  );
};

export default Companies;
