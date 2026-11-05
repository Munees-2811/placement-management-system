import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#3569A8] animate-spin" />
        <p className="text-xs font-medium text-[#667085]">Verifying university credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowedRoles = allowedRoles.map((r) => r.toUpperCase());
    const userRole = user?.role ? user.role.toUpperCase() : '';

    if (!normalizedAllowedRoles.includes(userRole)) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-[#E4E8EF] rounded-2xl p-8 text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] text-[#D14343] border border-[#FECACA] flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-[#202B3C] mb-2">Access Restricted</h2>
            <p className="text-sm text-[#667085] mb-3">
              Your account role (<span className="text-[#19365C] font-semibold">{user?.role?.replace('_', ' ')}</span>) does not have authorization to view this resource.
            </p>
            <p className="text-xs text-[#94A3B8] mb-6">
              Authorized roles: {allowedRoles.map((r) => r.replace('_', ' ')).join(', ')}
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#19365C] hover:bg-[#132B4A] text-white text-sm font-semibold transition-colors shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Dashboard</span>
            </Link>
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
