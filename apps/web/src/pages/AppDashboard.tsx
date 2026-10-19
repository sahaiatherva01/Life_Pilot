import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Compass,
  FileSpreadsheet,
  Flame,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Badge, Button, Card } from '@lifepilot/ui';

export interface AppDashboardProps {
  onNavigate: (screen: string) => void;
}

export const AppDashboard: React.FC<AppDashboardProps> = ({ onNavigate }) => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      time: '06:00 - 06:15',
      title: 'Chai Bana na hai Ghar walon ke liye + Gym ki Tayaari',
      category: 'Routine / Family',
      status: 'completed',
      policy: 'Fixed Commitment',
    },
    {
      id: 2,
      time: '06:45 - 07:45',
      title: 'Gym Workout Session',
      category: 'Fitness',
      status: 'completed',
      policy: 'Fixed Routine',
    },
    {
      id: 3,
      time: '09:00 - 10:30',
      title: 'DSA (Handwritten) + Research',
      category: 'Deep Work / Career',
      status: 'in_progress',
      policy: 'High Focus (Distractions Blocked)',
    },
    {
      id: 4,
      time: '12:00 - 01:30',
      title: 'Project(Learn_Mind) + Git Hub Push',
      category: 'Development',
      status: 'planned',
      policy: 'Flexible Block',
    },
    {
      id: 5,
      time: '04:30 - 06:30',
      title: 'Cricket Match',
      category: 'Cardio / Recreation',
      status: 'planned',
      policy: 'Protected Recreation',
    },
    {
      id: 6,
      time: '10:30 - 11:30',
      title: 'DSA (Company Wise Practice + Analysis)',
      category: 'Study',
      status: 'planned',
      policy: 'Evening Revision',
    },
    {
      id: 7,
      time: '12:00 AM (0.5)',
      title: 'So Jaaunga (Bedtime Anchor)',
      category: 'Sleep Boundary',
      status: 'planned',
      policy: 'Protected Sleep Commitment',
    },
  ]);

  const toggleTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'planned' : 'completed' }
          : t
      )
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400">
              Schedule State
            </span>
            <div className="text-xl font-bold font-display text-white mt-0.5">
              Conflict-Free
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">0 Conflicts Detected</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-cyan-500/30 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
          <div>
            <span className="text-[11px] font-mono uppercase text-cyan-400">
              Active Focus Session
            </span>
            <div className="text-xl font-bold font-display text-cyan-300 mt-0.5">
              64m Remaining
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">DSA Handwritten</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400">
              Persistent Reminders
            </span>
            <div className="text-xl font-bold font-display text-white mt-0.5">
              3 Active Queued
            </div>
            <span className="text-[10px] text-purple-400 font-mono">Celery Outbox Healthy</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Zap className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-white/[0.08]">
          <div>
            <span className="text-[11px] font-mono uppercase text-slate-400">
              Orion Engine
            </span>
            <div className="text-xl font-bold font-display text-white mt-0.5">
              Qwen2.5-3B
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Host: Local Apple Silicon</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-white/[0.08] flex items-center justify-center text-slate-300">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Today's Timeline + Tactical Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Timeline (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="font-display font-bold text-base text-white">
                Today's Chronological Trajectory
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Asia/Kolkata (IST)
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  task.status === 'in_progress'
                    ? 'bg-cyan-950/20 border-cyan-500/40 shadow-[0_0_20px_rgba(0,242,254,0.12)]'
                    : task.status === 'completed'
                    ? 'bg-[#14171F]/40 border-white/[0.04] opacity-60'
                    : 'bg-[#14171F] border-white/[0.08] hover:border-white/[0.14]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      task.status === 'completed'
                        ? 'bg-emerald-500 border-emerald-400 text-black'
                        : 'border-slate-600 hover:border-cyan-400'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400 shrink-0">
                        {task.time}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">· {task.category}</span>
                    </div>
                    <h4
                      className={`text-sm font-semibold truncate ${
                        task.status === 'completed'
                          ? 'line-through text-slate-500'
                          : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.status === 'in_progress' && (
                    <Badge variant="cyan" size="sm" dot>
                      Focus Active
                    </Badge>
                  )}
                  {task.status === 'completed' && (
                    <Badge variant="success" size="sm">
                      Done
                    </Badge>
                  )}
                  {task.status === 'planned' && (
                    <Badge variant="neutral" size="sm">
                      {task.policy}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Briefing & Quick Assistant Dispatch (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Morning Briefing Snapshot */}
          <Card className="p-5 border-purple-500/30 bg-[#14171F]/90 shadow-[0_0_30px_rgba(121,40,202,0.15)]">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
              <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>07:00 AM BRIEFING</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Delivered</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              "Good morning. You have 3 deep work blocks today. DSA handwritten session is prioritized first. Cricket session is locked at 4:30 PM with zero conflict."
            </p>

            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs font-mono text-slate-400 space-y-1">
              <div>Top Priority: DSA Handwritten</div>
              <div>Night Review: 23:30 (Draft ready)</div>
            </div>
          </Card>

          {/* Quick Actions Panel */}
          <Card className="p-5 border-white/[0.08]">
            <h3 className="font-display font-semibold text-sm text-white mb-3">
              Quick System Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-start text-xs font-mono"
                onClick={() => onNavigate('imports')}
                leftIcon={<FileSpreadsheet className="w-4 h-4 text-cyan-400" />}
              >
                Inspect Guide.xlsx Import
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-start text-xs font-mono"
                onClick={() => onNavigate('planner')}
                leftIcon={<Compass className="w-4 h-4 text-purple-400" />}
              >
                Review Night Plan Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-start text-xs font-mono"
                onClick={() => onNavigate('focus')}
                leftIcon={<Flame className="w-4 h-4 text-amber-400" />}
              >
                Start Pomodoro Timer
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
