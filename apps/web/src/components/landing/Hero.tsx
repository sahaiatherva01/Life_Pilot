import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Play,
  Sparkles,
} from 'lucide-react';
import { Badge, Button } from '@lifepilot/ui';

export interface HeroProps {
  onOpenApp: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenApp }) => {
  return (
    <section id="hero" className="relative pt-20 pb-28 overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[500px] h-[300px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14171F] border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-8 shadow-[0_0_15px_rgba(0,242,254,0.15)] animate-fade-in">
          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span>ORION AI V0.1 · LOCAL 3B QUANTIZED · ZERO CLOUD API REQUIRED</span>
        </div>

        {/* Title */}
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          The Autonomous <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            Personal Life Operating System
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl text-base sm:text-lg text-slate-400 mb-10 leading-relaxed">
          LifePilot replaces fragile todo lists with a mathematical scheduling engine, 
          persistent state-machine alarms that prompt until acknowledged, and 
          <span className="text-purple-300 font-medium"> Orion</span>—a private AI assistant running on your laptop.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Button
            variant="glow"
            size="lg"
            onClick={onOpenApp}
            rightIcon={<ArrowRight className="w-4 h-4 text-black" />}
          >
            Launch System Demo
          </Button>
          <a href="#orion">
            <Button
              variant="outline"
              size="lg"
              leftIcon={<Play className="w-4 h-4 text-cyan-400" />}
            >
              Meet Orion in Action
            </Button>
          </a>
        </div>

        {/* Animated Product Mockup Preview */}
        <div className="w-full max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-white/10 to-transparent border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <div className="rounded-xl bg-[#0F1218] border border-white/[0.06] overflow-hidden">
            {/* Mockup Header Bar */}
            <div className="px-4 py-3 bg-[#14171F] border-b border-white/[0.08] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 font-mono text-[11px] text-slate-400">
                  lifepilot.local/app/today · Asia/Kolkata
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="cyan" size="sm" dot>
                  Greedy Engine Active
                </Badge>
                <Badge variant="orion" size="sm">
                  Qwen2.5-3B Local
                </Badge>
              </div>
            </div>

            {/* Mockup Body: High Density Schedule Timeline */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Left Column: Morning Briefing Card */}
              <div className="bg-[#14171F]/90 rounded-xl p-4 border border-purple-500/30 flex flex-col justify-between shadow-[0_0_25px_rgba(121,40,202,0.15)]">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> 07:00 Briefing
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Delivered</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-2">
                    Today's High-Cognitive Trajectory
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>09:00 AM:</strong> DSA Handwritten Practice & Research (90m block)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>12:00 PM:</strong> Project Learn_Mind + GitHub Push
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>04:30 PM:</strong> Cricket (Cardio session)
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-mono">Workload: Realistic</span>
                  <span className="text-emerald-400 font-mono">0 Conflicts</span>
                </div>
              </div>

              {/* Middle Column: Active Schedule Stream */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
                  <span>LIVE TIMELINE · OCTOBER 29</span>
                  <span className="text-cyan-400">Next Action in 12m</span>
                </div>

                {/* Timeline Row 1 */}
                <div className="p-3.5 rounded-lg bg-[#14171F] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center font-mono text-xs w-16 text-cyan-400">
                      06:45 AM
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Gym Session</div>
                      <div className="text-[10px] text-slate-400">Fitness Routine · Completed on time</div>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">
                    Acknowledged
                  </Badge>
                </div>

                {/* Timeline Row 2: In Progress */}
                <div className="p-3.5 rounded-lg bg-cyan-950/30 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,242,254,0.12)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center font-mono text-xs w-16 text-cyan-300 font-bold">
                      09:00 AM
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-cyan-200">
                        DSA (Handwritten) + Research
                      </div>
                      <div className="text-[10px] text-cyan-400/80">
                        High Priority Focus Session · Distractions Blocked
                      </div>
                    </div>
                  </div>
                  <Badge variant="cyan" size="sm" dot>
                    Active Timer (64m left)
                  </Badge>
                </div>

                {/* Timeline Row 3: Protected Fixed Event */}
                <div className="p-3.5 rounded-lg bg-[#14171F] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-center font-mono text-xs w-16 text-slate-400">
                      12:00 PM
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Project (Learn_Mind) + Git Hub Push
                      </div>
                      <div className="text-[10px] text-slate-400">Development Block · Flexible Slot</div>
                    </div>
                  </div>
                  <Badge variant="neutral" size="sm">
                    Scheduled
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
