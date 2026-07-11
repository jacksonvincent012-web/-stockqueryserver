import React, { useState, useEffect, useMemo } from 'react';
import { 
  Settings, Shield, Key, HardDrive, Clock, Sliders, CheckCircle2, Save, 
  RotateCcw, AlertTriangle, Lock, Globe, Bell, Palette, Activity, Search,
  Check, ChevronRight, UserCheck, RefreshCw, Layers, Database, Mail, Monitor,
  Moon, Sun, HelpCircle, FileText, Download, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Reusable animated toggle switch
function ToggleSwitch({ checked, onChange, label, description, disabled = false }: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div 
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
        checked 
          ? 'bg-blue-50/40 border-blue-200/80 hover:bg-blue-50/70' 
          : 'bg-white border-gray-200 hover:bg-gray-50/80'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-[#111827]">{label}</div>
        {description && <div className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{description}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) onChange(!checked);
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 ${
          checked ? 'bg-[#2563EB]' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// Reusable card wrapper
function SettingsCard({ title, icon: Icon, description, children, className = '' }: {
  title?: string;
  icon?: React.ElementType;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-sm hover:shadow transition-shadow duration-200 space-y-6 ${className}`}>
      {(title || description) && (
        <div className="border-b border-[#E5E7EB] pb-4">
          {title && (
            <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2.5">
              {Icon && <Icon className="w-5 h-5 text-[#2563EB]" />}
              <span>{title}</span>
            </h2>
          )}
          {description && <p className="text-xs sm:text-sm text-[#6B7280] mt-1 leading-relaxed">{description}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

export default function SettingsView() {
  // --- STATE DECLARATIONS ---
  // Security Settings
  const [sessionTimeout, setSessionTimeout] = useState('30 mins');
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState('10.0.0.0/8, 192.168.1.0/24');
  const [auditLogging, setAuditLogging] = useState(true);
  const [passwordExpiry, setPasswordExpiry] = useState('90 days');

  // Access (formerly API Configuration)
  const [apiRateLimit, setApiRateLimit] = useState('5000 req/min');
  const [webhookUrl, setWebhookUrl] = useState('https://events.platform.internal/hooks/market');
  const [apiVersion, setApiVersion] = useState('v2.4 (Stable Enterprise)');
  const [publicApiAccess, setPublicApiAccess] = useState(false);
  const [corsAllowedOrigins, setCorsAllowedOrigins] = useState('https://app.platform.io, https://trading.enterprise.com');

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [systemOutageNotify, setSystemOutageNotify] = useState(true);
  const [maintenanceBroadcast, setMaintenanceBroadcast] = useState(true);
  const [digestFrequency, setDigestFrequency] = useState('Daily Morning Summary');
  const [alertRecipientEmail, setAlertRecipientEmail] = useState('admin-ops@platform.io');

  // Platform (formerly System Mode)
  const [systemMode, setSystemMode] = useState<'Standard Production' | 'Diagnostic Debug' | 'Read-Only Maintenance'>('Standard Production');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('5 seconds');
  const [debugTelemetry, setDebugTelemetry] = useState(false);

  // Storage (formerly Data Limits & Retention)
  const [maxResultsPerQuery, setMaxResultsPerQuery] = useState('5000 records');
  const [ingestionBufferLimit, setIngestionBufferLimit] = useState('10000 messages');
  const [maxConcurrentQueries, setMaxConcurrentQueries] = useState('50 per user');
  const [tickRetentionDays, setTickRetentionDays] = useState('90 days');
  const [auditRetentionYears, setAuditRetentionYears] = useState('7 years');
  const [autoPurgeEnabled, setAutoPurgeEnabled] = useState(true);

  // Appearance
  const [themePreset, setThemePreset] = useState<'Enterprise Light' | 'System Default' | 'Dark Slate'>('Enterprise Light');
  const [compactDensity, setCompactDensity] = useState(false);
  const [highContrastText, setHighContrastText] = useState(false);
  const [sidebarLayout, setSidebarLayout] = useState('Expanded Navigation');

  // Activity Log filter
  const [logFilter, setLogFilter] = useState('All Events');

  // UI State
  const [activeTab, setActiveTab] = useState<'security' | 'access' | 'notifications' | 'platform' | 'storage' | 'appearance' | 'activity'>('security');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState('Today at 03:45 AM');

  // Track initial state to detect unsaved changes
  const [savedState, setSavedState] = useState({
    sessionTimeout: '30 mins',
    enforce2FA: true,
    ipWhitelist: '10.0.0.0/8, 192.168.1.0/24',
    auditLogging: true,
    passwordExpiry: '90 days',
    apiRateLimit: '5000 req/min',
    webhookUrl: 'https://events.platform.internal/hooks/market',
    apiVersion: 'v2.4 (Stable Enterprise)',
    publicApiAccess: false,
    corsAllowedOrigins: 'https://app.platform.io, https://trading.enterprise.com',
    emailAlerts: true,
    systemOutageNotify: true,
    maintenanceBroadcast: true,
    digestFrequency: 'Daily Morning Summary',
    alertRecipientEmail: 'admin-ops@platform.io',
    systemMode: 'Standard Production' as 'Standard Production' | 'Diagnostic Debug' | 'Read-Only Maintenance',
    autoRefreshInterval: '5 seconds',
    debugTelemetry: false,
    maxResultsPerQuery: '5000 records',
    ingestionBufferLimit: '10000 messages',
    maxConcurrentQueries: '50 per user',
    tickRetentionDays: '90 days',
    auditRetentionYears: '7 years',
    autoPurgeEnabled: true,
    themePreset: 'Enterprise Light' as 'Enterprise Light' | 'System Default' | 'Dark Slate',
    compactDensity: false,
    highContrastText: false,
    sidebarLayout: 'Expanded Navigation'
  });

  // Calculate if any setting differs from savedState
  const hasUnsavedChanges = useMemo(() => {
    return (
      sessionTimeout !== savedState.sessionTimeout ||
      enforce2FA !== savedState.enforce2FA ||
      ipWhitelist !== savedState.ipWhitelist ||
      auditLogging !== savedState.auditLogging ||
      passwordExpiry !== savedState.passwordExpiry ||
      apiRateLimit !== savedState.apiRateLimit ||
      webhookUrl !== savedState.webhookUrl ||
      apiVersion !== savedState.apiVersion ||
      publicApiAccess !== savedState.publicApiAccess ||
      corsAllowedOrigins !== savedState.corsAllowedOrigins ||
      emailAlerts !== savedState.emailAlerts ||
      systemOutageNotify !== savedState.systemOutageNotify ||
      maintenanceBroadcast !== savedState.maintenanceBroadcast ||
      digestFrequency !== savedState.digestFrequency ||
      alertRecipientEmail !== savedState.alertRecipientEmail ||
      systemMode !== savedState.systemMode ||
      autoRefreshInterval !== savedState.autoRefreshInterval ||
      debugTelemetry !== savedState.debugTelemetry ||
      maxResultsPerQuery !== savedState.maxResultsPerQuery ||
      ingestionBufferLimit !== savedState.ingestionBufferLimit ||
      maxConcurrentQueries !== savedState.maxConcurrentQueries ||
      tickRetentionDays !== savedState.tickRetentionDays ||
      auditRetentionYears !== savedState.auditRetentionYears ||
      autoPurgeEnabled !== savedState.autoPurgeEnabled ||
      themePreset !== savedState.themePreset ||
      compactDensity !== savedState.compactDensity ||
      highContrastText !== savedState.highContrastText ||
      sidebarLayout !== savedState.sidebarLayout
    );
  }, [
    sessionTimeout, enforce2FA, ipWhitelist, auditLogging, passwordExpiry,
    apiRateLimit, webhookUrl, apiVersion, publicApiAccess, corsAllowedOrigins,
    emailAlerts, systemOutageNotify, maintenanceBroadcast, digestFrequency, alertRecipientEmail,
    systemMode, autoRefreshInterval, debugTelemetry, maxResultsPerQuery, ingestionBufferLimit,
    maxConcurrentQueries, tickRetentionDays, auditRetentionYears, autoPurgeEnabled,
    themePreset, compactDensity, highContrastText, sidebarLayout, savedState
  ]);

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hasUnsavedChanges) return;
    
    setSaving(true);
    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      setSavedState({
        sessionTimeout, enforce2FA, ipWhitelist, auditLogging, passwordExpiry,
        apiRateLimit, webhookUrl, apiVersion, publicApiAccess, corsAllowedOrigins,
        emailAlerts, systemOutageNotify, maintenanceBroadcast, digestFrequency, alertRecipientEmail,
        systemMode, autoRefreshInterval, debugTelemetry, maxResultsPerQuery, ingestionBufferLimit,
        maxConcurrentQueries, tickRetentionDays, auditRetentionYears, autoPurgeEnabled,
        themePreset, compactDensity, highContrastText, sidebarLayout
      });
      setLastSavedTime(`Today at ${timeStr}`);
      setSaving(false);
      setToast('Settings successfully updated and deployed across all cluster nodes.');
      setTimeout(() => setToast(null), 3500);
    }, 600);
  };

  const handleReset = () => {
    setSessionTimeout('30 mins');
    setEnforce2FA(true);
    setIpWhitelist('10.0.0.0/8, 192.168.1.0/24');
    setAuditLogging(true);
    setPasswordExpiry('90 days');
    setApiRateLimit('5000 req/min');
    setWebhookUrl('https://events.platform.internal/hooks/market');
    setApiVersion('v2.4 (Stable Enterprise)');
    setPublicApiAccess(false);
    setCorsAllowedOrigins('https://app.platform.io, https://trading.enterprise.com');
    setEmailAlerts(true);
    setSystemOutageNotify(true);
    setMaintenanceBroadcast(true);
    setDigestFrequency('Daily Morning Summary');
    setAlertRecipientEmail('admin-ops@platform.io');
    setSystemMode('Standard Production');
    setAutoRefreshInterval('5 seconds');
    setDebugTelemetry(false);
    setMaxResultsPerQuery('5000 records');
    setIngestionBufferLimit('10000 messages');
    setMaxConcurrentQueries('50 per user');
    setTickRetentionDays('90 days');
    setAuditRetentionYears('7 years');
    setAutoPurgeEnabled(true);
    setThemePreset('Enterprise Light');
    setCompactDensity(false);
    setHighContrastText(false);
    setSidebarLayout('Expanded Navigation');

    setToast('All configurations reset to recommended enterprise defaults.');
    setTimeout(() => setToast(null), 3500);
  };

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield, desc: 'Authentication & sessions' },
    { id: 'access', label: 'Access', icon: Key, desc: 'API keys & endpoints' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alert rules & emails' },
    { id: 'platform', label: 'Platform', icon: Monitor, desc: 'Operational mode & refresh' },
    { id: 'storage', label: 'Storage', icon: Database, desc: 'Limits & retention policy' },
    { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Theme & layout density' },
    { id: 'activity', label: 'Activity Log', icon: Activity, desc: 'System audit trails' },
  ] as const;

  // Filter logic for search bar
  const matchingTabs = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return tabs.filter(t => 
      t.label.toLowerCase().includes(q) || 
      t.desc.toLowerCase().includes(q)
    );
  }, [searchQuery, tabs]);

  // Mock activity logs for the Activity Log tab
  const mockActivityLogs = [
    { id: 'LOG-8821', action: 'Modified Session Timeout', user: 'Christian Alexander (Admin)', ip: '10.142.0.8', timestamp: '12 mins ago', status: 'Success' },
    { id: 'LOG-8820', action: 'Rotated Webhook Signing Secret', user: 'System Automation', ip: 'internal-cluster-01', timestamp: '1 hr ago', status: 'Success' },
    { id: 'LOG-8819', action: 'Updated API Rate Limit to 5000 req/min', user: 'Christian Alexander (Admin)', ip: '10.142.0.8', timestamp: '3 hrs ago', status: 'Success' },
    { id: 'LOG-8818', action: 'Failed Admin Authentication Attempt', user: 'Unknown (bad-token)', ip: '198.51.100.42', timestamp: '5 hrs ago', status: 'Blocked' },
    { id: 'LOG-8817', action: 'Initiated Nightly Blob Storage Archival', user: 'Scheduler Daemon', ip: 'localhost', timestamp: 'Yesterday, 02:00 AM', status: 'Success' },
    { id: 'LOG-8816', action: 'Switched Platform Mode to Standard Production', user: 'Christian Alexander (Admin)', ip: '10.142.0.8', timestamp: '2 days ago', status: 'Success' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] font-sans -m-6 p-6 sm:p-8 space-y-8 rounded-3xl border border-[#E5E7EB]">
      {/* Bottom Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#FFFFFF] border border-[#22C55E]/40 text-[#111827] flex items-center gap-3 shadow-xl max-w-md"
          >
            <div className="w-8 h-8 rounded-full bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-xs flex-1">
              <div className="font-bold text-[#111827]">Configuration Saved</div>
              <div className="text-[#6B7280] mt-0.5">{toast}</div>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 text-[#6B7280] hover:text-[#111827] rounded-lg transition-colors cursor-pointer"
              title="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern White Enterprise Header */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
            <span>ENTERPRISE ADMINISTRATION CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Platform Settings
          </h1>
          <p className="text-sm text-[#6B7280] max-w-2xl">
            Manage security policies, access controls, infrastructure performance, and organizational preferences across all active environments.
          </p>
        </div>

        {/* Search Bar & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#6B7280] hover:text-[#111827]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              type="button"
              title="Reset all settings to recommended enterprise defaults"
              className="px-4 py-2.5 rounded-xl bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#6B7280] hover:text-[#111827] border border-[#E5E7EB] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            
            <button
              onClick={() => handleSave()}
              disabled={!hasUnsavedChanges || saving}
              type="button"
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                hasUnsavedChanges && !saving
                  ? 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-blue-500/20 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-60'
              }`}
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Small Information Summary Cards beneath page title */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Last Saved */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Last Saved</div>
            <div className="text-sm font-bold text-[#111827] mt-0.5">{lastSavedTime}</div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Automated cloud backup sync</div>
          </div>
        </div>

        {/* Card 2: Current Platform Mode */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
            systemMode === 'Standard Production'
              ? 'bg-green-50 border-green-100 text-[#22C55E]'
              : systemMode === 'Diagnostic Debug'
              ? 'bg-amber-50 border-amber-100 text-[#F59E0B]'
              : 'bg-blue-50 border-blue-100 text-[#2563EB]'
          }`}>
            <Monitor className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Platform Mode</div>
            <div className="text-sm font-bold text-[#111827] mt-0.5 truncate">{systemMode}</div>
            <div className="text-[11px] text-[#22C55E] font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
              <span>All nodes responsive</span>
            </div>
          </div>
        </div>

        {/* Card 3: Security Status */}
        <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#22C55E] shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Security Status</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-bold text-[#111827]">Protected</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                2FA ON
              </span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-0.5">Zero security breaches detected</div>
          </div>
        </div>
      </div>

      {/* Subtle Unsaved Changes Indicator Banner */}
      <AnimatePresence>
        {hasUnsavedChanges && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-amber-50 border border-[#F59E0B]/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/15 flex items-center justify-center text-[#F59E0B] shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">You have unsaved configuration changes</div>
                  <div className="text-xs text-amber-700 mt-0.5">Modifications will not take effect on live production instances until you click Save Changes.</div>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={handleReset}
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-amber-800 border border-amber-300/60 text-xs font-semibold transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={() => handleSave()}
                  disabled={saving}
                  type="button"
                  className="px-4 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Now</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Filter Results Notice */}
      {searchQuery && matchingTabs && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E5E7EB] p-4 shadow-sm">
          <div className="text-xs font-bold text-[#6B7280] uppercase mb-2">
            Search matching categories ({matchingTabs.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {matchingTabs.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id as any);
                  setSearchQuery('');
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-100 transition-all"
              >
                <t.icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                <span className="text-blue-400 font-normal">({t.desc})</span>
              </button>
            ))}
            {matchingTabs.length === 0 && (
              <span className="text-xs text-[#6B7280]">No matching configuration sections found. Try searching for "timeout", "api", "theme", or "logs".</span>
            )}
          </div>
        </div>
      )}

      {/* Section Organization Tabs (7 Simple Titles) */}
      <div className="bg-[#FFFFFF] p-2 rounded-2xl border border-[#E5E7EB] shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                type="button"
                className={`px-3.5 py-3 rounded-xl font-semibold text-xs transition-all flex flex-col sm:flex-row items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F8FAFC]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#6B7280]'}`} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- TAB CONTENT PANELS --- */}
      <div className="space-y-6">
        {/* 1. SECURITY SECTION */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SettingsCard
              title="Session & Authentication Rules"
              icon={Shield}
              description="Configure automatic timeout windows and administrative identity requirements."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Session Inactivity Timeout</label>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="15 mins">15 minutes (Strict Regulatory Security)</option>
                    <option value="30 mins">30 minutes (Recommended Enterprise Standard)</option>
                    <option value="1 hour">1 hour (Extended Operations Window)</option>
                    <option value="4 hours">4 hours (Operations Center Desk Mode)</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">Automatically terminates administrative sessions after prolonged inactivity.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Password Expiry Schedule</label>
                  <select
                    value={passwordExpiry}
                    onChange={(e) => setPasswordExpiry(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="30 days">Every 30 days (High Compliance)</option>
                    <option value="90 days">Every 90 days (Standard Enterprise)</option>
                    <option value="180 days">Every 180 days (Moderate)</option>
                    <option value="Never">Never expire (Requires Hardware Token 2FA)</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">Mandatory rotation schedule for root and sub-administrator credentials.</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Administrative IP Whitelist</label>
                <input
                  type="text"
                  value={ipWhitelist}
                  onChange={(e) => setIpWhitelist(e.target.value)}
                  placeholder="e.g. 10.0.0.0/8, 192.168.1.0/24"
                  className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                />
                <p className="text-xs text-[#6B7280]">Comma-separated CIDR networks allowed to access this enterprise administration terminal.</p>
              </div>
            </SettingsCard>

            <SettingsCard
              title="Security Policies & Audit Enforcement"
              icon={Lock}
              description="Toggle multi-factor authentication mandates and deep system logging."
            >
              <div className="space-y-3">
                <ToggleSwitch
                  checked={enforce2FA}
                  onChange={setEnforce2FA}
                  label="Enforce Two-Factor Authentication (2FA)"
                  description="Require hardware security keys (FIDO2) or authenticator apps for all administrative logins across the organization."
                />
                <ToggleSwitch
                  checked={auditLogging}
                  onChange={setAuditLogging}
                  label="Strict Administrative Audit Logging"
                  description="Record tamper-proof timestamped logs for every command, query, configuration change, and user permission modification."
                />
              </div>
            </SettingsCard>
          </div>
        )}

        {/* 2. ACCESS SECTION */}
        {activeTab === 'access' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SettingsCard
              title="API Key & Endpoint Management"
              icon={Key}
              description="Manage external data integrations, request throttling thresholds, and API version schemas."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Client API Rate Limit</label>
                  <select
                    value={apiRateLimit}
                    onChange={(e) => setApiRateLimit(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="1000 req/min">1,000 requests / minute (Strict Throttling)</option>
                    <option value="5000 req/min">5,000 requests / minute (Standard Enterprise)</option>
                    <option value="25000 req/min">25,000 requests / minute (Institutional High-Throughput)</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">Maximum API queries allowed per client token before HTTP 429 rate limit responses are issued.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Target API Versioning</label>
                  <select
                    value={apiVersion}
                    onChange={(e) => setApiVersion(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="v2.4 (Stable Enterprise)">v2.4 (Stable Enterprise - Current)</option>
                    <option value="v3.0 (Next-Gen Preview)">v3.0 (Next-Gen Preview - Beta)</option>
                    <option value="v1.8 (Legacy Compatibility)">v1.8 (Legacy Compatibility - Deprecating)</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">Default API schema version served to connecting analysts and algorithmic client applications.</p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Alert Webhook Dispatch URL</label>
                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                />
                <p className="text-xs text-[#6B7280]">Secure HTTPS endpoint destination where real-time market anomalies and infrastructure events are posted.</p>
              </div>
            </SettingsCard>

            <SettingsCard
              title="Cross-Origin & Public Access Controls"
              icon={Globe}
              description="Configure CORS policies and external third-party API exposure."
            >
              <div className="space-y-4">
                <ToggleSwitch
                  checked={publicApiAccess}
                  onChange={setPublicApiAccess}
                  label="Enable Public Read-Only API Sandbox"
                  description="Allow non-authenticated external developers to query delayed market feed data (15-minute delay) without API tokens."
                />

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">CORS Allowed Origins</label>
                  <input
                    type="text"
                    value={corsAllowedOrigins}
                    onChange={(e) => setCorsAllowedOrigins(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                  </input>
                  <p className="text-xs text-[#6B7280]">Comma-separated domains allowed to make cross-origin requests to API gateways.</p>
                </div>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* 3. NOTIFICATIONS SECTION */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SettingsCard
              title="System Alerts & Email Rules"
              icon={Bell}
              description="Configure automated notifications for infrastructure incidents and maintenance broadcasts."
            >
              <div className="space-y-3">
                <ToggleSwitch
                  checked={emailAlerts}
                  onChange={setEmailAlerts}
                  label="High-Severity Incident Email Alerts"
                  description="Automatically email on-duty administrators when system latency exceeds SLAs or node errors occur."
                />
                <ToggleSwitch
                  checked={systemOutageNotify}
                  onChange={setSystemOutageNotify}
                  label="Instant Outage & Failover Broadcasts"
                  description="Send SMS and Slack webhooks immediately when primary database failover is initiated."
                />
                <ToggleSwitch
                  checked={maintenanceBroadcast}
                  onChange={setMaintenanceBroadcast}
                  label="Scheduled Maintenance User Banners"
                  description="Display proactive in-app notification banners to all logged-in users 48 hours prior to scheduled window."
                />
              </div>
            </SettingsCard>

            <SettingsCard
              title="Digest & Recipient Routing"
              icon={Mail}
              description="Select summary frequency and target email distribution groups."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Executive Digest Frequency</label>
                  <select
                    value={digestFrequency}
                    onChange={(e) => setDigestFrequency(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="Real-time Immediate">Real-time Immediate Dispatch</option>
                    <option value="Daily Morning Summary">Daily Morning Summary (08:00 UTC)</option>
                    <option value="Weekly Operations Report">Weekly Operations Report (Mondays)</option>
                    <option value="Disabled">Disabled (No recurring summaries)</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">Frequency of consolidated system health and user activity digests sent to leadership.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Primary Operations Email</label>
                  <input
                    type="email"
                    value={alertRecipientEmail}
                    onChange={(e) => setAlertRecipientEmail(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  />
                  <p className="text-xs text-[#6B7280]">Central group inbox receiving infrastructure alerts and compliance reports.</p>
                </div>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* 4. PLATFORM SECTION */}
        {activeTab === 'platform' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SettingsCard
              title="System Operational Mode"
              icon={Monitor}
              description="Select the global operational posture of the trading platform cluster."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['Standard Production', 'Diagnostic Debug', 'Read-Only Maintenance'] as const).map((mode) => {
                  const isSelected = systemMode === mode;
                  return (
                    <div
                      key={mode}
                      onClick={() => setSystemMode(mode)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? 'bg-blue-50/50 border-[#2563EB] shadow-md ring-2 ring-[#2563EB]/20'
                          : 'bg-[#FFFFFF] border-[#E5E7EB] hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-[#111827] text-base">{mode}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />}
                        </div>
                        <p className="text-xs text-[#6B7280] leading-relaxed">
                          {mode === 'Standard Production' && 'Full ingestion throughput, standard logging density, and optimal search speed for millions of active end users.'}
                          {mode === 'Diagnostic Debug' && 'Elevated telemetry output and verbose error tracking. Slightly increased CPU overhead to capture deep system traces.'}
                          {mode === 'Read-Only Maintenance' && 'Blocks all database writes and setting changes. Users can query stock prices, but background jobs are suspended.'}
                        </p>
                      </div>
                      <div className="text-xs pt-3 border-t border-[#E5E7EB] text-[#6B7280] flex items-center justify-between">
                        <span>Cluster Status:</span>
                        <strong className={isSelected ? 'text-[#2563EB] font-bold' : 'text-[#6B7280]'}>{isSelected ? 'ACTIVE POSTURE' : 'STANDBY'}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SettingsCard>

            <SettingsCard
              title="Telemetry & Refresh Parameters"
              icon={Sliders}
              description="Adjust real-time dashboard polling rates and deep system debugging tools."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Dashboard Polling Interval</label>
                  <select
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="1 second">1 second (Ultra-low latency live trading)</option>
                    <option value="5 seconds">5 seconds (Recommended Enterprise Default)</option>
                    <option value="15 seconds">15 seconds (Balanced network load)</option>
                    <option value="30 seconds">30 seconds (Bandwidth conservation mode)</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">How often admin metrics and feed monitors request updated snapshots from servers.</p>
                </div>

                <div className="pt-4">
                  <ToggleSwitch
                    checked={debugTelemetry}
                    onChange={setDebugTelemetry}
                    label="Enable Deep Kernel Telemetry"
                    description="Capture microsecond-level memory allocation traces and packet headers for diagnostic analysis."
                  />
                </div>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* 5. STORAGE SECTION */}
        {activeTab === 'storage' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SettingsCard
              title="Query & Memory Buffer Limits"
              icon={HardDrive}
              description="Configure query ceilings and ingestion memory buffer constraints to guarantee platform stability."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Max Results Per Query</label>
                  <select
                    value={maxResultsPerQuery}
                    onChange={(e) => setMaxResultsPerQuery(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="1000 records">1,000 records</option>
                    <option value="5000 records">5,000 records</option>
                    <option value="25000 records">25,000 records</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">Prevents memory exhaustion from oversized data exports.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Ingestion Buffer Ceiling</label>
                  <select
                    value={ingestionBufferLimit}
                    onChange={(e) => setIngestionBufferLimit(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="5000 messages">5,000 messages</option>
                    <option value="10000 messages">10,000 messages</option>
                    <option value="50000 messages">50,000 messages</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">Maximum queue depth before backpressure warnings trigger.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Concurrent Queries / User</label>
                  <select
                    value={maxConcurrentQueries}
                    onChange={(e) => setMaxConcurrentQueries(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="20 per user">20 queries simultaneously</option>
                    <option value="50 per user">50 queries simultaneously</option>
                    <option value="100 per user">100 queries simultaneously</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">Limits simultaneous database connections per account.</p>
                </div>
              </div>
            </SettingsCard>

            <SettingsCard
              title="Data Retention & Archival Policy"
              icon={Clock}
              description="Control automated archiving schedules and storage retention rules for historical market feeds."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Tick Data Storage Window</label>
                  <select
                    value={tickRetentionDays}
                    onChange={(e) => setTickRetentionDays(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="30 days">30 Days (Fast Hot Cache)</option>
                    <option value="90 days">90 Days (Standard Operations)</option>
                    <option value="365 days">365 Days (Full Yearly Analytics)</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">Duration high-frequency tick data remains in primary SSD databases before moving to cold archival storage.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Audit Trail Retention</label>
                  <select
                    value={auditRetentionYears}
                    onChange={(e) => setAuditRetentionYears(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                  >
                    <option value="1 year">1 Year (Basic Compliance)</option>
                    <option value="7 years">7 Years (Strict Regulatory Standard)</option>
                    <option value="Indefinite">Indefinite (Permanent Archival)</option>
                  </select>
                  <p className="text-xs text-[#6B7280]">Required retention period for administrator actions, login histories, and system error events.</p>
                </div>
              </div>

              <div className="pt-2">
                <ToggleSwitch
                  checked={autoPurgeEnabled}
                  onChange={setAutoPurgeEnabled}
                  label="Enable Automated Nightly Archival & Purge"
                  description="Automatically compress and move expired tick records to cold blob storage every night at 02:00 UTC without manual intervention."
                />
              </div>
            </SettingsCard>
          </div>
        )}

        {/* 6. APPEARANCE SECTION */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SettingsCard
              title="Interface Theme Preset"
              icon={Palette}
              description="Customize color themes and contrast modes for administrative workspaces."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(['Enterprise Light', 'System Default', 'Dark Slate'] as const).map((themeName) => {
                  const isSelected = themePreset === themeName;
                  return (
                    <div
                      key={themeName}
                      onClick={() => setThemePreset(themeName)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                        isSelected
                          ? 'bg-blue-50/50 border-[#2563EB] shadow-md ring-2 ring-[#2563EB]/20'
                          : 'bg-[#FFFFFF] border-[#E5E7EB] hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          {themeName === 'Enterprise Light' && <Sun className="w-4 h-4 text-amber-500" />}
                          {themeName === 'Dark Slate' && <Moon className="w-4 h-4 text-purple-500" />}
                          {themeName === 'System Default' && <Monitor className="w-4 h-4 text-blue-500" />}
                          <span className="font-bold text-[#111827] text-sm">{themeName}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />}
                      </div>
                      <p className="text-xs text-[#6B7280]">
                        {themeName === 'Enterprise Light' && 'Clean white backgrounds (#FFFFFF) with high-contrast charcoal text for optimal daytime readability.'}
                        {themeName === 'System Default' && 'Automatically adapt interface colors based on local operating system preferences.'}
                        {themeName === 'Dark Slate' && 'Subdued dark charcoal palette designed for low-light environments and overnight operations.'}
                      </p>
                      <div className="text-xs pt-3 border-t border-[#E5E7EB] text-[#6B7280] flex items-center justify-between">
                        <span>Status:</span>
                        <strong className={isSelected ? 'text-[#2563EB] font-bold' : 'text-[#6B7280]'}>{isSelected ? 'SELECTED' : 'AVAILABLE'}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SettingsCard>

            <SettingsCard
              title="Layout & Display Density"
              icon={Sliders}
              description="Adjust spacing density and navigation sidebar preferences."
            >
              <div className="space-y-4">
                <ToggleSwitch
                  checked={compactDensity}
                  onChange={setCompactDensity}
                  label="Enable Compact Table & List Density"
                  description="Reduce vertical padding in data tables and logs to display up to 40% more rows per screen."
                />
                <ToggleSwitch
                  checked={highContrastText}
                  onChange={setHighContrastText}
                  label="High-Contrast Typography Mode"
                  description="Increase font weight and darken secondary text (#374151) for maximum legibility on monitors."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">Default Sidebar Navigation Layout</label>
                    <select
                      value={sidebarLayout}
                      onChange={(e) => setSidebarLayout(e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all shadow-sm"
                    >
                      <option value="Expanded Navigation">Expanded Navigation (Full icon & label descriptions)</option>
                      <option value="Collapsed Icons">Collapsed Icons (Slim icon-only rail for extra workspace)</option>
                      <option value="Auto-Hover">Auto-Hover (Expands when mouse enters left boundary)</option>
                    </select>
                    <p className="text-xs text-[#6B7280]">Determines how left navigation rails behave when loading new browser sessions.</p>
                  </div>
                </div>
              </div>
            </SettingsCard>
          </div>
        )}

        {/* 7. ACTIVITY LOG SECTION */}
        {activeTab === 'activity' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <SettingsCard
              title="System Audit Trails & Configuration Log"
              icon={Activity}
              description="Review recent administrative modifications, login attempts, and automated scheduler events."
            >
              {/* Log Filter and Export Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  {(['All Events', 'Security Only', 'System Modes', 'Automated Jobs'] as const).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setLogFilter(filter)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        logFilter === filter
                          ? 'bg-[#2563EB] text-white shadow-sm'
                          : 'bg-[#F8FAFC] text-[#6B7280] hover:text-[#111827] border border-[#E5E7EB]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    setToast('Audit log export initiated. CSV report downloaded to local disk.');
                    setTimeout(() => setToast(null), 3000);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[#111827] border border-[#E5E7EB] text-xs font-semibold flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-auto"
                >
                  <Download className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Export Audit CSV</span>
                </button>
              </div>

              {/* Logs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
                      <th className="py-3 px-4">Event ID</th>
                      <th className="py-3 px-4">Action Performed</th>
                      <th className="py-3 px-4">Initiated By</th>
                      <th className="py-3 px-4">Source IP</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E7EB] text-xs">
                    {mockActivityLogs
                      .filter(log => {
                        if (logFilter === 'Security Only') return log.action.toLowerCase().includes('timeout') || log.action.toLowerCase().includes('auth') || log.action.toLowerCase().includes('secret');
                        if (logFilter === 'System Modes') return log.action.toLowerCase().includes('mode') || log.action.toLowerCase().includes('rate');
                        if (logFilter === 'Automated Jobs') return log.action.toLowerCase().includes('archival') || log.action.toLowerCase().includes('daemon');
                        return true;
                      })
                      .map((log) => (
                        <tr key={log.id} className="hover:bg-[#F8FAFC]/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#2563EB]">{log.id}</td>
                          <td className="py-3.5 px-4 font-semibold text-[#111827]">{log.action}</td>
                          <td className="py-3.5 px-4 text-[#6B7280]">{log.user}</td>
                          <td className="py-3.5 px-4 font-mono text-[#6B7280]">{log.ip}</td>
                          <td className="py-3.5 px-4 text-[#6B7280]">{log.timestamp}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              log.status === 'Success' 
                                ? 'bg-green-50 text-[#22C55E] border border-green-200' 
                                : 'bg-red-50 text-[#EF4444] border border-red-200'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </SettingsCard>
          </div>
        )}
      </div>
    </div>
  );
}
