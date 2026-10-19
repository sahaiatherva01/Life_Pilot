import React, { useState } from 'react';
import {
  Check,
  Shield,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { Badge, Button } from '@lifepilot/ui';

export const MeetOrion: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState(0);

  const demos = [
    {
      title: 'Schedule Creation with Conflict Checking',
      command: 'Add gym at 7 PM every weekday and shift my coding session if needed.',
      intent: 'CREATE_RECURRING_TASK_AND_RECALCULATE',
      extracted: {
        title: 'Gym Session',
        category: 'Fitness / Health',
        recurrence: 'RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
        local_time: '19:00 (Asia/Kolkata)',
        duration_minutes: 60,
        schedule_policy: 'Flexible work blocks may move; exams/sleep are protected.',
      },
      policyVerdict: 'APPROVED_WITH_PROPOSED_DIFF',
      diff: 'DSA Handwritten moved from 19:00 to 20:15 (+15m buffer). Fixed commitments preserved.',
    },
    {
      title: 'Intelligent Schedule Breakdown',
      command: 'Break my upcoming ML project deadline on Friday into actionable sprint subtasks.',
      intent: 'GENERATE_SUBTASKS_FOR_DEADLINE',
      extracted: {
        parent_task: 'ML Project Submission',
        deadline: '2026-10-30 23:59',
        subtasks: [
          'Feature Engineering & Normalization (90m)',
          'Model Training & Metric Eval (120m)',
          'Write Documentation & Architecture Diagram (60m)',
          'Final GitHub Push & Review (30m)',
        ],
      },
      policyVerdict: 'AWAITING_USER_CONFIRMATION',
      diff: 'Subtasks will be scheduled into available free time slots before Friday.',
    },
    {
      title: 'Voice-to-Execution Audit',
      command: 'I finished my DSA handwritten practice early. Mark complete and clear pending alerts.',
      intent: 'TASK_ACTION_COMPLETE_AND_CANCEL_REMINDERS',
      extracted: {
        task_id: 'dsa_handwritten_oct29',
        action: 'COMPLETE',
        outbox_actions: [
          'Mark task completed in DB (atomic transaction)',
          'Cancel 3 pending repeat reminder jobs in Redis/Celery',
          'Append task_event log for self-improving duration analytics',
        ],
      },
      policyVerdict: 'EXECUTED_ATOMICALLY',
      diff: 'Reminders successfully cancelled. Actual duration (55m) recorded against estimated (90m).',
    },
  ];

  const current = demos[selectedDemo];

  return (
    <section id="orion" className="py-24 relative overflow-hidden bg-[#0A0B0E]/90 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-purple-400 font-mono text-xs uppercase tracking-wider mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Personal AI Intelligence</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight">
              Meet Orion. <br />
              <span className="text-purple-400">Strictly Guarded Autonomous Execution.</span>
            </h2>
          </div>
          <p className="mt-4 md:mt-0 max-w-md text-sm text-slate-400">
            Orion is not a generic chat window. It transforms spoken or typed intent into validated, 
            schema-checked tool invocations that never touch your database directly without policy approval.
          </p>
        </div>

        {/* Demo Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8">
          {demos.map((d, index) => (
            <button
              key={index}
              onClick={() => setSelectedDemo(index)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                selectedDemo === index
                  ? 'bg-purple-950/60 text-purple-200 border-purple-500/50 shadow-[0_0_15px_rgba(121,40,202,0.3)]'
                  : 'bg-[#14171F] text-slate-400 border-white/[0.08] hover:text-white'
              }`}
            >
              {d.title}
            </button>
          ))}
        </div>

        {/* Interactive Demo Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Natural Language Input & Extraction Terminal */}
          <div className="lg:col-span-6 bg-[#0F1218] border border-white/[0.08] rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Terminal className="w-4 h-4 text-purple-400" />
                <span>ORION INFERENCE PIPELINE · Qwen2.5-3B</span>
              </div>
              <Badge variant="orion" size="sm">
                4-bit Quantized
              </Badge>
            </div>

            {/* User Prompt */}
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase text-slate-500 block mb-2">
                Incoming Instruction (Text or Voice)
              </span>
              <div className="p-4 rounded-xl bg-[#14171F] border border-cyan-500/30 text-sm font-mono text-cyan-200 flex items-center gap-3">
                <span className="text-cyan-400 font-bold">›</span>
                <span>"{current.command}"</span>
              </div>
            </div>

            {/* Extracted Schema */}
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-500 block mb-2">
                Validated Tool Call Arguments (Pydantic v2 Schema)
              </span>
              <pre className="p-4 rounded-xl bg-black/60 border border-white/[0.06] text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                {JSON.stringify(current.extracted, null, 2)}
              </pre>
            </div>
          </div>

          {/* Right: Policy Engine & Execution Card */}
          <div className="lg:col-span-6 bg-[#14171F] border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_40px_rgba(121,40,202,0.15)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>POLICY & SAFETY VALIDATION ENGINE</span>
                </div>
                <Badge variant="cyan" size="sm">
                  Deterministic Guard
                </Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    Intent Tag
                  </span>
                  <div className="font-mono text-xs font-semibold text-white bg-[#0F1218] px-3 py-2 rounded-lg border border-white/[0.08]">
                    {current.intent}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-mono uppercase text-slate-500 block mb-1">
                    Policy Engine Outcome & Diff Explanation
                  </span>
                  <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs text-purple-200 leading-relaxed">
                    {current.diff}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Audit Event:</span>
                  <span className="text-cyan-400">orion.execute.{current.intent.toLowerCase()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-4 border-t border-white/[0.08] flex items-center justify-between">
              <span className="text-xs text-slate-400">Consequential change approved</span>
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm">
                  Modify Diff
                </Button>
                <Button variant="orion" size="sm" rightIcon={<Check className="w-3.5 h-3.5" />}>
                  Approve Execution
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
