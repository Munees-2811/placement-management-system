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
  RefreshCw 
} from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden mb-8">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Welcome back, {user?.name || 'User'}!
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {user?.role}
              </span>
            </div>
            <p className="text-slate-400 text-sm">
              Placement Management System Portal • Authenticated via JWT
            </p>
          </div>

          <button
            onClick={testApiConnection}
            disabled={checkingHealth}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors shadow-sm self-start sm:self-center disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />
            <span>Test API Health</span>
          </button>
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
                <span>Backend Connection Error: {healthStatus.message}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Profile Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <span>Portal Role</span>
              </div>
              <div className="text-base font-semibold text-indigo-400 capitalize">{user?.role || 'student'}</div>
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
    </div>
  );
};

export default Dashboard;
