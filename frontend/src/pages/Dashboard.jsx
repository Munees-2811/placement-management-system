import React, { useState, useEffect, useRef } from 'react';
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

import {
  LogOut,
  RefreshCw,
  GraduationCap,
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
// Student Dashboard
// ============================================================
const StudentDashboard = () => {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
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

  // Dev tools panel (role-tester etc.)
  const [devToolsOpen, setDevToolsOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);
  const [roleTestResult, setRoleTestResult] = useState(null);
  const [testingRoleEndpoint, setTestingRoleEndpoint] = useState('');

  // --- Helpers ---
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
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- API calls ---
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      setProfileError(null);
      const res = await getStudentProfile();
      setProfile(res.data);
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
      showToast('Academic profile updated successfully!');
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
      showToast('Skills updated!');
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
        showToast('Project updated successfully!');
      } else {
        res = await addProject(data);
        showToast('Project added successfully!');
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
    if (!window.confirm('Remove this project from your profile?')) return;
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
        showToast('Certification updated!');
      } else {
        res = await addCertification(data);
        showToast('Certification added!');
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
    if (!window.confirm('Remove this certification from your profile?')) return;
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

  const handleSaveResume = async (data) => {
    try {
      setSaving(true);
      const res = await updateResume(data);
      setProfile(res.data);
      setResumeModalOpen(false);
      showToast('Resume updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update resume', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Remove your resume from the profile?')) return;
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

  // Dev tools
  const testApiConnection = async () => {
    try {
      setCheckingHealth(true);
      const res = await api.get('/health');
      setHealthStatus({ success: true, data: res.data });
    } catch (err) {
      setHealthStatus({
        success: false,
        message: err.response?.data?.message || err.message || 'Cannot reach API server',
      });
    } finally {
      setCheckingHealth(false);
    }
  };

  const testRoleEndpoint = async (endpoint, endpointName, requiredRoles) => {
    try {
      setTestingRoleEndpoint(endpointName);
      setRoleTestResult(null);
      const res = await api.get(`/auth/${endpoint}`);
      setRoleTestResult({ endpoint: endpointName, requiredRoles, success: true, status: res.status, message: res.data.message || 'Access authorized!' });
    } catch (err) {
      setRoleTestResult({ endpoint: endpointName, requiredRoles, success: false, status: err.response?.status || 500, message: err.response?.data?.message || err.message || 'Access Denied' });
    } finally {
      setTestingRoleEndpoint('');
    }
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium flex items-center gap-2 transition-all animate-in slide-in-from-top-2 ${
          toast.type === 'error'
            ? 'bg-rose-900/90 border-rose-700 text-rose-200'
            : 'bg-emerald-900/90 border-emerald-700 text-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {toast.message}
        </div>
      )}

      {/* Welcome Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden mb-7">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Welcome, {user?.name?.split(' ')[0] || 'Student'}!
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getRoleBadgeClasses(user?.role)}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Placement Management System — Keep your profile complete to maximize placement opportunities.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={fetchProfile}
              disabled={loadingProfile}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingProfile ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loadingProfile && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading your student profile...</p>
        </div>
      )}

      {/* Error State */}
      {profileError && !loadingProfile && (
        <div className="p-4 rounded-xl bg-rose-900/20 border border-rose-800 text-rose-300 flex items-center gap-3 mb-6 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <div>
            <span className="font-semibold">Failed to load profile:</span> {profileError}
            <button onClick={fetchProfile} className="ml-3 underline text-rose-400 hover:text-rose-300 text-xs">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Main Student Profile Content */}
      {!loadingProfile && profile && (
        <div className="space-y-6">
          {/* Profile Completion */}
          <ProfileCompletionCard
            profile={profile}
            onActionClick={(action) => {
              if (action === 'academic') {
                setEditProfileOpen(true);
              } else {
                scrollToSection(action);
              }
            }}
          />

          {/* Academic & Contact Info */}
          <div ref={academicRef} className="scroll-mt-6">
            <AcademicStatsCard
              profile={profile}
              onEdit={() => setEditProfileOpen(true)}
            />
          </div>

          {/* Skills */}
          <div ref={skillsRef} className="scroll-mt-6">
            <SkillsManager
              skills={profile.skills || []}
              onUpdateSkills={handleUpdateSkills}
              saving={saving}
            />
          </div>

          {/* Projects + Certifications side by side on large screens */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div ref={projectsRef} className="scroll-mt-6">
              <ProjectsSection
                projects={profile.projects || []}
                onAddProject={() => { setEditingProject(null); setProjectModalOpen(true); }}
                onEditProject={(proj) => { setEditingProject(proj); setProjectModalOpen(true); }}
                onDeleteProject={handleDeleteProject}
              />
            </div>

            <div ref={certsRef} className="scroll-mt-6">
              <CertificationsSection
                certifications={profile.certifications || []}
                onAddCert={() => { setEditingCert(null); setCertModalOpen(true); }}
                onEditCert={(cert) => { setEditingCert(cert); setCertModalOpen(true); }}
                onDeleteCert={handleDeleteCert}
              />
            </div>
          </div>

          {/* Resume */}
          <div ref={resumeRef} className="scroll-mt-6">
            <ResumeSection
              resume={profile.resume}
              onUpdateResume={() => setResumeModalOpen(true)}
              onDeleteResume={handleDeleteResume}
            />
          </div>
        </div>
      )}

      {/* Dev Tools Panel (collapsible) — for role testing */}
      <div className="mt-8 rounded-2xl border border-slate-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setDevToolsOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/60 hover:bg-slate-900/80 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Developer Tools — Role Authorization Tester</span>
          </div>
          {devToolsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {devToolsOpen && (
          <div className="bg-slate-900/40 border-t border-slate-800 p-5 space-y-5">
            <p className="text-xs text-slate-400">
              Test server-side role validation middleware (
              <code className="text-xs text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">authorizeRoles</code>
              ) with your current token (
              <span className="text-white font-semibold">{user?.role}</span>).
            </p>

            {/* Profile overview info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">User ID</div>
                <div className="text-xs font-mono text-slate-300 truncate">{user?._id}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">Authentication</div>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active (JWT)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                  <Key className="w-3 h-3" /> JWT Token
                </div>
                <div className="text-[10px] font-mono text-slate-500 truncate">
                  {token ? `${token.substring(0, 32)}...` : 'None'}
                </div>
              </div>
            </div>

            {/* Health + Role tests */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={testApiConnection}
                disabled={checkingHealth}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors disabled:opacity-50"
              >
                <Activity className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-pulse' : ''}`} />
                Test API Health
              </button>
            </div>

            {healthStatus && (
              <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${healthStatus.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                {healthStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {healthStatus.success ? `${healthStatus.data.message} — DB: ${healthStatus.data.database}` : healthStatus.message}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { endpoint: 'student-only', label: 'Student Route', roles: ['STUDENT'], color: 'indigo', Icon: UserCheck },
                { endpoint: 'officer-only', label: 'Officer Route', roles: ['PLACEMENT_OFFICER', 'ADMIN'], color: 'amber', Icon: ShieldCheck },
                { endpoint: 'admin-only', label: 'Admin Route', roles: ['ADMIN'], color: 'emerald', Icon: Lock },
              ].map(({ endpoint, label, roles, color, Icon }) => (
                <button
                  key={endpoint}
                  onClick={() => testRoleEndpoint(endpoint, label, roles)}
                  disabled={!!testingRoleEndpoint}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-colors disabled:opacity-50 bg-${color}-500/10 hover:bg-${color}-600 text-${color}-300 hover:text-white border-${color}-500/30`}
                >
                  {testingRoleEndpoint === label ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
                  Test {label}
                </button>
              ))}
            </div>

            {roleTestResult && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${roleTestResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                {roleTestResult.success ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-400" /> : <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />}
                <div>
                  <div className="font-semibold mb-0.5">
                    {roleTestResult.endpoint} • HTTP {roleTestResult.status} {roleTestResult.success ? '(Authorized)' : '(Forbidden)'}
                  </div>
                  <p className="text-xs opacity-90">{roleTestResult.message}</p>
                  <p className="text-[11px] opacity-75 mt-1">
                    Your Role: <span className="font-mono font-bold">{user?.role}</span> | Required: <span className="font-mono">{roleTestResult.requiredRoles.join(', ')}</span>
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
          <div className="flex items-center gap-2 self-start sm:self-center">
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
