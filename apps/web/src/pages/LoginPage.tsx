import React, { useState } from 'react';
import { ArrowLeft, Lock, Mail, Sparkles, User as UserIcon } from 'lucide-react';
import { Button, Card, Input } from '@lifepilot/ui';
import { useAuthStore } from '@/stores/authStore';

export interface LoginPageProps {
  onSuccess: () => void;
  onBack: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBack }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
      const payload = isRegister
        ? { email, password, full_name: fullName, timezone: 'Asia/Kolkata' }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      const token = isRegister ? data.token.access_token : data.access_token;
      const user = isRegister
        ? data.user
        : {
            id: 'owner-id',
            email,
            full_name: fullName || 'Owner',
            timezone: 'Asia/Kolkata',
            morning_briefing_time: '07:00',
            night_planning_time: '23:30',
          };

      login(token, user);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    login('demo-jwt-token-lifepilot-portfolio', {
      id: 'demo-owner-id',
      email: 'owner@lifepilot.local',
      full_name: 'Lead Engineer',
      timezone: 'Asia/Kolkata',
      morning_briefing_time: '07:00',
      night_planning_time: '23:30',
    });
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 cyber-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Landing Page</span>
        </button>

        <Card glow="cyan" className="p-8">
          {/* Brand header */}
          <div className="text-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.4)] mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <h2 className="font-display font-bold text-2xl text-white">
              {isRegister ? 'Initialize Owner Account' : 'Authenticate LifePilot'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Single-owner access guarded by Argon2id & JWT
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <Input
                label="Full Name"
                placeholder="e.g. Lead Engineer"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<UserIcon className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="owner@lifepilot.local"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Secret Key / Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              variant="glow"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
            >
              {isRegister ? 'Create Account & Seed Database' : 'Sign In'}
            </Button>
          </form>

          {/* Quick Demo Bypass Button */}
          <div className="mt-6 pt-6 border-t border-white/[0.08] text-center">
            <Button
              variant="outline"
              size="md"
              className="w-full text-xs font-mono border-purple-500/40 hover:bg-purple-950/30 text-purple-300"
              onClick={handleDemoAccess}
            >
              ⚡ Instant 1-Click Portfolio Demo Access
            </Button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {isRegister
                ? 'Already initialized? Sign In'
                : 'Need to register the owner account? Click here'}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};
