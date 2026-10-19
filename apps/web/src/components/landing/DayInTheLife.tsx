import React from 'react';
import { Clock } from 'lucide-react';
import { Badge } from '@lifepilot/ui';

export const DayInTheLife: React.FC = () => {
  const timelineSteps = [
    {
      time: '06:00 AM',
      title: 'Morning Awakening & Routine Initialization',
      source: 'Guide.xlsx Routine Block',
      desc: 'Chai preparation for family + Gym readiness. Celery worker verifies device reachability over Tailscale mesh.',
      tag: 'Fixed Habit',
      status: 'Completed',
    },
    {
      time: '07:00 AM',
      title: 'Autonomous Morning Briefing Workflow',
      source: 'Orion Executive Dispatch',
      desc: 'Orion synthesizes today\'s fixed commitments, highlights the 09:00 AM DSA handwritten block, and audits overnight calendar updates.',
      tag: 'Intelligence Trigger',
      status: 'Spoken / Read',
    },
    {
      time: '09:00 AM',
      title: 'High-Focus Deep Work: DSA Practice & Research',
      source: '90m Concentration Block',
      desc: 'Focus Mode activates automatically. Distracting notifications are suppressed. Actual duration logging begins.',
      tag: 'Focus Session',
      status: 'Tracked',
    },
    {
      time: '12:00 PM',
      title: 'Project Learn_Mind Sprint & GitHub Push',
      source: 'Development Milestone',
      desc: 'Deterministic scheduler allocates 90 minutes. Buffer preserved before lunch. Orion confirms git commit readiness.',
      tag: 'Sprint',
      status: 'Scheduled',
    },
    {
      time: '04:30 PM',
      title: 'Cardio & Recreation: Cricket',
      source: 'Physical Well-being',
      desc: 'Protected transition period. Even if prior coding sessions ran long, fixed exercise and recreation boundaries remain intact.',
      tag: 'Recreation',
      status: 'Protected',
    },
    {
      time: '11:30 PM',
      title: 'Night Review & Tomorrow\'s Proposal',
      source: 'Night Planning Protocol',
      desc: 'Review completed tasks vs carried-over items. Generates tomorrow\'s proposed schedule diff. If no response, preserves current draft without auto-committing protected changes.',
      tag: 'Strategic Review',
      status: 'Approval Gate',
    },
    {
      time: '12:00 AM',
      title: 'Protected Sleep Commitment',
      source: 'Guide.xlsx Bedtime Anchor',
      desc: 'Hard stop: quiet hours enforced. All pending low-priority notifications muted until tomorrow\'s 07:00 AM briefing.',
      tag: 'Boundary',
      status: 'Enforced',
    },
  ];

  return (
    <section id="timeline" className="py-24 relative bg-[#0F1218]/50 border-t border-white/[0.08]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-3">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Empirical Execution Cycle</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight">
            A Day with LifePilot
          </h2>
          <p className="mt-4 text-slate-400 text-sm">
            Modeled directly from authentic daily routines. How LifePilot orchestrates 24 hours of cognitive, physical, and career commitments.
          </p>
        </div>

        {/* Timeline Stream */}
        <div className="relative border-l-2 border-cyan-500/30 ml-4 sm:ml-32 space-y-10 pl-6 sm:pl-10">
          {timelineSteps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Node Icon */}
              <div className="absolute -left-[35px] sm:-left-[51px] top-1.5 h-6 w-6 rounded-full bg-[#0A0B0E] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.5)] group-hover:scale-125 transition-transform">
                <div className="h-2 w-2 rounded-full bg-cyan-300" />
              </div>

              {/* Timestamp label on left for larger screens */}
              <div className="hidden sm:block absolute -left-36 top-1.5 font-mono text-xs font-semibold text-cyan-300 w-24 text-right">
                {step.time}
              </div>

              {/* Event Card */}
              <div className="bg-[#14171F] border border-white/[0.08] hover:border-cyan-500/40 rounded-xl p-5 transition-all shadow-md group-hover:shadow-[0_0_20px_rgba(0,242,254,0.1)]">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="sm:hidden font-mono text-xs font-bold text-cyan-400">
                      {step.time} ·
                    </span>
                    <h3 className="font-display font-semibold text-base text-white">
                      {step.title}
                    </h3>
                  </div>
                  <Badge variant="cyan" size="sm">
                    {step.tag}
                  </Badge>
                </div>
                <div className="text-[11px] font-mono text-purple-400 mb-2">
                  {step.source}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
