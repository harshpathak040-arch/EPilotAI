import React from 'react';
import { User } from '../types';
import { Shield, Sparkles, UserCircle } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  currentUser: User | null;
  onSwitchRole: () => void;
  onOpenQuickQuiz: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  currentUser,
  onSwitchRole,
  onOpenQuickQuiz,
}) => {
  const titles: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Study Dashboard',
      subtitle: 'Personalized curriculum progress, tasks, and recent activity',
    },
    notes: {
      title: 'Study Materials & Notes',
      subtitle: 'Upload documents, extract text, and generate AI revision summaries',
    },
    quiz: {
      title: 'Adaptive Quiz Center',
      subtitle: 'Server-graded assessments generated directly from your coursework',
    },
    planner: {
      title: 'Personalized Study Planner',
      subtitle: 'Schedule revision sprints and track exam milestones',
    },
    tutor: {
      title: 'Socratic AI Tutor',
      subtitle: 'Interactive pedagogical dialogue with guided recall and hints',
    },
    progress: {
      title: 'Academic Analytics & Mastery',
      subtitle: 'Longitudinal score trends and retention insights',
    },
    admin: {
      title: 'Administrator Security Console',
      subtitle: 'Role-guarded system telemetry, user audits, and moderation',
    },
  };

  const currentInfo = titles[currentTab] || {
    title: 'EPilot AI',
    subtitle: 'Active Learning Environment',
  };

  return (
    <header className="h-16 px-8 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md flex items-center justify-between gap-6 shrink-0 z-10">
      {/* Zone 1: Section Title & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight leading-tight">
            {currentInfo.title}
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Zone 2: Action Controls & Role Switcher */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenQuickQuiz}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-md transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>New AI Quiz</span>
        </button>

        {/* Quick Demo Switcher between Student & Admin */}
        <button
          onClick={onSwitchRole}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 rounded-md transition-colors"
          title="Toggle between Student and Admin for demonstration"
        >
          {currentUser?.role === 'admin' ? (
            <>
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Role</span>
            </>
          ) : (
            <>
              <UserCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Student Role</span>
            </>
          )}
          <span className="text-[10px] text-slate-400 font-mono">(Switch)</span>
        </button>
      </div>
    </header>
  );
};
