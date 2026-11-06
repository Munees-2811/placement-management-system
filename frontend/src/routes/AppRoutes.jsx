import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Companies from '../pages/Companies';
import PlacementDrives from '../pages/PlacementDrives';
import Applications from '../pages/Applications';
import AddStudent from '../pages/AddStudent';
import BulkImportStudents from '../pages/BulkImportStudents';
import ChangePassword from '../pages/ChangePassword';
import Notifications from '../pages/Notifications';
import ProtectedRoute from '../components/common/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/companies"
        element={
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        }
      />
      <Route
        path="/drives"
        element={
          <ProtectedRoute>
            <PlacementDrives />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer-portal"
        element={
          <ProtectedRoute allowedRoles={['PLACEMENT_OFFICER', 'ADMIN']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-portal"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/add-student"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AddStudent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bulk-import"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <BulkImportStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
