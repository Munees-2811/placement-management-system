import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Companies from '../pages/Companies';
import ProtectedRoute from '../components/common/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
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
      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
