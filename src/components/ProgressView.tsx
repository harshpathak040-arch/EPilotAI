import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Award,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Clock,
  Layers,
} from 'lucide-react';
import { QuizAttempt, StudyMaterial, StudyTask } from '../types';

interface ProgressViewProps {
  materials: StudyMaterial[];
  tasks: StudyTask[];
  attempts: QuizAttempt[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  materials,
  tasks,
  attempts,
}) => {
  const [subjectFilter, setSubjectFilter] = useState('all');

  const totalAttempts = attempts.length;
  const avgScore =
    totalAttempts > 0
      ? Math.round(attempts.reduce((acc, a) => acc + a.score, 0) / totalAttempts)
      : 0;

  const highestScore =
    totalAttempts > 0 ? Math.max(...attempts.map((a) => a.score)) : 0;

  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  // Filter attempts if a subject is picked
  const filteredAttempts = attempts.filter((a) => {
    if (subjectFilter === 'all') return true;
    return a.quizTitle.toLowerCase().includes(subjectFilter.toLowerCase());
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Mastery Index
          </div>
          <div className="mt-2 text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">
            {avgScore}%
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Across {totalAttempts} server-evaluated quizzes
          </div>
        </div>

        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Peak Quiz Score
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {highestScore}%
          </div>
          <div className="mt-2 text-xs text-slate-400">Personal best assessment</div>
        </div>

        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Curriculum Modules
          </div>
          <div className="mt-2 text-3xl font-extrabold text-white font-mono tabular-nums">
            {materials.length}
          </div>
          <div className="mt-2 text-xs text-slate-400">Indexed study files</div>
        </div>

        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase tracking-wide">
            Sprint Tasks Completed
          </div>
          <div className="mt-2 text-3xl font-extrabold text-blue-400 font-mono tabular-nums">
            {completedTasks} / {tasks.length}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {tasks.length > 0
              ? `${Math.round((completedTasks / tasks.length) * 100)}% execution rate`
              : 'No tasks scheduled'}
          </div>
        </div>
      </div>

      {/* Weekly Activity Heatmap / Bar Visualization */}
      <div className="bg-[#0d1320] border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Weekly Study Effort & Quiz Cadence
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Consistent active recall and testing distribution across the 7-day cycle
            </p>
          </div>
        </div>

        {/* CSS Bar Chart with tabular numbers */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4">
          {[
            { day: 'Mon', mins: 45, quizzes: 1, height: '55%' },
            { day: 'Tue', mins: 75, quizzes: 2, height: '85%' },
            { day: 'Wed', mins: 30, quizzes: 0, height: '40%' },
            { day: 'Thu', mins: 60, quizzes: 1, height: '70%' },
            { day: 'Fri', mins: 90, quizzes: 3, height: '100%' },
            { day: 'Sat', mins: 40, quizzes: 0, height: '50%' },
            { day: 'Sun', mins: 50, quizzes: 1, height: '60%' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <div className="text-[11px] font-mono text-slate-400">
                {item.mins}m
              </div>
              <div className="w-full bg-slate-900 rounded-lg h-36 flex items-end p-1.5 border border-slate-800">
                <div
                  className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-md transition-all duration-500"
                  style={{ height: item.height }}
                />
              </div>
              <div className="text-xs font-semibold text-slate-300">{item.day}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                {item.quizzes} quiz{item.quizzes !== 1 ? 'zes' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Complete Historical Quiz Log */}
      <div className="bg-[#0d1320] border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Verified Quiz Performance Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable records of previous test sessions and calculated accuracy
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Topic Filter:</span>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
            >
              <option value="all">All Topics</option>
              {materials.map((m) => (
                <option key={m.id} value={m.title}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredAttempts.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No quiz records found matching the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0e17] text-slate-400 uppercase font-medium border-y border-slate-800">
                <tr>
                  <th className="py-3 px-4">Assessment Title</th>
                  <th className="py-3 px-4">Correct / Total</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Completed On</th>
                  <th className="py-3 px-4">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredAttempts.map((att) => {
                  const passed = att.score >= 70;
                  return (
                    <tr key={att.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-medium text-slate-200">
                        {att.quizTitle}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 tabular-nums">
                        {att.correctCount} / {att.totalQuestions}
                      </td>
                      <td className="py-3.5 px-4 font-bold tabular-nums">
                        <span className={passed ? 'text-emerald-400' : 'text-amber-400'}>
                          {att.score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(att.completedAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-sans font-medium ${
                            passed
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                              : 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                          }`}
                        >
                          {passed ? 'Proficient' : 'Needs Review'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
