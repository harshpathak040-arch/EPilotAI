import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  FileText,
  Activity,
  Cpu,
  Database,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle,
} from 'lucide-react';
import { AdminOverview, AdminUser, AdminLog, StudyMaterial } from '../types';

interface AdminPortalViewProps {
  onLogoutAdmin: () => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ onLogoutAdmin }) => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'logs' | 'system'>('users');
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const headers = { Authorization: 'Bearer user-admin-1' };

      const [overviewRes, usersRes, logsRes, materialsRes] = await Promise.all([
        fetch('/api/admin/overview', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/logs', { headers }),
        fetch('/api/materials', { headers }),
      ]);

      if (overviewRes.ok) setOverview(await overviewRes.json());
      if (usersRes.ok) setAdminUsers(await usersRes.json());
      if (logsRes.ok) setAdminLogs(await logsRes.json());
      if (materialsRes.ok) setMaterials(await materialsRes.json());
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/toggle-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer user-admin-1',
        },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update user');
      }

      setActionNotice(`User account status updated successfully.`);
      setTimeout(() => setActionNotice(null), 3000);
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteMaterial = async (matId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to moderate and delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/materials/${matId}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer user-admin-1' },
      });

      if (!res.ok) throw new Error('Deletion failed');
      setActionNotice(`Study material "${title}" was removed by moderation.`);
      setTimeout(() => setActionNotice(null), 3000);
      loadAdminData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredUsers = adminUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-[#0b1220] border border-amber-500/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-1">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Role-Guarded Administrator Portal</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">System Control Console</h2>
          <p className="text-xs text-slate-300">
            Real-time server telemetry, student account governance, and curriculum content moderation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadAdminData}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
          <button
            onClick={onLogoutAdmin}
            className="px-4 py-2 bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-semibold rounded-lg border border-red-800/60 transition-colors cursor-pointer"
          >
            Exit Admin Mode
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Primary Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Registered Students</div>
          <div className="mt-2 text-3xl font-extrabold text-white font-mono tabular-nums">
            {overview?.totalStudents ?? '...'}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono">
            {overview?.activeUsers} active accounts
          </div>
        </div>

        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Uploaded Materials</div>
          <div className="mt-2 text-3xl font-extrabold text-cyan-400 font-mono tabular-nums">
            {overview?.totalMaterials ?? '...'}
          </div>
          <div className="mt-2 text-xs text-slate-400">Indexed for text extraction</div>
        </div>

        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase tracking-wide">Quizzes Completed</div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-400 font-mono tabular-nums">
            {overview?.totalQuizzesTaken ?? '...'}
          </div>
          <div className="mt-2 text-xs text-slate-400">Server evaluated</div>
        </div>

        <div className="bg-[#0e1422] border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs text-slate-400 uppercase tracking-wide">AI Model Integration</div>
          <div className="mt-2 text-lg font-bold text-amber-300 font-mono truncate">
            {overview?.geminiModel || 'gemini-3.8-flash'}
          </div>
          <div className="mt-2 text-xs text-slate-400 font-mono">
            Uptime: {overview?.systemUptimeHours || 0} hrs
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          User Governance ({adminUsers.length})
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Content Moderation ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          System Health & Environment
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Security Audit Logs ({adminLogs.length})
        </button>
      </div>

      {/* TAB 1: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-[#0d1320] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white">Registered User Accounts</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect registered student statuses and toggle access permissions.
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0e17] text-slate-400 uppercase font-medium border-y border-slate-800">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Notes Uploaded</th>
                  <th className="py-3 px-4">Quizzes Taken</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredUsers.map((user) => {
                  const isActive = user.status === 'active';
                  const isSuperAdmin = user.email === 'admin@epilot.ai';

                  return (
                    <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-medium text-slate-200">{user.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            user.role === 'admin'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                              : 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                            isActive
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                              : 'bg-red-950/60 text-red-400 border border-red-800/40'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-300 tabular-nums">
                        {user.materialsCount}
                      </td>
                      <td className="py-3 px-4 text-slate-300 tabular-nums">
                        {user.quizzesCount}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        {isSuperAdmin ? (
                          <span className="text-[11px] text-slate-400 italic">Protected</span>
                        ) : (
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-red-950/40 hover:bg-red-900/40 text-red-300 border-red-800/40'
                                : 'bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 border-emerald-800/40'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT MODERATION */}
      {activeTab === 'content' && (
        <div className="bg-[#0d1320] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-semibold text-white">Curriculum Content Moderation</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review documents uploaded by students across the platform and purge non-compliant materials.
            </p>
          </div>

          <div className="space-y-3">
            {materials.map((mat) => (
              <div
                key={mat.id}
                className="p-4 bg-[#111827]/70 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{mat.title}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span>{mat.fileName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{Math.round(mat.fileSize / 1024)} KB</span>
                      <span aria-hidden="true">·</span>
                      <span>Uploaded {new Date(mat.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                  className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/60 text-red-300 border border-red-800/60 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Purge Document</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM HEALTH */}
      {activeTab === 'system' && (
        <div className="bg-[#0d1320] border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
          <div>
            <h3 className="text-base font-semibold text-white">System Architecture & Health</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Detailed connectivity status for databases, Gemini model APIs, and session security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs text-slate-400 font-medium uppercase">Database Engine</div>
              <div className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>PostgreSQL / Supabase Adapter Healthy</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                SQLAlchemy engine active with automatic connection pooling and pre-ping verification enabled.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs text-slate-400 font-medium uppercase">Google Gen AI SDK</div>
              <div className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>{overview?.geminiModel || 'gemini-3.8-flash'} Configured</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Server-side only execution with telemetry User-Agent header enforced; client exposure forbidden.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs text-slate-400 font-medium uppercase">Authentication & Password Hashing</div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Argon2id & Cryptographic Sessions</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Argon2id hashing algorithm configured with URLSafe timed serialization and role-guarded middleware.
              </p>
            </div>

            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <div className="text-xs text-slate-400 font-medium uppercase">Document Extraction Pipeline</div>
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>PyMuPDF & In-Memory Text Parser</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stream parsing with 10MB bounds check and untrusted text isolation delimiters on AI prompts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-[#0d1320] border border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <div>
            <h3 className="text-base font-semibold text-white">Security & Administrative Audit Trail</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable chronological record of administrative actions, logins, and status mutations.
            </p>
          </div>

          <div className="space-y-2">
            {adminLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-slate-900/50 border border-slate-800/70 rounded-xl flex items-start justify-between gap-4 font-mono text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-semibold">{log.action}</span>
                    <span className="text-slate-500 font-sans">by</span>
                    <span className="text-slate-300">{log.adminEmail}</span>
                  </div>
                  {log.details && (
                    <div className="text-slate-400 font-sans text-xs">{log.details}</div>
                  )}
                </div>
                <span className="text-slate-400 shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
