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

  // Client-side search and filtering for ultra-snappy UX
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
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div
          id="company-toast-notification"
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
                <span className="p-2 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                  <Building2 className="w-6 h-6" />
                </span>
                <h1 id="companies-page-heading" className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Company Directory & Partners
                </h1>
                <span
                  id="companies-role-badge"
                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                    canManage
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                  }`}
                >
                  {canManage ? `${user?.role?.replace('_', ' ')} MODE` : 'STUDENT DIRECTORY'}
                </span>
              </div>
              <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
                {canManage
                  ? 'Manage recruitment partners, register new participating organizations, track contact persons, and maintain corporate relationships.'
                  : 'Explore campus recruitment partners, view job eligibility domains, industry focus, and recruiter contact personnel.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 self-start md:self-center shrink-0">
              <button
                id="companies-refresh-btn"
                onClick={fetchCompanyList}
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                title="Refresh companies"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {canManage && (
                <button
                  id="companies-add-btn"
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Company</span>
                </button>
              )}
            </div>
          </div>

          {/* Student Read-Only Informational Alert */}
          {!canManage && (
            <div
              id="student-view-alert"
              className="mt-6 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center gap-3 text-xs text-indigo-200"
            >
              <GraduationCap className="w-5 h-5 text-indigo-400 shrink-0" />
              <span>
                <strong>Student Access:</strong> You have read-only directory access to discover partner companies, inspect active recruiter points-of-contact, and browse corporate websites. Editing and registering companies is reserved for Placement Officers and Administrators.
              </span>
            </div>
          )}
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Partner Companies</span>
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div id="stat-total-companies" className="text-2xl sm:text-3xl font-bold text-white">
              {companies.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Active campus recruiters</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Industries</span>
              <Briefcase className="w-4 h-4 text-violet-400" />
            </div>
            <div id="stat-total-industries" className="text-2xl sm:text-3xl font-bold text-violet-400">
              {industries.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Diverse domain sectors</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Recruiting Hubs</span>
              <MapPin className="w-4 h-4 text-rose-400" />
            </div>
            <div id="stat-total-locations" className="text-2xl sm:text-3xl font-bold text-rose-400">
              {locationsCount}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Geographic job hubs</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Your Role</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div id="stat-user-role" className="text-sm sm:text-base font-bold text-emerald-400 truncate">
              {user?.role?.replace('_', ' ') || 'GUEST'}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {canManage ? 'Full Management Privileges' : 'Read-Only Directory View'}
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
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

        {/* Content Section: Loading, Error, Empty, or Companies */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm">Loading partner companies directory...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-center">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
            <h3 className="font-semibold text-lg mb-1">Failed to Load Companies</h3>
            <p className="text-sm opacity-90 mb-4">{error}</p>
            <button
              onClick={fetchCompanyList}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-medium hover:bg-rose-500 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-900/40 border border-slate-800/80 rounded-3xl">
            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No Companies Found</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
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
      </div>

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
