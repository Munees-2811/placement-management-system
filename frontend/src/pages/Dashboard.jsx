import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Key, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck
} from 'lucide-react';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Role authorization test states
  const [roleTestResult, setRoleTestResult] = useState(null);
  const [testingRoleEndpoint, setTestingRoleEndpoint] = useState('');

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
      setRoleTestResult({
        endpoint: endpointName,
        requiredRoles,
        success: true,
        status: res.status,
        message: res.data.message || 'Access successfully authorized!',
      });
    } catch (err) {
      setRoleTestResult({
        endpoint: endpointName,
        requiredRoles,
        success: false,
        status: err.response?.status || 500,
        message: err.response?.data?.message || err.message || 'Access Denied / Forbidden',
      });
    } finally {
      setTestingRoleEndpoint('');
    }
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
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
            <p className="text-slate-400 text-sm">
              Placement Management System Portal • Authenticated via JWT
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={testApiConnection}
              disabled={checkingHealth}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
              <span>Test API</span>
            </button>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {healthStatus && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 border ${
              healthStatus.success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
            }`}
          >
            {healthStatus.success ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  Backend API Live: {healthStatus.data.message} ({healthStatus.data.status})
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Backend Connection: {healthStatus.message}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Profile Overview & Session Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            <span>Profile Overview</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Full Name</span>
              </div>
              <div className="text-base font-semibold text-white">{user?.name || 'N/A'}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>Email Address</span>
              </div>
              <div className="text-base font-semibold text-white truncate">{user?.email || 'N/A'}</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Assigned Role</span>
              </div>
              <div className="text-base font-semibold text-indigo-400">
                {user?.role?.replace('_', ' ') || 'STUDENT'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Account ID</span>
              </div>
              <div className="text-xs font-mono text-slate-300 truncate">{user?._id || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* System & Session Status */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <span>Session Status</span>
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
                <span>JWT Token Attached</span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 truncate">
                {token ? `${token.substring(0, 32)}...` : 'None'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Authorization Tester */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-white">Role-Based Authorization Testing</h2>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Test server-side role validation middleware (<code className="text-xs text-indigo-300 bg-slate-950 px-1.5 py-0.5 rounded">authorizeRoles</code>) with your current token (<span className="text-white font-semibold">{user?.role}</span>).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Student Endpoint */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Student Area</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">STUDENT</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Accessible exclusively to accounts with the <strong className="text-slate-200">STUDENT</strong> role.
              </p>
            </div>
            <button
              onClick={() => testRoleEndpoint('student-only', 'Student Route', ['STUDENT'])}
              disabled={!!testingRoleEndpoint}
              className="w-full py-2 px-3 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {testingRoleEndpoint === 'Student Route' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserCheck className="w-3.5 h-3.5" />
              )}
              <span>Test Access</span>
            </button>
          </div>

          {/* Placement Officer Endpoint */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Officer Area</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">OFFICER / ADMIN</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Accessible to <strong className="text-slate-200">PLACEMENT_OFFICER</strong> and <strong className="text-slate-200">ADMIN</strong> roles.
              </p>
            </div>
            <button
              onClick={() => testRoleEndpoint('officer-only', 'Officer Route', ['PLACEMENT_OFFICER', 'ADMIN'])}
              disabled={!!testingRoleEndpoint}
              className="w-full py-2 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-600 text-amber-300 hover:text-white border border-amber-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {testingRoleEndpoint === 'Officer Route' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>Test Access</span>
            </button>
          </div>

          {/* Admin Endpoint */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Admin Area</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">ADMIN ONLY</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Restricted strictly to users with the <strong className="text-slate-200">ADMIN</strong> role.
              </p>
            </div>
            <button
              onClick={() => testRoleEndpoint('admin-only', 'Admin Route', ['ADMIN'])}
              disabled={!!testingRoleEndpoint}
              className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {testingRoleEndpoint === 'Admin Route' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>Test Access</span>
            </button>
          </div>
        </div>

        {/* Test Result Display */}
        {roleTestResult && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${
              roleTestResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {roleTestResult.success ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
            )}
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
    </div>
  );
};

export default Dashboard;
