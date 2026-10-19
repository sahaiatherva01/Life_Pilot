import React, { useState } from 'react';
import { CheckCircle2, Play } from 'lucide-react';
import { Badge, Button, Card } from '@lifepilot/ui';

export interface TodayTask {
  id: string;
  title: string;
  time: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planned' | 'in_progress' | 'completed';
  policy: string;
  durationMinutes: number;
}

export const TodayScreen: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed' | 'fixed'>('all');
  const [tasks, setTasks] = useState<TodayTask[]>([
    {
      id: 't-1',
      title: 'Chai Bana na hai Ghar walon ke liye + Gym ki Tayaari',
      time: '06:00 - 06:15',
      category: 'Routine / Family',
      priority: 'medium',
      status: 'completed',
      policy: 'Fixed Routine',
      durationMinutes: 15,
    },
    {
      id: 't-2',
      title: 'Gym Workout Session',
      time: '06:45 - 07:45',
      category: 'Fitness',
      priority: 'high',
      status: 'completed',
      policy: 'Fixed Habit',
      durationMinutes: 60,
    },
    {
      id: 't-3',
      title: 'DSA (Handwritten) + Research',
      time: '09:00 - 10:30',
      category: 'Study',
      priority: 'urgent',
      status: 'in_progress',
      policy: 'High Focus Session',
      durationMinutes: 90,
    },
    {
      id: 't-4',
      title: 'Project(Learn_Mind) + Git Hub Push',
      time: '12:00 - 01:30',
      category: 'Projects',
      priority: 'high',
      status: 'planned',
      policy: 'Flexible Sprint',
      durationMinutes: 90,
    },
    {
      id: 't-5',
      title: 'Cricket Match & Cardio',
      time: '04:30 - 06:30',
      category: 'Fitness',
      priority: 'medium',
      status: 'planned',
      policy: 'Protected Recreation',
      durationMinutes: 120,
    },
    {
      id: 't-6',
      title: 'Reach Out + Resume & Excel Sheet Update',
      time: '08:00 - 08:40',
      category: 'Career',
      priority: 'medium',
      status: 'planned',
      policy: 'Flexible Routine',
      durationMinutes: 40,
    },
    {
      id: 't-7',
      title: 'DSA (Company Wise Practice + Analysis)',
      time: '10:30 - 11:30',
      category: 'Study',
      priority: 'high',
      status: 'planned',
      policy: 'Evening Deep Work',
      durationMinutes: 60,
    },
    {
      id: 't-8',
      title: 'So Jaaunga (Bedtime Anchor)',
      time: '12:00 AM (0.5)',
      category: 'Sleep',
      priority: 'urgent',
      status: 'planned',
      policy: 'Protected Sleep Boundary',
      durationMinutes: 0,
    },
  ]);

  const handleToggle = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: t.status === 'completed' ? 'planned' : 'completed' }
          : t
      )
    );
  };

  const handleStart = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'in_progress' } : t))
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'in_progress') return t.status === 'in_progress';
    if (filter === 'completed') return t.status === 'completed';
    if (filter === 'fixed') return t.policy.toLowerCase().includes('fixed') || t.policy.toLowerCase().includes('protected');
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#14171F] border border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-cyan-400">TODAY'S SCHEDULE</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs font-mono text-purple-400">Asia/Kolkata</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            Daily Execution Trajectory
          </h2>
        </div>

        {/* Day Progress Ring / Counter */}
        <div className="flex items-center gap-4 bg-[#0F1218] px-4 py-2.5 rounded-xl border border-white/[0.06]">
          <div className="text-right">
            <div className="text-xs text-slate-400">Routine Progress</div>
            <div className="text-base font-bold font-mono text-cyan-300">
              {completedCount} / {tasks.length} Completed ({progressPercent}%)
            </div>
          </div>
          <div className="h-10 w-10 rounded-full bg-cyan-950/60 border-2 border-cyan-400 flex items-center justify-center font-mono text-xs font-bold text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.3)]">
            {progressPercent}%
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(['all', 'in_progress', 'completed', 'fixed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-all capitalize whitespace-nowrap ${
              filter === tab
                ? 'bg-cyan-950/50 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                : 'text-slate-400 hover:text-white bg-[#14171F] border border-white/[0.06]'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <Card
            key={task.id}
            glow={task.status === 'in_progress' ? 'cyan' : 'none'}
            className={`p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              task.status === 'completed' ? 'opacity-60 bg-[#14171F]/40' : ''
            }`}
          >
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <button
                onClick={() => handleToggle(task.id)}
                className={`h-5 w-5 rounded-md border mt-0.5 sm:mt-0 flex items-center justify-center transition-colors shrink-0 ${
                  task.status === 'completed'
                    ? 'bg-emerald-500 border-emerald-400 text-black'
                    : 'border-slate-600 hover:border-cyan-400'
                }`}
              >
                {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-semibold text-cyan-300">
                    {task.time}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {task.category}
                  </Badge>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {task.policy}
                  </span>
                </div>
                <h3
                  className={`text-sm font-semibold mt-1 truncate ${
                    task.status === 'completed'
                      ? 'line-through text-slate-500'
                      : 'text-slate-100'
                  }`}
                >
                  {task.title}
                </h3>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {task.status === 'planned' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleStart(task.id)}
                  leftIcon={<Play className="w-3 h-3 text-cyan-400" />}
                >
                  Start
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Badge variant="cyan" size="sm" dot>
                  Focus Active
                </Badge>
              )}
              {task.status === 'completed' && (
                <Badge variant="success" size="sm">
                  Completed
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
