import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { StudyTask } from '../types';

interface PlannerViewProps {
  tasks: StudyTask[];
  onAddTask: (task: {
    subject: string;
    topic: string;
    dueDate: string;
    durationMinutes: number;
    priority: 'Low' | 'Medium' | 'High';
  }) => Promise<void>;
  onToggleTask: (id: string) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onGeneratePlan: (availableHours: number) => Promise<void>;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onGeneratePlan,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [availableHours, setAvailableHours] = useState(12);

  // New task form state
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) return;

    await onAddTask({
      subject: subject.trim(),
      topic: topic.trim(),
      dueDate: dueDate.trim() || 'This week',
      durationMinutes: Number(durationMinutes) || 45,
      priority,
    });

    setSubject('');
    setTopic('');
    setDueDate('');
    setShowAddModal(false);
  };

  const handleTriggerAiPlan = async () => {
    setIsGenerating(true);
    try {
      await onGeneratePlan(availableHours);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalMinutes = tasks
    .filter((t) => t.status === 'pending')
    .reduce((acc, t) => acc + t.durationMinutes, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner & AI Schedule Generator */}
      <div className="bg-[#0d1320] border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="max-w-xl space-y-1">
          <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Curriculum Strategist</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Personalized Study Planner</h2>
          <p className="text-xs text-slate-400">
            Organize revision tasks or have Gemini construct an optimal spaced repetition study sprint calibrated to your available study hours.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-400">Hours Free:</span>
            <input
              type="number"
              min={2}
              max={40}
              value={availableHours}
              onChange={(e) => setAvailableHours(Number(e.target.value))}
              className="w-12 bg-transparent text-xs font-mono font-semibold text-white focus:outline-none text-center"
            />
          </div>

          <button
            onClick={handleTriggerAiPlan}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Structuring Sprint...' : 'Generate AI Study Plan'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700/60 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs text-slate-400">Pending Tasks</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{pendingCount}</div>
        </div>
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs text-slate-400">Total Planned Study Time</div>
          <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">
            {Math.round(totalMinutes / 60)} hrs {totalMinutes % 60}m
          </div>
        </div>
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-4">
          <div className="text-xs text-slate-400">Completed Milestones</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{completedCount}</div>
        </div>
      </div>

      {/* Task Filters (Interactive Segmented Control) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-[#0d1320] border border-slate-800 rounded-lg">
          {(['all', 'pending', 'completed'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all capitalize cursor-pointer ${
                filter === mode
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode} ({mode === 'all' ? tasks.length : mode === 'pending' ? pendingCount : completedCount})
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isDone = task.status === 'completed';
          return (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                isDone
                  ? 'bg-slate-900/40 border-slate-800/40 opacity-70'
                  : 'bg-[#0e1422] border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <button
                  onClick={() => onToggleTask(task.id)}
                  className="mt-0.5 text-slate-500 hover:text-cyan-400 transition-colors shrink-0 cursor-pointer"
                >
                  <CheckCircle2
                    className={`w-5 h-5 ${
                      isDone ? 'text-emerald-500 fill-emerald-500/20' : 'text-slate-600'
                    }`}
                  />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm font-semibold ${
                        isDone ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {task.topic}
                    </span>
                    {task.isAiSuggested && (
                      <span className="text-[10px] font-medium text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded">
                        AI Suggested
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                    <span>{task.subject}</span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {task.durationMinutes} min
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Due: {task.dueDate}</span>
                    <span aria-hidden="true">·</span>
                    <span
                      className={`font-medium ${
                        task.priority === 'High'
                          ? 'text-red-400'
                          : task.priority === 'Medium'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors shrink-0 cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-[#0d1320] border border-slate-800/80 rounded-xl p-8">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white">No tasks in this filter</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Create a new task above or generate an AI study sprint to balance your schedule.
            </p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTask}
            className="bg-[#0e1422] border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-bold text-white">Add New Study Task</h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Subject</label>
              <input
                type="text"
                required
                placeholder="e.g., Organic Chemistry"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Topic / Objective</label>
              <input
                type="text"
                required
                placeholder="e.g., Aldol condensation reaction mechanisms"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Due Date</label>
                <input
                  type="text"
                  placeholder="e.g., Friday, 4 PM"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Duration (min)</label>
                <input
                  type="number"
                  min={15}
                  max={300}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Save Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
