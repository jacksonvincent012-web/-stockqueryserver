import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { auth, onAuthStateChanged, signOut as firebaseSignOut } from '../lib/firebase';
import { RecoveryModal } from '../components/auth/RecoveryModal';
import { VerificationModal } from '../components/auth/VerificationModal';
import { OnboardingWizardModal } from '../components/auth/OnboardingWizardModal';
import { ActiveSessionsModal } from '../components/auth/ActiveSessionsModal';
import { SystemMessagesModal } from '../components/auth/SystemMessagesModal';
import LogoutConfirmationModal from '../components/auth/LogoutConfirmationModal';
import SessionExpiredModal from '../components/auth/SessionExpiredModal';

interface AuthContextType {
  token: string | null;
  role: string | null;
  user: any | null;
  login: (token: string, role: string, userData?: any) => void;
  logout: () => void;
  confirmLogout: (onConfirmCallback?: () => void) => void;
  isAuthenticated: boolean;
  updateProfile: (data: any) => Promise<void>;
  openRecoveryModal: (defaultId?: string) => void;
  openVerificationModal: (emailOrPhone: string, type?: 'email' | 'phone', onVerified?: () => void) => void;
  openOnboardingModal: () => void;
  openSessionsModal: () => void;
  openMessagesModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [user, setUser] = useState<any | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Modal states
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryId, setRecoveryId] = useState("");
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [verifyTarget, setVerifyTarget] = useState("");
  const [verifyType, setVerifyType] = useState<'email' | 'phone'>('email');
  const [verifyCallback, setVerifyCallback] = useState<(() => void) | undefined>(undefined);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [logoutConfirmCallback, setLogoutConfirmCallback] = useState<(() => void) | undefined>(undefined);
  const [sessionExpiredOpen, setSessionExpiredOpen] = useState(false);

  const login = (newToken: string, newRole: string, userData?: any) => {
    setToken(newToken);
    setRole(newRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    if (userData) {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (!userData.profileCompleted && !localStorage.getItem(`onboarded_${userData.username}`)) {
        setTimeout(() => setOnboardingOpen(true), 1000);
      }
    }
  };

  const logout = () => {
    try {
      if (token) {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ username: user?.username })
        }).catch(() => {});
      }
    } catch {}

    // Preserve non-sensitive user preferences such as theme, language, and Remember Me
    const themePref = localStorage.getItem('app_theme');
    const adminTheme = localStorage.getItem('admin_theme');
    const analystTheme = localStorage.getItem('analyst_theme');
    const rememberedUser = localStorage.getItem('remembered_user');
    const rememberMe = localStorage.getItem('remember_me');
    const rememberedId = localStorage.getItem('remembered_identifier');
    const analystCurrency = localStorage.getItem('analyst_currency');
    const analystChartColors = localStorage.getItem('analyst_chart_colors');
    const analystTimeframe = localStorage.getItem('analyst_timeframe');
    const analystSound = localStorage.getItem('analyst_sound');
    const analystRefresh = localStorage.getItem('analyst_refresh');
    const analystReportFormat = localStorage.getItem('analyst_report_format');
    const analystReportSummary = localStorage.getItem('analyst_report_summary');
    const sidebarCollapsed = localStorage.getItem('sidebar_collapsed');
    const analystSidebarCollapsed = localStorage.getItem('analyst_sidebar_collapsed');
    const navExchange = localStorage.getItem('nav_selected_exchange');
    const recentSearches = localStorage.getItem('global_recent_searches');
    const searchHistory = localStorage.getItem('sq_search_history_v1');

    setToken(null);
    setRole(null);
    setUser(null);
    
    // Clear authentication tokens and temporary session data
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore preserved non-sensitive preferences
    if (themePref) localStorage.setItem('app_theme', themePref);
    if (adminTheme) localStorage.setItem('admin_theme', adminTheme);
    if (analystTheme) localStorage.setItem('analyst_theme', analystTheme);
    if (rememberedUser) localStorage.setItem('remembered_user', rememberedUser);
    if (rememberMe) localStorage.setItem('remember_me', rememberMe);
    if (rememberedId) localStorage.setItem('remembered_identifier', rememberedId);
    if (analystCurrency) localStorage.setItem('analyst_currency', analystCurrency);
    if (analystChartColors) localStorage.setItem('analyst_chart_colors', analystChartColors);
    if (analystTimeframe) localStorage.setItem('analyst_timeframe', analystTimeframe);
    if (analystSound) localStorage.setItem('analyst_sound', analystSound);
    if (analystRefresh) localStorage.setItem('analyst_refresh', analystRefresh);
    if (analystReportFormat) localStorage.setItem('analyst_report_format', analystReportFormat);
    if (analystReportSummary) localStorage.setItem('analyst_report_summary', analystReportSummary);
    if (sidebarCollapsed) localStorage.setItem('sidebar_collapsed', sidebarCollapsed);
    if (analystSidebarCollapsed) localStorage.setItem('analyst_sidebar_collapsed', analystSidebarCollapsed);
    if (navExchange) localStorage.setItem('nav_selected_exchange', navExchange);
    if (recentSearches) localStorage.setItem('global_recent_searches', recentSearches);
    if (searchHistory) localStorage.setItem('sq_search_history_v1', searchHistory);

    try {
      firebaseSignOut(auth);
    } catch (e) {}

    // Disconnect live platform connections
    window.dispatchEvent(new Event('app:logout'));
  };

  const confirmLogout = (onConfirmCallback?: () => void) => {
    setLogoutConfirmCallback(() => onConfirmCallback);
    setLogoutConfirmOpen(true);
  };

  const updateProfile = async (updates: any) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
    try {
      if (token) {
        await fetch('/api/auth/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updates)
        });
      }
    } catch {}
  };

  // Synchronize Firebase auth changes with backend session
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !token) {
        try {
          const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: firebaseUser.email || firebaseUser.phoneNumber,
              provider: firebaseUser.phoneNumber ? 'phone' : 'google'
            })
          });
          const data = await res.json();
          if (res.ok && data.token) {
            login(data.token, data.role || 'viewer', data.user);
          }
        } catch (e) {}
      }
    });
    return () => unsubscribe();
  }, [token]);

  // Session timeout handling: monitor user inactivity
  useEffect(() => {
    if (!token) return;
    let timeout: any;
    const resetTimer = () => {
      clearTimeout(timeout);
      // Auto logout after 30 minutes of complete inactivity
      timeout = setTimeout(() => {
        logout();
        setSessionExpiredOpen(true);
      }, 30 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('scroll', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [token]);

  const openRecoveryModal = (defaultId: string = "") => {
    setRecoveryId(defaultId);
    setRecoveryOpen(true);
  };

  const openVerificationModal = (emailOrPhone: string, type: 'email' | 'phone' = 'email', onVerified?: () => void) => {
    setVerifyTarget(emailOrPhone);
    setVerifyType(type);
    setVerifyCallback(() => onVerified);
    setVerifyOpen(true);
  };

  const openOnboardingModal = () => setOnboardingOpen(true);
  const openSessionsModal = () => setSessionsOpen(true);
  const openMessagesModal = () => setMessagesOpen(true);

  return (
    <AuthContext.Provider value={{
      token,
      role,
      user,
      login,
      logout,
      confirmLogout,
      isAuthenticated: !!token,
      updateProfile,
      openRecoveryModal,
      openVerificationModal,
      openOnboardingModal,
      openSessionsModal,
      openMessagesModal
    }}>
      {children}
      
      <RecoveryModal
        isOpen={recoveryOpen}
        onClose={() => setRecoveryOpen(false)}
        defaultEmailOrPhone={recoveryId}
      />

      <VerificationModal
        isOpen={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        emailOrPhone={verifyTarget}
        type={verifyType}
        onVerified={verifyCallback}
      />

      <OnboardingWizardModal
        isOpen={onboardingOpen}
        onClose={() => {
          setOnboardingOpen(false);
          if (user) localStorage.setItem(`onboarded_${user.username}`, 'true');
        }}
        initialName={user?.firstName || user?.username}
        onComplete={(data) => updateProfile(data)}
      />

      <ActiveSessionsModal
        isOpen={sessionsOpen}
        onClose={() => setSessionsOpen(false)}
        theme={role === 'admin' || role === 'analyst' ? 'dark' : 'light'}
      />

      <SystemMessagesModal
        isOpen={messagesOpen}
        onClose={() => setMessagesOpen(false)}
        theme={role === 'admin' || role === 'analyst' ? 'dark' : 'light'}
      />

      <LogoutConfirmationModal
        isOpen={logoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        onConfirmLogout={() => {
          logout();
          toast.success('You have been signed out successfully.');
          if (logoutConfirmCallback) {
            logoutConfirmCallback();
          } else {
            window.dispatchEvent(new Event('app:navigate-login'));
          }
        }}
        theme={role === 'admin' || role === 'analyst' ? 'dark' : 'light'}
      />

      <SessionExpiredModal
        isOpen={sessionExpiredOpen}
        onReLogin={() => {
          setSessionExpiredOpen(false);
          window.location.href = '/';
        }}
        theme={role === 'admin' || role === 'analyst' ? 'dark' : 'light'}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
