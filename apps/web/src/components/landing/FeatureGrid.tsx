import React from 'react';
import {
  BellRing,
  Brain,
  CalendarDays,
  Compass,
  Flame,
  LineChart,
  ListTodo,
  Workflow,
  Zap,
} from 'lucide-react';
import { Card } from '@lifepilot/ui';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: ListTodo,
      title: 'Smart Task Management',
      tag: 'Core Foundation',
      desc: 'Hierarchical subtasks, task dependencies, energy-level matching, and schedule revision tracking that preserves history.',
    },
    {
      icon: CalendarDays,
      title: 'Deterministic Scheduling',
      tag: 'Mathematical Guard',
      desc: 'Protects fixed exams and commitments with mathematical guarantees. Flexible work moves dynamically without packing unrealistic workloads.',
    },
    {
      icon: BellRing,
      title: 'Persistent Alarm State Machine',
      tag: 'PostgreSQL + Celery',
      desc: 'Delivery is not acknowledgement. Reminders transition through pending → delivered → acknowledged, with idempotent outbox retries.',
    },
    {
      icon: Compass,
      title: 'Daily Briefings & Night Planning',
      tag: '07:00 & 23:30 IST',
      desc: '07:00 morning trajectory report and 23:30 night schedule proposal. Never silently approves changes without explicit user confirmation.',
    },
    {
      icon: Flame,
      title: 'Focus Mode & Session Timers',
      tag: 'One-Task Screen',
      desc: 'Full-screen Pomodoro and custom session timers with distraction suppression, session outcome notes, and actual time tracking.',
    },
    {
      icon: Brain,
      title: '4-Tier Contextual Memory',
      tag: 'Full-Text Retrieval',
      desc: 'Profile, episodic, procedural, and context memory. Editable, inspectable, and stored in PostgreSQL with strict access boundaries.',
    },
    {
      icon: LineChart,
      title: 'Behavioral Analytics',
      tag: 'Measured Truth',
      desc: 'Self-improving task duration estimates, completion velocity, and schedule adherence metrics calculated from empirical events.',
    },
    {
      icon: Workflow,
      title: 'Event-Driven Automations',
      tag: 'Trigger Pipelines',
      desc: 'Deterministic lifecycle hooks: "When DSA practice finishes early, offer break and prepare GitHub push sprint automatically."',
    },
  ];

  return (
    <section id="features" className="py-24 relative bg-[#0A0B0E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-3">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>Unified Architecture</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight">
            Engineered as One Cohesive Operating System
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            No fragmented apps or unverified promises. Every subsystem shares one authoritative 
            PostgreSQL database, one deterministic scheduler, and one audited AI runtime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card
                key={index}
                interactive
                className="flex flex-col justify-between hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(0,242,254,0.1)] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-[#1B202B] border border-white/[0.08] flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-base text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
