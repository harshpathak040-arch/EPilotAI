import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, AlertCircle, X, KeyRound } from 'lucide-react';
import { User } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickFill = () => {
    setEmail('admin@epilot.ai');
    setPassword('AdminPass123!');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      if (data.user.role !== 'admin') {
        throw new Error('Access denied: This account lacks administrator authorization.');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid credentials or inactive account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="bg-[#0b101c] border border-amber-500/40 rounded-2xl w-full max-w-md p-6 sm:p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">EPilot AI Admin Portal</h2>
          <p className="text-xs text-slate-400">
            Authorized personnel only. Sessions authenticated via server-side Argon2 hashing.
          </p>
        </div>

        {/* Quick Fill Testing Box */}
        <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-amber-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Pre-Seeded Test Credentials:</span>
            </span>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] font-semibold text-amber-400 hover:text-amber-200 underline cursor-pointer"
            >
              Click to Auto-Fill
            </button>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">
            Email: <span className="text-white">admin@epilot.ai</span>
            <br />
            Pass: <span className="text-white">AdminPass123!</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@epilot.ai"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Verifying Credentials...' : 'Authenticate Admin Session'}
          </button>
        </form>
      </div>
    </div>
  );
};
