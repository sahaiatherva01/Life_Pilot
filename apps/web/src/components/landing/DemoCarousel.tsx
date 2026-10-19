import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { Badge, Button } from '@lifepilot/ui';

export const DemoCarousel: React.FC = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 'today',
      title: 'Interactive Today Screen',
      subtitle: 'Dynamic schedule blocks with conflict warnings and live progress timers',
      badge: 'Core UI',
      content: (
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs">
            <span className="font-mono text-cyan-400">TODAY'S SCHEDULE · 8 ACTIVITIES PLANNED</span>
            <span className="text-emerald-400 font-mono">100% Conflict-Free</span>
          </div>
          <div className="p-3 rounded-lg bg-[#14171F] border border-cyan-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-cyan-300 font-bold">09:00 - 10:30</span>
              <div>
                <div className="text-xs font-semibold text-white">DSA (Handwritten) + Research</div>
                <div className="text-[10px] text-slate-400">Company-wise problem sets · Focus Mode Active</div>
              </div>
            </div>
            <Badge variant="cyan" size="sm" dot>Focus Active</Badge>
          </div>
          <div className="p-3 rounded-lg bg-[#14171F] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-400">12:00 - 01:30</span>
              <div>
                <div className="text-xs font-semibold text-white">Project (Learn_Mind) + Git Hub Push</div>
                <div className="text-[10px] text-slate-400">Flexible Development Block</div>
              </div>
            </div>
            <Badge variant="neutral" size="sm">Scheduled</Badge>
          </div>
          <div className="p-3 rounded-lg bg-[#14171F] border border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-slate-400">04:30 - 06:30</span>
              <div>
                <div className="text-xs font-semibold text-white">Cricket Match</div>
                <div className="text-[10px] text-slate-400">Recreation & Fitness Block</div>
              </div>
            </div>
            <Badge variant="neutral" size="sm">Protected</Badge>
          </div>
        </div>
      ),
    },
    {
      id: 'planner',
      title: 'Night Planning (23:30) Review & Diff',
      subtitle: 'Transparent proposed schedule changes with zero silent modifications',
      badge: 'Planning Engine',
      content: (
        <div className="space-y-3 font-sans">
          <div className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/40 text-xs text-purple-200">
            <strong>Orion Night Planning Proposal:</strong> Tomorrow's schedule has been prepared. Review proposed adjustments to flexible blocks below.
          </div>
          <div className="p-3 rounded-lg bg-[#14171F] border border-white/[0.08] text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span>Moved: Research_Mind Coding</span>
              <span className="text-cyan-400 font-mono">14:15 → 15:00 (+45m)</span>
            </div>
            <p className="text-[11px] text-slate-400">Reason: Extends lunch buffer to allow family discussion without clipping study targets.</p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm">Reject Proposal</Button>
            <Button variant="glow" size="sm">Approve Tomorrow's Plan</Button>
          </div>
        </div>
      ),
    },
    {
      id: 'imports',
      title: 'Guide.xlsx Spreadsheet Review Table',
      subtitle: 'Idempotent spreadsheet parser with editable preview and ambiguity resolution',
      badge: 'Excel Normalizer',
      content: (
        <div className="space-y-2 font-mono text-[11px]">
          <div className="p-2 bg-[#0F1218] rounded border border-white/[0.06] text-slate-400 flex justify-between">
            <span>SHEET: Sheet1 (128 Rows)</span>
            <span className="text-cyan-400">100% Parsed Without Error</span>
          </div>
          <div className="p-2.5 bg-[#14171F] rounded border border-cyan-500/30 flex justify-between items-center text-xs">
            <div>
              <span className="text-cyan-300">Row 19: 06:00 - 06:15</span>
              <p className="text-[11px] text-slate-300 font-sans">Chai Bana na hai Ghar walon ke liye + Gym ki Tayaari</p>
            </div>
            <Badge variant="cyan" size="sm">Confirmed</Badge>
          </div>
          <div className="p-2.5 bg-[#14171F] rounded border border-white/[0.08] flex justify-between items-center text-xs">
            <div>
              <span className="text-slate-400">Row 15: 0.5 (12:00 AM)</span>
              <p className="text-[11px] text-slate-300 font-sans">So Jaaunga (Fixed Bedtime Anchor)</p>
            </div>
            <Badge variant="neutral" size="sm">Confirmed</Badge>
          </div>
        </div>
      ),
    },
  ];

  const current = slides[activeSlide];

  return (
    <section className="py-24 relative bg-[#0A0B0E] border-t border-white/[0.08]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Interactive Interface Walkthrough</span>
            </div>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white">
              {current.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">{current.subtitle}</p>
          </div>

          {/* Slider Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1))}
              className="p-2 rounded-lg bg-[#14171F] border border-white/[0.08] text-slate-400 hover:text-white hover:border-cyan-500/30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0))}
              className="p-2 rounded-lg bg-[#14171F] border border-white/[0.08] text-slate-400 hover:text-white hover:border-cyan-500/30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Display Container */}
        <div className="rounded-2xl p-6 sm:p-8 bg-[#0F1218] border border-white/[0.1] shadow-2xl relative min-h-[320px] flex flex-col justify-center">
          <div className="absolute top-4 right-4">
            <Badge variant="cyan" size="sm">
              {current.badge}
            </Badge>
          </div>
          {current.content}
        </div>
      </div>
    </section>
  );
};
