import React, { useState, useEffect, useRef } from 'react';
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
import { getStatusConfig } from '../components/applications/ApplicationStatusBadge';

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
  ClipboardList,
  ArrowRight,
} from 'lucide-react';

const getRoleBadgeClasses = (role) => {
  switch (role) {
    case 'ADMIN':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'PLACEMENT_OFFICER':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    default:
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  }
};

// ============================================================
// Student Dashboard — Redesigned for production SaaS look
// ============================================================
const StudentDashboard = () => {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Section refs for scroll-to
  const academicRef = useRef(null);
  const skillsRef = useRef(null);
  const projectsRef = useRef(null);
  const certsRef = useRef(null);
  const resumeRef = useRef(null);

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

  const scrollToSection = (section) => {
    const map = {
      academic: academicRef,
      skills: skillsRef,
      projects: projectsRef,
      certifications: certsRef,
      resume: resumeRef,
    };
    const ref = map[section];
    if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      showToast('Profile updated.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally { setSaving(false); }
  };

  const handleUpdateSkills = async (skills) => {
    try {
      setSaving(true);
      const res = await updateSkills(skills);
      setProfile(res.data);
      showToast('Skills saved.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update skills', 'error');
    } finally { setSaving(false); }
  };

  const handleSaveProject = async (data, projectId) => {
    try {
      setSaving(true);
      let res;
      if (projectId) { res = await updateProject(projectId, data); showToast('Project updated.'); }
      else { res = await addProject(data); showToast('Project added.'); }
      setProfile(res.data);
      setProjectModalOpen(false);
      setEditingProject(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save project', 'error');
    } finally { setSaving(false); }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Remove this project?')) return;
    try {
      setSaving(true);
      const res = await deleteProject(projectId);
      setProfile(res.data);
      showToast('Project removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setSaving(false); }
  };

  const handleSaveCert = async (data, certId) => {
    try {
      setSaving(true);
      let res;
      if (certId) { res = await updateCertification(certId, data); showToast('Certification updated.'); }
      else { res = await addCertification(data); showToast('Certification added.'); }
      setProfile(res.data);
      setCertModalOpen(false);
      setEditingCert(null);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDeleteCert = async (certId) => {
    if (!window.confirm('Remove this certification?')) return;
    try {
      setSaving(true);
      const res = await deleteCertification(certId);
      setProfile(res.data);
      showToast('Removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setSaving(false); }
  };

  const handleSaveResume = async (data) => {
    try {
      setSaving(true);
      const res = await updateResume(data);
      setProfile(res.data);
      setResumeModalOpen(false);
      showToast('Resume updated.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setSaving(false); }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Remove your resume?')) return;
    try {
      setSaving(true);
      const res = await deleteResume();
      setProfile(res.data);
      showToast('Resume removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    } finally { setSaving(false); }
  };

  const testApiConnection = async () => {
    try {
      setCheckingHealth(true);
      const res = await api.get('/health');
      setHealthStatus({ success: true, data: res.data });
    } catch (err) {
      setHealthStatus({ success: false, message: err.response?.data?.message || err.message });
    } finally { setCheckingHealth(false); }
  };

  const testRoleEndpoint = async (endpoint, endpointName, requiredRoles) => {
    try {
      setTestingRoleEndpoint(endpointName);
      setRoleTestResult(null);
      const res = await api.get(`/auth/${endpoint}`);
      setRoleTestResult({ endpoint: endpointName, requiredRoles, success: true, status: res.status, message: res.data.message || 'Access authorized!' });
    } catch (err) {
      setRoleTestResult({ endpoint: endpointName, requiredRoles, success: false, status: err.response?.status || 500, message: err.response?.data?.message || err.message });
    } finally { setTestingRoleEndpoint(''); }
  };

  const getAppStatusCls = (status) => {
    switch (status?.toUpperCase()) {
      case 'SELECTED': return 'sd-badge sd-badge--green';
      case 'SHORTLISTED': return 'sd-badge sd-badge--amber';
      case 'INTERVIEW': return 'sd-badge sd-badge--blue';
      case 'REJECTED': return 'sd-badge sd-badge--red';
      default: return 'sd-badge sd-badge--neutral';
    }
  };

  const getAppStatusLabel = (status) => {
    const cfg = getStatusConfig(status);
    return cfg.label;
  };

  return (
    <div className="sd-layout">
      {/* Toast */}
      {toast && (
        <div className={`sd-toast ${toast.type === 'error' ? 'sd-toast--error' : 'sd-toast--success'}`}>
          {toast.type === 'error'
            ? <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
            : <CheckCircle2 style={{ width: 15, height: 15, flexShrink: 0 }} />}
          {toast.message}
        </div>
      )}

      {/* ---- Page Header ---- */}
      <div className="sd-page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h1 className="sd-page-header__title">
              {user?.name?.split(' ')[0] || 'Student'}'s Dashboard
            </h1>
            <span className={`sd-badge ${getRoleBadgeClasses(user?.role)}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
          <p className="sd-page-header__sub">{user?.email} · Placement Management System</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Link to="/drives" id="student-dashboard-drives-btn" className="sd-btn sd-btn--primary">
            <Briefcase style={{ width: 13, height: 13 }} />
            Browse Drives
          </Link>
          <Link to="/applications" id="student-dashboard-applications-btn" className="sd-btn sd-btn--ghost">
            <ClipboardList style={{ width: 13, height: 13 }} />
            Applications
            {applications.length > 0 && (
              <span style={{ padding: '1px 6px', background: '#1e1b4b', color: '#818cf8', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>
                {applications.length}
              </span>
            )}
          </Link>
          <Link to="/companies" id="student-dashboard-companies-btn" className="sd-btn sd-btn--ghost">
            <Building2 style={{ width: 13, height: 13 }} />
            Companies
          </Link>
          <button onClick={fetchProfile} disabled={loadingProfile} className="sd-btn sd-btn--ghost" title="Refresh">
            <RefreshCw style={{ width: 13, height: 13 }} className={loadingProfile ? 'animate-spin' : ''} />
          </button>
          <button onClick={logout} className="sd-btn sd-btn--danger">
            <LogOut style={{ width: 13, height: 13 }} />
            Logout
          </button>
        </div>
      </div>

      {/* ---- Loading ---- */}
      {loadingProfile && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '10px' }}>
          <Loader2 style={{ width: 22, height: 22, color: '#818cf8' }} className="animate-spin" />
          <p style={{ fontSize: '13px', color: '#64748b' }}>Loading your profile…</p>
        </div>
      )}

      {/* ---- Error ---- */}
      {profileError && !loadingProfile && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 14px', background: '#1c0a0a',
          border: '1px solid #7f1d1d', borderRadius: '8px',
          marginBottom: '16px', fontSize: '13px', color: '#fca5a5',
        }}>
          <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
          <span><strong>Failed to load profile:</strong> {profileError}</span>
          <button onClick={fetchProfile} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline', padding: 0 }}>
            Retry
          </button>
        </div>
      )}

      {/* ---- Main Content ---- */}
      {!loadingProfile && profile && (
        <>
          {/* Profile Completion */}
          <ProfileCompletionCard
            profile={profile}
            onActionClick={(action) => {
              if (action === 'academic') setEditProfileOpen(true);
              else scrollToSection(action);
            }}
          />

          {/* Applications Tracker */}
          <div className="sd-section" style={{ marginTop: '12px' }}>
            <div className="sd-section__header" style={{ marginBottom: applications.length === 0 ? 0 : '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <h2 className="sd-section__title">Recent Applications</h2>
                  {applications.length > 0 && (
                    <span className="sd-badge sd-badge--neutral">{applications.length} total</span>
                  )}
                </div>
                <p className="sd-section__sub">Track your placement application status</p>
              </div>
              {applications.length > 0 && (
                <Link to="/applications" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>
                  View all
                  <ArrowRight style={{ width: 12, height: 12 }} />
                </Link>
              )}
            </div>

            {applications.length === 0 ? (
              <div className="sd-empty-state">
                <p className="sd-empty-state__title">No applications yet</p>
                <p className="sd-empty-state__body">Browse available placement drives and apply to get started.</p>
                <Link to="/drives" className="sd-btn sd-btn--primary" style={{ marginTop: '12px', display: 'inline-flex' }}>
                  <Briefcase style={{ width: 13, height: 13 }} />
                  Browse Drives
                </Link>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="sd-table">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Role</th>
                      <th>Applied</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.slice(0, 5).map((app) => (
                      <tr key={app._id}>
                        <td style={{ fontWeight: 500, color: '#e2e8f0' }}>
                          {app.placementDrive?.company?.companyName || '—'}
                        </td>
                        <td>{app.placementDrive?.jobRole || '—'}</td>
                        <td style={{ color: '#64748b', whiteSpace: 'nowrap' }}>
                          {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td>
                          <span className={getAppStatusCls(app.status)}>
                            {getAppStatusLabel(app.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {applications.length > 5 && (
                  <div style={{ padding: '10px 12px', borderTop: '1px solid #1e293b' }}>
                    <Link to="/applications" style={{ fontSize: '12px', color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>
                      +{applications.length - 5} more applications →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section group: Profile */}
          <p className="sd-group-label">Your Profile</p>

          <div ref={academicRef} className="scroll-mt-20">
            <AcademicStatsCard profile={profile} onEdit={() => setEditProfileOpen(true)} />
          </div>

          <div ref={skillsRef} className="scroll-mt-20">
            <SkillsManager
              skills={profile.skills || []}
              onUpdateSkills={handleUpdateSkills}
              saving={saving}
            />
          </div>

          {/* Section group: Portfolio */}
          <p className="sd-group-label">Portfolio</p>

          <div ref={projectsRef} className="scroll-mt-20">
            <ProjectsSection
              projects={profile.projects || []}
              onAddProject={() => { setEditingProject(null); setProjectModalOpen(true); }}
              onEditProject={(proj) => { setEditingProject(proj); setProjectModalOpen(true); }}
              onDeleteProject={handleDeleteProject}
            />
          </div>

          <div ref={certsRef} className="scroll-mt-20">
            <CertificationsSection
              certifications={profile.certifications || []}
              onAddCert={() => { setEditingCert(null); setCertModalOpen(true); }}
              onEditCert={(cert) => { setEditingCert(cert); setCertModalOpen(true); }}
              onDeleteCert={handleDeleteCert}
            />
          </div>

          <div ref={resumeRef} className="scroll-mt-20">
            <ResumeSection
              resume={profile.resume}
              onUpdateResume={() => setResumeModalOpen(true)}
              onDeleteResume={handleDeleteResume}
            />
          </div>
        </>
      )}

      {/* ---- Dev Tools (collapsible) ---- */}
      <div className="sd-devtools">
        <button
          type="button"
          onClick={() => setDevToolsOpen((o) => !o)}
          className="sd-devtools__toggle"
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck style={{ width: 13, height: 13, color: '#4338ca' }} />
            Developer Tools — Role Authorization Tester
          </span>
          {devToolsOpen
            ? <ChevronUp style={{ width: 13, height: 13 }} />
            : <ChevronDown style={{ width: 13, height: 13 }} />}
        </button>

        {devToolsOpen && (
          <div style={{ padding: '16px', borderTop: '1px solid #1e293b', background: '#080e1a', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              Test server-side role validation middleware (
              <code style={{ color: '#818cf8', background: '#1e293b', padding: '1px 5px', borderRadius: '3px', fontSize: '11px' }}>authorizeRoles</code>
              ) with your current token — role: <strong style={{ color: '#e2e8f0' }}>{user?.role}</strong>
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { label: 'User ID', value: user?._id, mono: true },
                { label: 'Authentication', value: 'Active (JWT)', highlight: true },
                { label: 'JWT Token', value: token ? `${token.substring(0, 28)}…` : 'None', mono: true },
              ].map((f) => (
                <div key={f.label} style={{ padding: '10px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{f.label}</div>
                  <div style={{ fontSize: '11px', color: f.highlight ? '#4ade80' : '#64748b', fontFamily: f.mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>
                    {f.value}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <button onClick={testApiConnection} disabled={checkingHealth} className="sd-btn sd-btn--ghost">
                <Activity style={{ width: 12, height: 12 }} className={checkingHealth ? 'animate-pulse' : ''} />
                Test API Health
              </button>
            </div>

            {healthStatus && (
              <div style={{
                padding: '10px 12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                background: healthStatus.success ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${healthStatus.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                color: healthStatus.success ? '#4ade80' : '#f87171',
              }}>
                {healthStatus.success
                  ? <CheckCircle2 style={{ width: 13, height: 13 }} />
                  : <AlertCircle style={{ width: 13, height: 13 }} />}
                {healthStatus.success
                  ? `${healthStatus.data.message} — DB: ${healthStatus.data.database}`
                  : healthStatus.message}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { endpoint: 'student-only', label: 'Student Route', roles: ['STUDENT'], Icon: UserCheck },
                { endpoint: 'officer-only', label: 'Officer Route', roles: ['PLACEMENT_OFFICER', 'ADMIN'], Icon: ShieldCheck },
                { endpoint: 'admin-only', label: 'Admin Route', roles: ['ADMIN'], Icon: Lock },
              ].map(({ endpoint, label, roles, Icon }) => (
                <button
                  key={endpoint}
                  onClick={() => testRoleEndpoint(endpoint, label, roles)}
                  disabled={!!testingRoleEndpoint}
                  className="sd-btn sd-btn--ghost"
                  style={{ justifyContent: 'center', width: '100%' }}
                >
                  {testingRoleEndpoint === label
                    ? <RefreshCw style={{ width: 12, height: 12 }} className="animate-spin" />
                    : <Icon style={{ width: 12, height: 12 }} />}
                  Test {label}
                </button>
              ))}
            </div>

            {roleTestResult && (
              <div style={{
                padding: '12px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'flex-start', gap: '8px',
                background: roleTestResult.success ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${roleTestResult.success ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                color: roleTestResult.success ? '#4ade80' : '#f87171',
              }}>
                {roleTestResult.success
                  ? <CheckCircle2 style={{ width: 14, height: 14, flexShrink: 0, marginTop: '1px' }} />
                  : <ShieldAlert style={{ width: 14, height: 14, flexShrink: 0, marginTop: '1px' }} />}
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                    {roleTestResult.endpoint} · HTTP {roleTestResult.status} — {roleTestResult.success ? 'Authorized' : 'Forbidden'}
                  </div>
                  <p style={{ margin: '0 0 4px', opacity: 0.9 }}>{roleTestResult.message}</p>
                  <p style={{ margin: 0, opacity: 0.7, fontSize: '11px' }}>
                    Your role: <code style={{ fontFamily: 'monospace' }}>{user?.role}</code> · Required:{' '}
                    <code style={{ fontFamily: 'monospace' }}>{roleTestResult.requiredRoles.join(', ')}</code>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
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
// Non-student (Officer / Admin) dashboard — existing feature
// ============================================================
const OfficerAdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [roleTestResult, setRoleTestResult] = useState(null);
  const [testingRoleEndpoint, setTestingRoleEndpoint] = useState('');

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
      setRoleTestResult({ endpoint: endpointName, requiredRoles, success: true, status: res.status, message: res.data.message });
    } catch (err) {
      setRoleTestResult({ endpoint: endpointName, requiredRoles, success: false, status: err.response?.status || 500, message: err.response?.data?.message || err.message });
    } finally {
      setTestingRoleEndpoint('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden mb-8">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getRoleBadgeClasses(user?.role)}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-400 text-sm">Placement Management System Portal • Authenticated via JWT</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <Link
              to="/applications"
              id="officer-dashboard-applicants-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-all shadow-sm"
            >
              <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
              <span>Manage Applicants</span>
            </Link>
            <Link
              to="/drives"
              id="officer-dashboard-drives-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-medium transition-all shadow-md shadow-indigo-600/20"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Manage Drives</span>
            </Link>
            <Link
              to="/companies"
              id="officer-dashboard-companies-btn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-all shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Companies</span>
            </Link>
            <button onClick={testApiConnection} disabled={checkingHealth} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-sm disabled:opacity-50">
              <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
              Test API
            </button>
            <button onClick={logout} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors shadow-sm">
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>

        {healthStatus && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${healthStatus.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
            {healthStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
            {healthStatus.success ? `Backend API Live: ${healthStatus.data.message} (${healthStatus.data.status})` : `Backend Connection: ${healthStatus.message}`}
          </div>
        )}
      </div>

      {/* Profile Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            Profile Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Full Name', value: user?.name, Icon: User },
              { label: 'Email Address', value: user?.email, Icon: User },
              { label: 'Assigned Role', value: user?.role?.replace('_', ' '), Icon: Shield, colored: true },
              { label: 'Account ID', value: user?._id, Icon: Key, mono: true, xs: true },
            ].map(({ label, value, Icon, colored, mono, xs }) => (
              <div key={label} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  {label}
                </div>
                <div className={`${xs ? 'text-xs' : 'text-base'} font-semibold ${colored ? 'text-indigo-400' : 'text-white'} ${mono ? 'font-mono' : ''} truncate`}>
                  {value || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Session Status
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-xs text-slate-400">Authentication</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active (JWT)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-xs text-slate-400">Security</span>
              <span className="text-xs font-medium text-slate-300">bcrypt hashed</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Key className="w-3.5 h-3.5 text-slate-500" />
                JWT Token Attached
              </div>
              <div className="text-[10px] font-mono text-slate-500 truncate">
                {token ? `${token.substring(0, 32)}...` : 'None'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placement Operations Command Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Placement Applications Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400">
                <ClipboardList className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                Application Review
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Student Applications</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Review applicant pools, screen student profiles, shortlist candidates, track interview stages, and add evaluation remarks.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/applications"
              id="cmd-manage-applications-btn"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Manage Applicants</span>
            </Link>
          </div>
        </div>

        {/* Placement Drives Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Drive Management
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Campus Placement Drives</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Create and schedule campus recruitment drives, specify academic thresholds (CGPA, allowed backlogs, eligible branches), and manage drive statuses.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/drives"
              id="cmd-manage-drives-btn"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Launch Drives Portal</span>
            </Link>
          </div>
        </div>

        {/* Companies Registry Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900 border border-sky-500/20 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-2xl bg-sky-600/10 border border-sky-500/30 text-sky-400">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                Partner Registry
              </span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Partner Companies Directory</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Register corporate partners, maintain campus HR points-of-contact, catalog corporate websites, and manage industry domain details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/companies"
              id="cmd-manage-companies-btn"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition-all hover:scale-[1.02]"
            >
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Manage Companies</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Role Authorization Tester */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Role-Based Authorization Testing</h2>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Test server-side role validation middleware (<code className="text-xs text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">authorizeRoles</code>) with your current token (<span className="text-white font-semibold">{user?.role}</span>).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { endpoint: 'student-only', label: 'Student Route', roles: ['STUDENT'], color: 'indigo', Icon: UserCheck },
            { endpoint: 'officer-only', label: 'Officer Route', roles: ['PLACEMENT_OFFICER', 'ADMIN'], color: 'amber', Icon: ShieldCheck },
            { endpoint: 'admin-only', label: 'Admin Route', roles: ['ADMIN'], color: 'emerald', Icon: Lock },
          ].map(({ endpoint, label, roles, color, Icon }) => (
            <div key={endpoint} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold uppercase tracking-wider text-${color}-400`}>{label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded bg-${color}-500/10 text-${color}-300 border border-${color}-500/20`}>
                    {roles.join(' / ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => testRoleEndpoint(endpoint, label, roles)}
                disabled={!!testingRoleEndpoint}
                className={`w-full py-2 px-3 rounded-lg bg-${color}-600/20 hover:bg-${color}-600 text-${color}-300 hover:text-white border border-${color}-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50`}
              >
                {testingRoleEndpoint === label ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
                Test Access
              </button>
            </div>
          ))}
        </div>
        {roleTestResult && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${roleTestResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
            {roleTestResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" /> : <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />}
            <div>
              <div className="font-semibold mb-0.5">{roleTestResult.endpoint} • HTTP {roleTestResult.status} {roleTestResult.success ? '(Authorized)' : '(Forbidden)'}</div>
              <p className="text-xs opacity-90">{roleTestResult.message}</p>
              <p className="text-[11px] opacity-75 mt-1">Your Role: <span className="font-mono font-bold">{user?.role}</span> | Required: <span className="font-mono">{roleTestResult.requiredRoles.join(', ')}</span></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// Main Dashboard — routes to role-appropriate view
// ============================================================
const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  return <OfficerAdminDashboard />;
};

export default Dashboard;
