import React from 'react';
import { User, Mail, Shield, Award, CheckCircle2, Bell, Star, FileText, Clock, BarChart2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ProfileAccountCenter from '../../../components/user/ProfileAccountCenter';

interface ProfileViewProps {
  watchlistCount: number;
  alertsCount: number;
  theme?: 'light' | 'dark';
}

export default function ProfileView({ watchlistCount, alertsCount, theme = 'dark' }: ProfileViewProps) {
  const { user } = useAuth();
  const name = user?.displayName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.trim() : null) || user?.name || user?.username || 'Sarah Jenkins';
  const email = user?.email || 'analyst@stockquery.com';
  const username = user?.username || 'analyst';
  const accessLevel = user?.roleTitle || 'Analyst (Research & Queries)';
  const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="space-y-8">
      
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Analyst Profile & Account Settings</h1>
        <p className="text-sm text-slate-400 mt-1">
          Review your analyst credentials, monitored statistics, and data formatting preferences.
        </p>
      </div>

      {/* Profile Card & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analyst Identity Card */}
        <div className="lg:col-span-1 bg-[#131b2e] p-6 rounded-3xl border border-slate-800/80 shadow-xl flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl shadow-blue-500/20 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{accessLevel} • Research Portal</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Star Market Analyst</span>
          </div>

          <div className="w-full pt-4 border-t border-slate-800/80 space-y-2 text-left text-xs">
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Username:</span>
              <span className="text-white font-mono font-bold">{username}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Email Address:</span>
              <span className="text-white font-medium truncate max-w-[180px]">{email}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Access Level:</span>
              <span className="text-blue-400 font-bold truncate max-w-[160px]">{accessLevel}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Data Feed Status:</span>
              <span className="text-emerald-400 font-bold">Real-Time Hybrid Engine</span>
            </div>
          </div>
        </div>

        {/* Preferences & Activity Breakdown */}
        <div className="lg:col-span-2 bg-[#131b2e] p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Analyst Activity Statistics</h3>
            <p className="text-xs text-slate-400">Summary of your monitored data within the SQ Platform</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#0b0f19] p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <Star className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white block">{watchlistCount}</span>
                <span className="text-xs text-slate-400">Watchlist Stocks</span>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white block">{alertsCount}</span>
                <span className="text-xs text-slate-400">Active Alerts</span>
              </div>
            </div>

            <div className="bg-[#0b0f19] p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white block">Unlimited</span>
                <span className="text-xs text-slate-400">Report Generation</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Full Interactive Profile & Account Settings Center */}
      <div className="pt-4 border-t border-slate-800/80">
        <ProfileAccountCenter theme={theme} />
      </div>

    </div>
  );
}
