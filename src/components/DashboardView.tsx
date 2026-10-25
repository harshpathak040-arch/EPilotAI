import React from 'react';
import {
  FileText,
  HelpCircle,
  Sparkles,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { StudyMaterial, StudyTask, QuizAttempt, User } from '../types';

interface DashboardViewProps {
  currentUser: User | null;
  materials: StudyMaterial[];
  tasks: StudyTask[];
  attempts: QuizAttempt[];
  onNavigate: (tab: string) => void;
  onOpenMaterial: (mat: StudyMaterial) => void;
  onToggleTask: (taskId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  materials,
  tasks,
  attempts,
  onNavigate,
  onOpenMaterial,
  onToggleTask,
}) => {
  const avgScore =
    attempts.length > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.score, 0) / attempts.length)
      : 0;

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const progressPercent =
    tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0d1527] to-[#091222] border border-slate-800/80 rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5 max-w-2xl">
          <div className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
            Academic Flight Deck
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, {currentUser?.name || 'Scholar'}
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            You have {materials.length} active curriculum modules and {pendingTasks.length} pending revision blocks. Your AI Socratic Tutor is primed with your course notes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('tutor')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Socratic Tutor</span>
          </button>
          <button
            onClick={() => onNavigate('notes')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 text-xs font-semibold border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Upload Notes</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Tabular Numerals, Single Elevation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Study Materials
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">
              {materials.length}
            </span>
            <span className="text-xs text-slate-500">documents indexed</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {materials.reduce((acc, m) => acc + (m.textLength || 0), 0).toLocaleString()} words analyzed
          </div>
        </div>

        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Quizzes Completed
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-cyan-400 font-mono tabular-nums">
              {attempts.length}
            </span>
            <span className="text-xs text-slate-500">evaluated</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Latest: {attempts[0]?.quizTitle ? attempts[0].quizTitle.slice(0, 22) + '...' : 'Ready to start'}
          </div>
        </div>

        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Average Score
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
              {avgScore}%
            </span>
            <span className="text-xs text-slate-500">mastery</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            Based on {attempts.length} server-graded attempts
          </div>
        </div>

        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5 hover:border-slate-700 transition-colors">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Sprint Progress
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-400 font-mono tabular-nums">
              {progressPercent}%
            </span>
            <span className="text-xs text-slate-500">tasks done</span>
          </div>
          <div className="mt-3 text-xs text-slate-400">
            {completedTasks.length} of {tasks.length} study tasks completed
          </div>
        </div>
      </div>

      {/* Main Split Layout: Recent Notes & Upcoming Study Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Recent Materials & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0d1320] border border-slate-800/80 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Course Materials & Notes
                </h3>
                <p className="text-xs text-slate-400">
                  Select a document to inspect text or generate an AI quiz
                </p>
              </div>
              <button
                onClick={() => onNavigate('notes')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {materials.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-lg">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No study materials uploaded yet.</p>
                <button
                  onClick={() => onNavigate('notes')}
                  className="mt-3 px-3 py-1.5 text-xs bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition-colors"
                >
                  Upload First PDF
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.slice(0, 3).map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => onOpenMaterial(mat)}
                    className="p-4 bg-[#111827]/70 hover:bg-[#152033] border border-slate-800/80 hover:border-slate-700 rounded-lg transition-all cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-md bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-slate-200 truncate">
                          {mat.title}
                        </h4>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                          <span>{mat.fileName}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {Math.round(mat.fileSize / 1024)} KB
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{mat.summary ? 'AI Summary Ready' : 'Extracted Text'}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400 hover:text-cyan-300 font-medium shrink-0">
                      Open &rarr;
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigate('notes')}
              className="p-4 bg-[#0d1320] border border-slate-800/80 hover:border-cyan-500/40 rounded-xl text-left transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-2.5">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                Upload Notes
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Parse PDF text & save
              </div>
            </button>

            <button
              onClick={() => onNavigate('quiz')}
              className="p-4 bg-[#0d1320] border border-slate-800/80 hover:border-cyan-500/40 rounded-xl text-left transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-2.5">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                Generate Quiz
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Adaptive MCQs
              </div>
            </button>

            <button
              onClick={() => onNavigate('planner')}
              className="p-4 bg-[#0d1320] border border-slate-800/80 hover:border-cyan-500/40 rounded-xl text-left transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2.5">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                Plan Study Sprint
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                AI Schedule Assistant
              </div>
            </button>

            <button
              onClick={() => onNavigate('tutor')}
              className="p-4 bg-[#0d1320] border border-slate-800/80 hover:border-cyan-500/40 rounded-xl text-left transition-all hover:-translate-y-0.5 group"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-2.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                AI Tutor Chat
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Socratic Guided Recall
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Upcoming Tasks */}
        <div className="bg-[#0d1320] border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Upcoming Tasks
                </h3>
                <p className="text-xs text-slate-400">
                  {pendingTasks.length} active milestones
                </p>
              </div>
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Planner &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {tasks.slice(0, 4).map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      isDone
                        ? 'bg-slate-900/40 border-slate-800/40 text-slate-500'
                        : 'bg-[#111827]/70 border-slate-800 text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => onToggleTask(task.id)}
                        className="mt-0.5 text-slate-500 hover:text-cyan-400 transition-colors"
                      >
                        <CheckCircle2
                          className={`w-4 h-4 ${isDone ? 'text-emerald-500 fill-emerald-500/20' : ''}`}
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-xs font-medium leading-snug ${
                            isDone ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.topic}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{task.subject}</span>
                          <span aria-hidden="true">·</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3" />
                            {task.durationMinutes}m
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4">
            <button
              onClick={() => onNavigate('planner')}
              className="w-full py-2 px-3 text-xs font-semibold text-center text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 rounded-lg transition-colors"
            >
              + Add Custom Study Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
