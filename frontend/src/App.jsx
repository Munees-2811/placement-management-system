import React, { useState } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import Topbar from './components/common/Topbar';
import AppRoutes from './routes/AppRoutes';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[#3569A8] animate-spin" />
        <p className="text-xs font-medium text-[#667085]">Loading portal session...</p>
      </div>
    );
  }

  const isPublicRoute = location.pathname === '/login' || location.pathname === '/register';

  if (!isAuthenticated || isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#202B3C] flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <footer className="border-t border-[#E4E8EF] py-4 text-center text-xs text-[#667085] bg-white">
          <p>© {new Date().getFullYear()} University Placement &amp; Training Cell • All rights reserved</p>
        </footer>
      </div>
    );
  }

  // Generate dynamic topbar title and breadcrumb based on current path
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith('/companies')) {
      return {
        title: 'Company Directory',
        breadcrumb: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Companies' }],
      };
    }
    if (path.startsWith('/drives')) {
      return {
        title: 'Placement Drives',
        breadcrumb: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Drives' }],
      };
    }
    if (path.startsWith('/applications')) {
      return {
        title: user?.role === 'STUDENT' ? 'My Applications' : 'All Applications',
        breadcrumb: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Applications' }],
      };
    }
    if (path.startsWith('/officer-portal') || path.startsWith('/admin-portal')) {
      return {
        title: 'Officer Command Center',
        breadcrumb: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Officer Hub' }],
      };
    }
    if (path.startsWith('/admin/add-student')) {
      return {
        title: 'Add Student',
        breadcrumb: [
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Admin' },
          { label: 'Add Student' },
        ],
      };
    }
    return {
      title: 'Dashboard',
      breadcrumb: [{ label: 'Dashboard' }],
    };
  };

  const { title, breadcrumb } = getPageInfo();

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#202B3C]">
      {/* Fixed Sidebar (desktop 240px, mobile slideout) */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content Area: margin-left 240px on desktop */}
      <div className="md:ml-[240px] flex flex-col min-h-screen bg-[#F5F7FA]">
        <Topbar
          title={title}
          breadcrumb={breadcrumb}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <AppRoutes />
        </main>
        <footer className="border-t border-[#E4E8EF] py-4 px-6 text-xs text-[#667085] bg-white flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Student Placement Management System</span>
          <span>Enterprise University Portal</span>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
