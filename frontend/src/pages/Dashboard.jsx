import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getStudentProfile,
  updateBasicProfile,
  updateSkills,
  addProject,
  updateProject,
  deleteProject,
  addCertification,
  updateCertification,
  deleteCertification,
  updateResume,
  deleteResume,
} from '../api/studentProfileApi';
import api from '../api/axios';
import { adminListStudents } from '../api/adminApi';

import PageHeader from '../components/common/PageHeader';
import StatusBadge from '../components/common/StatusBadge';
import ProfileCompletionCard from '../components/student/ProfileCompletionCard';
import AcademicStatsCard from '../components/student/AcademicStatsCard';
import SkillsManager from '../components/student/SkillsManager';
import ProjectsSection from '../components/student/ProjectsSection';
import CertificationsSection from '../components/student/CertificationsSection';
import ResumeSection from '../components/student/ResumeSection';
import EditProfileModal from '../components/student/EditProfileModal';
import ProjectModal from '../components/student/ProjectModal';
import CertificationModal from '../components/student/CertificationModal';
import ResumeModal from '../components/student/ResumeModal';
import { getMyApplications } from '../api/applicationApi';

import {
  LogOut,
  RefreshCw,
  User,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  Key,
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Loader2,
  Building2,
  Briefcase,
  FileCheck,
  ArrowRight,
  BookOpen,
  Award,
  FileText,
  LayoutDashboard,
  Calendar,
  Phone,
  Mail,
  GraduationCap,
  ExternalLink,
  Users,
  UserPlus,
  Hash,
  Search,
} from 'lucide-react';

const getUserInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// ============================================================
// Student Dashboard — Professional Enterprise Theme
// ============================================================
const StudentDashboard = () => {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Modal states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [resumeModalOpen, setResumeModalOpen] = useState(false);

  // Dev tools
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [roleTestResult, setRoleTestResult] = useState(null);
  const [testingRoleEndpoint, setTestingRoleEndpoint] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setProfileError(null);
      const [profileRes, appsRes] = await Promise.all([
        getStudentProfile(),
        getMyApplications().catch(() => ({ data: [] })),
      ]);
      setProfile(profileRes.data);
      setApplications(appsRes.data || []);
    } catch (err) {
      setProfileError(err.response?.data?.message || err.message || 'Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveBasicProfile = async (data) => {
    try {
      setSaving(true);
      const res = await updateBasicProfile(data);
      setProfile(res.data);
      setEditProfileOpen(false);
      showToast('Profile updated successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSkills = async (skills) => {
    try {
      setSaving(true);
      const res = await updateSkills(skills);
      setProfile(res.data);
      showToast('Skills updated successfully.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update skills', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProject = async (data, projectId) => {
    try {
      setSaving(true);
      let res;
      if (projectId) {
        res = await updateProject(projectId, data);
        showToast('Project updated successfully.');
      } else {
        res = await addProject(data);
        showToast('Project added successfully.');
      }
      setProfile(res.data);
      setProjectModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save project', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Remove this project?')) return;
    try {
      setSaving(true);
      const res = await deleteProject(projectId);
      setProfile(res.data);
      showToast('Project removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove project', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCert = async (data, certId) => {
    try {
      setSaving(true);
      let res;
      if (certId) {
        res = await updateCertification(certId, data);
        showToast('Certification updated.');
      } else {
        res = await addCertification(data);
        showToast('Certification added.');
      }
      setProfile(res.data);
      setCertModalOpen(false);
      setEditingCert(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save certification', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCert = async (certId) => {
    if (!window.confirm('Remove this certification?')) return;
    try {
      setSaving(true);
      const res = await deleteCertification(certId);
      setProfile(res.data);
      showToast('Certification removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove certification', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveResume = async (_resumeData, responseData) => {
    try {
      if (responseData?.data) {
        setProfile(responseData.data);
      }
      setResumeModalOpen(false);
      showToast('Resume uploaded successfully!');
    } catch (err) {
      showToast(err?.message || 'Failed to update resume', 'error');
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Remove your resume document?')) return;
    try {
      setSaving(true);
      const res = await deleteResume();
      setProfile(res.data);
      showToast('Resume removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  const testApiConnection = async () => {
    try {
      setCheckingHealth(true);
      const res = await api.get('/health');
      setHealthStatus({ success: true, data: res.data });
    } catch (err) {
      setHealthStatus({ success: false, message: err.response?.data?.message || err.message });
    } finally {
      setCheckingHealth(false);
    }
  };

  const testRoleEndpoint = async (endpoint, endpointName, requiredRoles) => {
    try {
      setTestingRoleEndpoint(endpointName);
      setRoleTestResult(null);
      const res = await api.get(`/auth/${endpoint}`);
      setRoleTestResult({
        endpoint: endpointName,
        requiredRoles,
        success: true,
        status: res.status,
        message: res.data.message || 'Access authorized!',
      });
    } catch (err) {
      setRoleTestResult({
        endpoint: endpointName,
        requiredRoles,
        success: false,
        status: err.response?.status || 500,
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setTestingRoleEndpoint('');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'academic', label: 'Academic Credentials', icon: BookOpen },
    { id: 'skills', label: 'Skills', icon: Award, count: profile?.skills?.length || 0 },
    { id: 'projects', label: 'Projects', icon: Briefcase, count: profile?.projects?.length || 0 },
    { id: 'certifications', label: 'Certifications', icon: CheckCircle2, count: profile?.certifications?.length || 0 },
    { id: 'resume', label: 'Resume', icon: FileText, flag: profile?.resume?.url ? 'Uploaded' : 'Missing' },
  ];

  return (
    <div className="sd-layout">
      {/* Toast Alert */}
      {toast && (
        <div className={`sd-toast ${toast.type === 'error' ? 'sd-toast--error' : 'sd-toast--success'}`}>
          {toast.type === 'error' ? (
            <AlertCircle size={16} strokeWidth={1.8} className="shrink-0" />
          ) : (
            <CheckCircle2 size={16} strokeWidth={1.8} className="shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <PageHeader
        title="Student Profile & Placement Hub"
        subtitle="Manage your academic portfolio, track placement eligibility, and view application status"
        breadcrumb={[
          { label: 'Portal', href: '/dashboard' },
          { label: 'My Profile' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setEditProfileOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <User size={14} strokeWidth={1.8} />
              <span>Edit Profile</span>
            </button>
            <Link
              to="/drives"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] text-xs font-semibold shadow-xs transition-colors"
            >
              <Briefcase size={14} strokeWidth={1.8} className="text-[#3569A8]" />
              <span>Browse Drives</span>
            </Link>
            <button
              onClick={fetchProfile}
              disabled={loadingProfile}
              className="p-2 rounded-lg bg-white hover:bg-[#F8FAFC] text-[#202B3C] border border-[#E4E8EF] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
              title="Refresh profile data"
            >
              <RefreshCw size={14} strokeWidth={1.8} className={loadingProfile ? 'animate-spin' : ''} />
            </button>
          </div>
        }
      />

      {/* Loading State */}
      {loadingProfile && (
        <div className="flex flex-col items-center justify-center py-20 text-[#667085] gap-3">
          <Loader2 size={24} strokeWidth={1.8} className="text-[#3569A8] animate-spin" />
          <p className="text-xs font-medium">Loading placement profile...</p>
        </div>
      )}

      {/* Error State */}
      {profileError && !loadingProfile && (
        <div className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-between text-xs text-[#D14343]">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} strokeWidth={1.8} />
            <span><strong>Failed to load profile:</strong> {profileError}</span>
          </div>
          <button
            onClick={fetchProfile}
            className="font-semibold underline hover:text-[#991B1B] cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {!loadingProfile && profile && (
        <>
          {/* Top Profile Summary Card */}
          <div className="bg-white border border-[#E4E8EF] rounded-xl p-5 sm:p-6 mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-[#19365C] text-white text-lg sm:text-xl font-bold flex items-center justify-center shrink-0 border border-[#CBD5E1]">
                  {getUserInitials(user?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <h2 className="text-lg sm:text-xl font-bold text-[#202B3C] truncate">
                      {user?.name || 'Student Candidate'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE]">
                      {user?.role?.replace('_', ' ')}
                    </span>
                    {profile?.cgpa !== null && profile?.cgpa !== undefined && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EBFDF5] text-[#16845B] border border-[#A7F3D0]">
                        CGPA: {Number(profile.cgpa).toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-[#667085]">
                    <span className="flex items-center gap-1.5">
                      <Mail size={13} strokeWidth={1.8} className="text-[#3569A8] shrink-0" />
                      <span className="truncate">{user?.email}</span>
                    </span>
                    {profile?.department && (
                      <span className="flex items-center gap-1.5">
                        <GraduationCap size={13} strokeWidth={1.8} className="text-[#3569A8] shrink-0" />
                        <span className="truncate">{profile.department}</span>
                      </span>
                    )}
                    {profile?.batch && (
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} strokeWidth={1.8} className="text-[#3569A8] shrink-0" />
                        <span>Batch {profile.batch}</span>
                      </span>
                    )}
                    {profile?.phone && (
                      <span className="flex items-center gap-1.5 font-mono">
                        <Phone size={13} strokeWidth={1.8} className="text-[#16845B] shrink-0" />
                        <span>{profile.phone}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Metrics Badge Strip */}
              <div className="flex items-center gap-2.5 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-[#E4E8EF]">
                <div className="min-w-[88px] text-center px-3 py-2 bg-[#F8FAFC] rounded-lg border border-[#E4E8EF]">
                  <p className="text-lg font-bold text-[#202B3C] leading-none">{applications.length}</p>
                  <p className="text-[10px] text-[#667085] font-semibold uppercase tracking-wider mt-1">Applications</p>
                </div>
                <div className="min-w-[88px] text-center px-3 py-2 bg-[#F8FAFC] rounded-lg border border-[#E4E8EF]">
                  <p className="text-lg font-bold text-[#202B3C] leading-none">{profile?.skills?.length || 0}</p>
                  <p className="text-[10px] text-[#667085] font-semibold uppercase tracking-wider mt-1">Skills</p>
                </div>
                <div className="min-w-[88px] text-center px-3 py-2 bg-[#F8FAFC] rounded-lg border border-[#E4E8EF]">
                  <p className="text-lg font-bold text-[#202B3C] leading-none">{profile?.projects?.length || 0}</p>
                  <p className="text-[10px] text-[#667085] font-semibold uppercase tracking-wider mt-1">Projects</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation Strip */}
          <div className="flex items-center gap-1.5 border-b border-[#E4E8EF] mb-6 overflow-x-auto pb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'border-[#19365C] text-[#19365C] bg-white shadow-xs font-bold'
                      : 'border-transparent text-[#667085] hover:text-[#202B3C] hover:bg-[#F5F7FA]'
                  }`}
                >
                  <Icon size={15} strokeWidth={1.8} className={isActive ? 'text-[#19365C]' : 'text-[#667085]'} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-[#EFF6FF] text-[#19365C]' : 'bg-[#F1F5F9] text-[#667085]'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.flag && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                      tab.flag === 'Uploaded' ? 'bg-[#EBFDF5] text-[#16845B]' : 'bg-[#FEF2F2] text-[#D14343]'
                    }`}>
                      {tab.flag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content Display */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Two Column Grid: Profile Completion & Academic Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProfileCompletionCard
                  profile={profile}
                  onActionClick={(action) => {
                    if (action === 'academic') setEditProfileOpen(true);
                    else setActiveTab(action);
                  }}
                />
                <AcademicStatsCard
                  profile={profile}
                  onEdit={() => setEditProfileOpen(true)}
                />
              </div>

              {/* Recent Applications Tracker */}
              <div className="bg-white border border-[#E4E8EF] rounded-xl p-5 sm:p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[#E4E8EF]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-bold text-[#202B3C]">Recent Applications</h2>
                      {applications.length > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F5F9] text-[#667085] border border-[#E2E8F0]">
                          {applications.length} submitted
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#667085]">Review status updates from campus recruiters</p>
                  </div>
                  {applications.length > 0 && (
                    <Link
                      to="/applications"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3569A8] hover:text-[#19365C] transition-colors"
                    >
                      <span>View All Applications</span>
                      <ArrowRight size={13} strokeWidth={1.8} />
                    </Link>
                  )}
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#CBD5E1] bg-[#FAFCFE]">
                    <Briefcase className="w-10 h-10 text-[#94A3B8] mx-auto mb-2.5" />
                    <p className="text-sm font-semibold text-[#202B3C] mb-1">No drive applications submitted yet</p>
                    <p className="text-xs text-[#667085] max-w-sm mx-auto mb-4 leading-relaxed">
                      Browse upcoming campus placement drives and apply to positions matching your qualifications.
                    </p>
                    <Link
                      to="/drives"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Briefcase size={14} strokeWidth={1.8} />
                      <span>Browse Campus Drives</span>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-[#E4E8EF]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-[#E4E8EF] text-[#667085] uppercase tracking-wider font-semibold text-[11px]">
                        <tr>
                          <th className="py-3 px-4">Company</th>
                          <th className="py-3 px-4">Role Scope</th>
                          <th className="py-3 px-4">Applied Date</th>
                          <th className="py-3 px-4">Current Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4E8EF]">
                        {applications.slice(0, 5).map((app) => (
                          <tr key={app._id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="py-3 px-4 font-semibold text-[#202B3C]">
                              {app.placementDrive?.company?.companyName || 'Corporate Partner'}
                            </td>
                            <td className="py-3 px-4 text-[#475569]">{app.placementDrive?.jobRole || '—'}</td>
                            <td className="py-3 px-4 text-[#667085] whitespace-nowrap">
                              {new Date(app.appliedAt).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={app.status} size="xs" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {applications.length > 5 && (
                      <div className="p-3 bg-[#F8FAFC] border-t border-[#E4E8EF] text-right">
                        <Link
                          to="/applications"
                          className="text-xs font-semibold text-[#3569A8] hover:text-[#19365C] transition-colors"
                        >
                          +{applications.length - 5} more applications →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div>
              <AcademicStatsCard
                profile={profile}
                onEdit={() => setEditProfileOpen(true)}
              />
            </div>
          )}

          {activeTab === 'skills' && (
            <div>
              <SkillsManager
                skills={profile.skills || []}
                onUpdateSkills={handleUpdateSkills}
                saving={saving}
              />
            </div>
          )}

          {activeTab === 'projects' && (
            <div>
              <ProjectsSection
                projects={profile.projects || []}
                onAddProject={() => { setEditingProject(null); setProjectModalOpen(true); }}
                onEditProject={(proj) => { setEditingProject(proj); setProjectModalOpen(true); }}
                onDeleteProject={handleDeleteProject}
              />
            </div>
          )}

          {activeTab === 'certifications' && (
            <div>
              <CertificationsSection
                certifications={profile.certifications || []}
                onAddCert={() => { setEditingCert(null); setCertModalOpen(true); }}
                onEditCert={(cert) => { setEditingCert(cert); setCertModalOpen(true); }}
                onDeleteCert={handleDeleteCert}
              />
            </div>
          )}

          {activeTab === 'resume' && (
            <div>
              <ResumeSection
                resume={profile.resume}
                onUpdateResume={() => setResumeModalOpen(true)}
                onDeleteResume={handleDeleteResume}
              />
            </div>
          )}
        </>
      )}

      {/* Developer Authorization & Health Tool (Enterprise Style) */}
      <div className="sd-devtools mt-8">
        <button
          type="button"
          onClick={() => setDevToolsOpen((o) => !o)}
          className="sd-devtools__toggle"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={16} strokeWidth={1.8} className="text-[#3569A8]" />
            <span>Developer Tools — Role Authorization Middleware Tester</span>
          </span>
          {devToolsOpen ? <ChevronUp size={16} strokeWidth={1.8} /> : <ChevronDown size={16} strokeWidth={1.8} />}
        </button>

        {devToolsOpen && (
          <div className="p-4 sm:p-5 border-t border-[#E4E8EF] bg-white space-y-4 text-xs">
            <p className="text-[#667085]">
              Verify server-side JWT authentication and role validation middleware (
              <code className="text-[#19365C] bg-[#EFF6FF] px-1.5 py-0.5 rounded font-mono">authorizeRoles</code>
              ) with your active token credentials. Current session role:{' '}
              <strong className="text-[#202B3C]">{user?.role}</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#F8FAFC] border border-[#E4E8EF] rounded-lg">
                <p className="text-[10px] text-[#667085] uppercase font-semibold tracking-wider mb-1">User ID</p>
                <p className="font-mono text-[#202B3C] truncate">{user?._id || 'N/A'}</p>
              </div>
              <div className="p-3 bg-[#F8FAFC] border border-[#E4E8EF] rounded-lg">
                <p className="text-[10px] text-[#667085] uppercase font-semibold tracking-wider mb-1">Auth Session</p>
                <p className="font-semibold text-[#16845B]">Active (Bearer JWT)</p>
              </div>
              <div className="p-3 bg-[#F8FAFC] border border-[#E4E8EF] rounded-lg">
                <p className="text-[10px] text-[#667085] uppercase font-semibold tracking-wider mb-1">JWT Token</p>
                <p className="font-mono text-[#667085] truncate">{token ? `${token.substring(0, 24)}...` : 'None'}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={testApiConnection}
                disabled={checkingHealth}
                className="sd-btn sd-btn--ghost"
              >
                <Activity size={14} strokeWidth={1.8} className={checkingHealth ? 'animate-pulse text-[#3569A8]' : ''} />
                <span>Test API Health</span>
              </button>
            </div>

            {healthStatus && (
              <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                healthStatus.success
                  ? 'bg-[#EBFDF5] border-[#A7F3D0] text-[#16845B]'
                  : 'bg-[#FEF2F2] border-[#FECACA] text-[#D14343]'
              }`}>
                {healthStatus.success ? (
                  <CheckCircle2 size={16} strokeWidth={1.8} />
                ) : (
                  <AlertCircle size={16} strokeWidth={1.8} />
                )}
                <span>
                  {healthStatus.success
                    ? `${healthStatus.data.message} — Database: ${healthStatus.data.database}`
                    : healthStatus.message}
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              {[
                { endpoint: 'student-only', label: 'Student Route', roles: ['STUDENT'], Icon: UserCheck },
                { endpoint: 'officer-only', label: 'Officer Route', roles: ['PLACEMENT_OFFICER', 'ADMIN'], Icon: ShieldCheck },
                { endpoint: 'admin-only', label: 'Admin Route', roles: ['ADMIN'], Icon: Lock },
              ].map(({ endpoint, label, roles, Icon }) => (
                <button
                  key={endpoint}
                  onClick={() => testRoleEndpoint(endpoint, label, roles)}
                  disabled={!!testingRoleEndpoint}
                  className="sd-btn sd-btn--ghost justify-center"
                >
                  {testingRoleEndpoint === label ? (
                    <RefreshCw size={13} strokeWidth={1.8} className="animate-spin" />
                  ) : (
                    <Icon size={13} strokeWidth={1.8} />
                  )}
                  <span>Test {label}</span>
                </button>
              ))}
            </div>

            {roleTestResult && (
              <div className={`p-3.5 rounded-lg border text-xs flex items-start gap-3 ${
                roleTestResult.success
                  ? 'bg-[#EBFDF5] border-[#A7F3D0] text-[#16845B]'
                  : 'bg-[#FEF2F2] border-[#FECACA] text-[#D14343]'
              }`}>
                {roleTestResult.success ? (
                  <CheckCircle2 size={16} strokeWidth={1.8} className="shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert size={16} strokeWidth={1.8} className="shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {roleTestResult.endpoint} • HTTP {roleTestResult.status} ({roleTestResult.success ? 'Authorized' : 'Forbidden'})
                  </p>
                  <p className="mt-0.5">{roleTestResult.message}</p>
                  <p className="text-[11px] opacity-80 mt-1 font-mono">
                    Session Role: {user?.role} | Allowed: {roleTestResult.requiredRoles.join(', ')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Modals */}
      <EditProfileModal
        profile={profile}
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        onSave={handleSaveBasicProfile}
        saving={saving}
      />
      <ProjectModal
        project={editingProject}
        isOpen={projectModalOpen}
        onClose={() => { setProjectModalOpen(false); setEditingProject(null); }}
        onSave={handleSaveProject}
        saving={saving}
      />
      <CertificationModal
        cert={editingCert}
        isOpen={certModalOpen}
        onClose={() => { setCertModalOpen(false); setEditingCert(null); }}
        onSave={handleSaveCert}
        saving={saving}
      />
      <ResumeModal
        resume={profile?.resume}
        isOpen={resumeModalOpen}
        onClose={() => setResumeModalOpen(false)}
        onSave={handleSaveResume}
        saving={saving}
      />
    </div>
  );
};

// ============================================================
// Officer / Admin Dashboard — Enterprise Theme
// ============================================================
const OfficerAdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [roleTestResult, setRoleTestResult] = useState(null);
  const [testingRoleEndpoint, setTestingRoleEndpoint] = useState('');

  // Student list — ADMIN only
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');

  const fetchStudents = useCallback(async () => {
    if (user?.role !== 'ADMIN') return;
    setLoadingStudents(true);
    setStudentError(null);
    try {
      const res = await adminListStudents();
      setStudents(res.data?.data || []);
    } catch (err) {
      setStudentError(err.response?.data?.message || 'Failed to load students.');
    } finally {
      setLoadingStudents(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const testApiConnection = async () => {
    try {
      setCheckingHealth(true);
      const res = await api.get('/health');
      setHealthStatus({ success: true, data: res.data });
    } catch (err) {
      setHealthStatus({ success: false, message: err.response?.data?.message || err.message });
    } finally {
      setCheckingHealth(false);
    }
  };

  const testRoleEndpoint = async (endpoint, endpointName, requiredRoles) => {
    try {
      setTestingRoleEndpoint(endpointName);
      setRoleTestResult(null);
      const res = await api.get(`/auth/${endpoint}`);
      setRoleTestResult({
        endpoint: endpointName,
        requiredRoles,
        success: true,
        status: res.status,
        message: res.data.message || 'Access authorized!',
      });
    } catch (err) {
      setRoleTestResult({
        endpoint: endpointName,
        requiredRoles,
        success: false,
        status: err.response?.status || 500,
        message: err.response?.data?.message || err.message,
      });
    } finally {
      setTestingRoleEndpoint('');
    }
  };

  return (
    <div className="sd-layout">
      {/* Page Header */}
      <PageHeader
        title={`Placement Office Command Center`}
        subtitle={`Welcome back, ${user?.name || 'Officer'}. Oversee placement operations, campus recruitment drives, and student applicants.`}
        breadcrumb={[
          { label: 'Portal', href: '/dashboard' },
          { label: 'Officer Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/applications" className="sd-btn sd-btn--primary">
              <FileCheck size={14} strokeWidth={1.8} />
              <span>Manage Applicants</span>
            </Link>
            <Link to="/drives" className="sd-btn sd-btn--secondary">
              <Briefcase size={14} strokeWidth={1.8} />
              <span>Placement Drives</span>
            </Link>
            <Link to="/companies" className="sd-btn sd-btn--ghost">
              <Building2 size={14} strokeWidth={1.8} />
              <span>Companies</span>
            </Link>
            <button
              onClick={testApiConnection}
              disabled={checkingHealth}
              className="sd-btn sd-btn--ghost"
              title="Test API Connection"
            >
              <RefreshCw size={14} strokeWidth={1.8} className={checkingHealth ? 'animate-spin' : ''} />
              <span>Health</span>
            </button>
          </div>
        }
      />

      {healthStatus && (
        <div className={`mb-6 p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
          healthStatus.success
            ? 'bg-[#EBFDF5] border-[#A7F3D0] text-[#16845B]'
            : 'bg-[#FEF2F2] border-[#FECACA] text-[#D14343]'
        }`}>
          {healthStatus.success ? <CheckCircle2 size={16} strokeWidth={1.8} /> : <AlertCircle size={16} strokeWidth={1.8} />}
          <span>
            {healthStatus.success
              ? `Backend API Healthy: ${healthStatus.data.message} (${healthStatus.data.status})`
              : `Connection Issue: ${healthStatus.message}`}
          </span>
        </div>
      )}

      {/* Top Profile Summary Card */}
      <div className="bg-white border border-[#E4E8EF] rounded-xl p-5 sm:p-6 mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#19365C] text-white text-lg font-bold flex items-center justify-center shrink-0 border border-[#E4E8EF]">
              {getUserInitials(user?.name)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold text-[#202B3C]">{user?.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE]">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-[#667085] flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail size={12} strokeWidth={1.8} />
                  {user?.email}
                </span>
                <span className="font-mono text-[#94A3B8]">ID: {user?._id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#F8FAFC] border border-[#E4E8EF] rounded-lg text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#667085]">Auth Status</p>
              <p className="text-xs font-bold text-[#16845B] flex items-center justify-end gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-[#16845B]" />
                JWT Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Hub Command Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Applicants Review */}
        <div className="bg-white border border-[#E4E8EF] rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#3569A8] flex items-center justify-center mb-4">
              <FileCheck size={20} strokeWidth={1.8} />
            </div>
            <h3 className="text-base font-bold text-[#202B3C] mb-1.5">
              Candidate Applications
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed mb-6">
              Review candidate student pools, evaluate CGPA &amp; backlogs, shortlist applicants, and advance interview stages.
            </p>
          </div>
          <Link
            to="/applications"
            className="sd-btn sd-btn--primary w-full justify-center"
          >
            <FileCheck size={14} strokeWidth={1.8} />
            <span>Manage Applications</span>
          </Link>
        </div>

        {/* Drives Scheduling */}
        <div className="bg-white border border-[#E4E8EF] rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#19365C] flex items-center justify-center mb-4">
              <Briefcase size={20} strokeWidth={1.8} />
            </div>
            <h3 className="text-base font-bold text-[#202B3C] mb-1.5">
              Campus Placement Drives
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed mb-6">
              Schedule corporate hiring drives, configure department and academic requirements, and announce openings.
            </p>
          </div>
          <Link
            to="/drives"
            className="sd-btn sd-btn--secondary w-full justify-center"
          >
            <Briefcase size={14} strokeWidth={1.8} />
            <span>Schedule Placement Drives</span>
          </Link>
        </div>

        {/* Company Registry */}
        <div className="bg-white border border-[#E4E8EF] rounded-xl p-6 shadow-sm flex flex-col justify-between hover:border-[#CBD5E1] transition-all">
          <div>
            <div className="w-10 h-10 rounded-lg bg-[#F8FAFC] text-[#202B3C] flex items-center justify-center mb-4 border border-[#E4E8EF]">
              <Building2 size={20} strokeWidth={1.8} />
            </div>
            <h3 className="text-base font-bold text-[#202B3C] mb-1.5">
              Partner Organizations
            </h3>
            <p className="text-xs text-[#667085] leading-relaxed mb-6">
              Maintain the corporate recruiters directory, register new campus partners, and record recruiter contact personnel.
            </p>
          </div>
          <Link
            to="/companies"
            className="sd-btn sd-btn--ghost w-full justify-center"
          >
            <Building2 size={14} strokeWidth={1.8} />
            <span>Company Directory</span>
          </Link>
        </div>
      </div>

      {/* ── Admin-only: Registered Students Table ─────────────────────────── */}
      {user?.role === 'ADMIN' && (
        <div className="bg-white border border-[#E4E8EF] rounded-xl shadow-sm overflow-hidden mb-8">
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E4E8EF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
                <Users size={18} strokeWidth={1.8} className="text-[#3569A8]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#202B3C]">Registered Students</h2>
                <p className="text-xs text-[#667085]">
                  {loadingStudents
                    ? 'Loading…'
                    : `${students.length} student${students.length !== 1 ? 's' : ''} in the system`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search size={14} strokeWidth={1.8} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search students…"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-xs border border-[#E4E8EF] rounded-lg bg-[#F8FAFC] text-[#202B3C] placeholder:text-[#A0AABA] focus:outline-none focus:ring-2 focus:ring-[#3569A8]/25 focus:border-[#3569A8] w-48 transition-colors"
                />
              </div>
              {/* Refresh */}
              <button
                onClick={fetchStudents}
                disabled={loadingStudents}
                title="Refresh"
                className="p-2 rounded-lg border border-[#E4E8EF] bg-white text-[#667085] hover:text-[#202B3C] hover:bg-[#F5F7FA] transition-colors disabled:opacity-50"
              >
                <RefreshCw size={14} strokeWidth={1.8} className={loadingStudents ? 'animate-spin' : ''} />
              </button>
              {/* Add Student */}
              <Link
                to="/admin/add-student"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#19365C] hover:bg-[#122844] text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <UserPlus size={14} strokeWidth={1.8} />
                <span className="hidden sm:inline">Add Student</span>
              </Link>
            </div>
          </div>

          {/* Table Body */}
          {loadingStudents ? (
            <div className="flex items-center justify-center gap-2 py-14 text-[#667085]">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">Loading student records…</span>
            </div>
          ) : studentError ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center px-6">
              <AlertCircle size={28} className="text-[#D14343]/60" />
              <p className="text-sm text-[#D14343]">{studentError}</p>
              <button onClick={fetchStudents} className="text-xs text-[#3569A8] hover:underline mt-1 flex items-center gap-1">
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center px-6">
              <div className="w-12 h-12 rounded-full bg-[#F5F7FA] flex items-center justify-center">
                <GraduationCap size={24} strokeWidth={1.5} className="text-[#CBD5E1]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#667085]">No students registered yet</p>
                <p className="text-xs text-[#A0AABA] mt-0.5">Use Add Student to create the first student account.</p>
              </div>
              <Link
                to="/admin/add-student"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#19365C] text-white text-xs font-semibold mt-1"
              >
                <UserPlus size={14} strokeWidth={1.8} />
                Add First Student
              </Link>
            </div>
          ) : (() => {
              const q = studentSearch.toLowerCase().trim();
              const filtered = q
                ? students.filter(
                    (s) =>
                      s.name?.toLowerCase().includes(q) ||
                      s.email?.toLowerCase().includes(q) ||
                      s.registerNumber?.toLowerCase().includes(q) ||
                      s.department?.toLowerCase().includes(q) ||
                      s.academicYear?.toLowerCase().includes(q)
                  )
                : students;

              return (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#F8FAFC] border-b border-[#E4E8EF]">
                          <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#667085] px-6 py-3">#</th>
                          <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#667085] px-4 py-3">Student</th>
                          <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#667085] px-4 py-3">Reg. No.</th>
                          <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#667085] px-4 py-3">Department</th>
                          <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#667085] px-4 py-3">Year / Batch</th>
                          <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#667085] px-4 py-3">Registered</th>
                          <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-[#667085] px-4 py-3">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4E8EF]">
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-10 text-sm text-[#667085]">
                              No students match "<span className="font-medium text-[#202B3C]">{studentSearch}</span>"
                            </td>
                          </tr>
                        ) : (
                          filtered.map((s, idx) => (
                            <tr key={s._id} className="hover:bg-[#F8FAFC] transition-colors">
                              <td className="px-6 py-3.5 text-xs text-[#A0AABA] font-mono">{idx + 1}</td>
                              <td className="px-4 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-[#19365C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                                    {s.name?.trim().split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#202B3C] truncate leading-tight">{s.name}</p>
                                    <p className="text-xs text-[#667085] truncate">{s.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3.5">
                                {s.registerNumber ? (
                                  <span className="inline-flex items-center gap-1 text-xs font-mono text-[#202B3C] bg-[#F5F7FA] border border-[#E4E8EF] px-2 py-0.5 rounded">
                                    <Hash size={10} /> {s.registerNumber}
                                  </span>
                                ) : (
                                  <span className="text-xs text-[#A0AABA]">—</span>
                                )}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-[#667085] max-w-[200px] truncate">
                                {s.department || <span className="text-[#A0AABA]">—</span>}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-[#667085]">
                                {s.academicYear || s.batch || <span className="text-[#A0AABA]">—</span>}
                              </td>
                              <td className="px-4 py-3.5 text-xs text-[#667085]">
                                {s.createdAt
                                  ? new Date(s.createdAt).toLocaleDateString('en-IN', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })
                                  : '—'}
                              </td>
                              <td className="px-4 py-3.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE]">
                                  <GraduationCap size={10} /> Student
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List */}
                  <div className="md:hidden divide-y divide-[#E4E8EF]">
                    {filtered.length === 0 ? (
                      <p className="text-center py-8 text-sm text-[#667085]">No results found.</p>
                    ) : (
                      filtered.map((s) => (
                        <div key={s._id} className="px-5 py-4 hover:bg-[#F8FAFC] transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#19365C] text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {s.name?.trim().split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-[#202B3C] truncate">{s.name}</p>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#3569A8] border border-[#BFDBFE] shrink-0">
                                  STUDENT
                                </span>
                              </div>
                              <p className="text-xs text-[#667085] truncate mt-0.5">{s.email}</p>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1.5">
                                {s.registerNumber && (
                                  <span className="text-[11px] text-[#667085] flex items-center gap-0.5 font-mono">
                                    <Hash size={10} /> {s.registerNumber}
                                  </span>
                                )}
                                {s.department && (
                                  <span className="text-[11px] text-[#667085] truncate max-w-[180px]">
                                    {s.department}
                                  </span>
                                )}
                                {(s.academicYear || s.batch) && (
                                  <span className="text-[11px] text-[#667085]">{s.academicYear || s.batch}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Table Footer */}
                  <div className="px-6 py-3 border-t border-[#E4E8EF] bg-[#F8FAFC] flex items-center justify-between">
                    <p className="text-xs text-[#667085]">
                      {q
                        ? `${filtered.length} of ${students.length} students`
                        : `${students.length} student${students.length !== 1 ? 's' : ''} total`}
                    </p>
                    <Link
                      to="/admin/add-student"
                      className="text-xs text-[#3569A8] hover:underline font-medium flex items-center gap-1"
                    >
                      <UserPlus size={12} /> Add another student
                    </Link>
                  </div>
                </>
              );
            })()
          }
        </div>
      )}

      {/* Role Authorization Tester */}
      <div className="bg-white border border-[#E4E8EF] rounded-xl p-6 shadow-sm">        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck size={18} strokeWidth={1.8} className="text-[#3569A8]" />
          <h2 className="text-sm font-bold text-[#202B3C]">Role-Based Access Verification</h2>
        </div>
        <p className="text-xs text-[#667085] mb-5">
          Verify backend authorization middleware (<code className="text-[#19365C] bg-[#EFF6FF] px-1 py-0.5 rounded font-mono">authorizeRoles</code>) with current identity (<strong className="text-[#202B3C]">{user?.role}</strong>).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {[
            { endpoint: 'student-only', label: 'Student Route', roles: ['STUDENT'], Icon: UserCheck },
            { endpoint: 'officer-only', label: 'Officer Route', roles: ['PLACEMENT_OFFICER', 'ADMIN'], Icon: ShieldCheck },
            { endpoint: 'admin-only', label: 'Admin Route', roles: ['ADMIN'], Icon: Lock },
          ].map(({ endpoint, label, roles, Icon }) => (
            <div key={endpoint} className="p-3.5 rounded-lg bg-[#F8FAFC] border border-[#E4E8EF] flex flex-col justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-[#202B3C]">{label}</p>
                <p className="text-[11px] text-[#667085] mt-0.5 font-mono">Allowed: {roles.join(' / ')}</p>
              </div>
              <button
                onClick={() => testRoleEndpoint(endpoint, label, roles)}
                disabled={!!testingRoleEndpoint}
                className="sd-btn sd-btn--ghost justify-center w-full"
              >
                {testingRoleEndpoint === label ? (
                  <RefreshCw size={13} strokeWidth={1.8} className="animate-spin" />
                ) : (
                  <Icon size={13} strokeWidth={1.8} />
                )}
                <span>Test Access</span>
              </button>
            </div>
          ))}
        </div>

        {roleTestResult && (
          <div className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
            roleTestResult.success
              ? 'bg-[#EBFDF5] border-[#A7F3D0] text-[#16845B]'
              : 'bg-[#FEF2F2] border-[#FECACA] text-[#D14343]'
          }`}>
            {roleTestResult.success ? (
              <CheckCircle2 size={16} strokeWidth={1.8} className="shrink-0 mt-0.5" />
            ) : (
              <ShieldAlert size={16} strokeWidth={1.8} className="shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">
                {roleTestResult.endpoint} • HTTP {roleTestResult.status} ({roleTestResult.success ? 'Authorized' : 'Forbidden'})
              </p>
              <p className="mt-0.5">{roleTestResult.message}</p>
              <p className="text-[11px] opacity-80 mt-1 font-mono">
                Your Role: {user?.role} | Required: {roleTestResult.requiredRoles.join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Main Dashboard Container Component
// ============================================================
const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  return <OfficerAdminDashboard />;
};

export default Dashboard;
