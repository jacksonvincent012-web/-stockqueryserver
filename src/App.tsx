import React from 'react';
import { Toaster } from 'sonner';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import EmailVerification from './pages/EmailVerification';
import AnalystSignUp from './pages/AnalystSignUp';
import AdminRequestAccess from './pages/AdminRequestAccess';
import AdminLogin from './pages/AdminLogin';
import AnalystLogin from './pages/AnalystLogin';
import SystemDashboard from './pages/SystemDashboard';
import UserDashboard from './pages/UserDashboard';
import AnalystDashboard from './pages/analyst/AnalystDashboard';

const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode, allowedRole?: string }) => {
  const { isAuthenticated, role } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/" replace />;
  
  if (allowedRole && role !== allowedRole) {
    const fallback = role === 'admin' ? "/admin/dashboard" : role === 'analyst' ? "/analyst/dashboard" : "/dashboard";
    return <Navigate to={fallback} replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleNavLogin = () => {
      navigate('/', { replace: true });
    };
    window.addEventListener('app:navigate-login', handleNavLogin);
    return () => window.removeEventListener('app:navigate-login', handleNavLogin);
  }, [navigate]);

  const defaultDash = role === 'admin' ? "/admin/dashboard" : role === 'analyst' ? "/analyst/dashboard" : "/dashboard";

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <Login />} />
      <Route path="/signup" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <SignUp />} />
      <Route path="/verify-email" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <EmailVerification />} />
      <Route path="/analyst-signup" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <AnalystSignUp />} />
      <Route path="/admin-request-access" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <AdminRequestAccess />} />
      <Route path="/admin-login" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <AdminLogin />} />
      <Route path="/analyst-login" element={isAuthenticated ? <Navigate to={defaultDash} replace /> : <AnalystLogin />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRole="viewer">
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedRole="admin">
            <SystemDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analyst/dashboard" 
        element={
          <ProtectedRoute allowedRole="analyst">
            <AnalystDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="bottom-right" closeButton={true} richColors={true} expand={false} duration={4500} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

