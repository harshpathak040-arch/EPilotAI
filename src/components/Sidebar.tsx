import React from 'react';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Calendar,
  Sparkles,
  BarChart3,
  ShieldCheck,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAdminLogin: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAdminLogin,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'notes', label: 'My Notes', icon: FileText },
    { id: 'quiz', label: 'Quiz Center', icon: HelpCircle },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'tutor', label: 'AI Tutor', icon: Sparkles },
    { id: 'progress', label: 'Progress & Stats', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#070b13] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Zone */}
        <div className="p-6 pb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              EPilot <span className="text-cyan-400 font-semibold">AI</span>
            </div>
            <div className="text-[11px] text-slate-400 font-normal tracking-wide">
              Adaptive Study Platform
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-2">
          <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase px-3 mb-2">
            Study Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-800/90 text-cyan-400 shadow-sm border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Administration Section */}
        <div className="px-3 py-4 border-t border-slate-800/60 mt-3">
          <div className="text-[11px] font-medium tracking-wider text-slate-400 uppercase px-3 mb-2">
            Governance
          </div>
          {currentUser?.role === 'admin' ? (
            <button
              onClick={() => onSelectTab('admin')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'admin'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-amber-500/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="truncate">Admin Console</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span className="truncate">Admin Login</span>
            </button>
          )}
        </div>
      </div>

      {/* Account Profile Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-[#060910]">
        <div className="flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-medium text-slate-200 truncate">
              {currentUser?.name || 'Guest Learner'}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentUser?.email || 'student@epilot.ai'}
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out / Switch Account"
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
