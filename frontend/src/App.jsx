import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
          <Navbar />
          <main className="flex-grow">
            <AppRoutes />
          </main>
          <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
            <p>Student Placement Management System • Full-Stack MERN</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
