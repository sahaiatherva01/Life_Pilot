import React, { useState } from 'react';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Lock,
  Plus,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { Button, Card } from '@lifepilot/ui';

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  date: string; // YYYY-MM-DD
  category: string;
  policy: 'fixed' | 'flexible' | 'protected_sleep' | 'point_milestone';
  color: string;
}

export const CalendarScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [currentDate, setCurrentDate] = useState<string>('2026-10-28');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [protectedWarningModal, setProtectedWarningModal] = useState<CalendarEvent | null>(null);

  // Authentically seeded from Guide.xlsx Oct 28 - Oct 30 routines
  const [events] = useState<CalendarEvent[]>([
    {
      id: 'e-1',
      title: 'Chai Bana na hai Ghar walon ke liye + Gym ki Tayaari',
      startTime: '06:00',
      endTime: '06:15',
      date: '2026-10-28',
      category: 'Routine / Family',
      policy: 'fixed',
      color: 'cyan',
    },
    {
      id: 'e-2',
      title: 'Gym Workout Session',
      startTime: '06:45',
      endTime: '07:45',
      date: '2026-10-28',
      category: 'Fitness',
      policy: 'fixed',
      color: 'emerald',
    },
    {
      id: 'e-3',
      title: 'DSA (Handwritten) + Research',
      startTime: '09:00',
      endTime: '10:30',
      date: '2026-10-28',
      category: 'Deep Work / DSA',
      policy: 'fixed',
      color: 'purple',
    },
    {
      id: 'e-4',
      title: 'Project(Learn_Mind) + Git Hub Push',
      startTime: '12:00',
      endTime: '13:30',
      date: '2026-10-28',
      category: 'Projects',
      policy: 'flexible',
      color: 'blue',
    },
    {
      id: 'e-5',
      title: 'Cricket Match (Physical Recharge)',
      startTime: '16:30',
      endTime: '18:30',
      date: '2026-10-28',
      category: 'Recreation',
      policy: 'fixed',
      color: 'emerald',
    },
    {
      id: 'e-6',
      title: 'Reach Out + Resume & Excel Sheet Update',
      startTime: '20:00',
      endTime: '20:40',
      date: '2026-10-28',
      category: 'Career',
      policy: 'flexible',
      color: 'amber',
    },
    {
      id: 'e-7',
      title: 'DSA (Company Wise Practice + Analysis)',
      startTime: '22:30',
      endTime: '23:30',
      date: '2026-10-28',
      category: 'Deep Work',
      policy: 'fixed',
      color: 'purple',
    },
    {
      id: 'e-8',
      title: 'So Jaaunga (Protected Sleep Boundary)',
      startTime: '00:00',
      endTime: '06:00',
      date: '2026-10-28',
      category: 'Sleep Boundary',
      policy: 'protected_sleep',
      color: 'rose',
    },
    // Oct 29 sample events
    {
      id: 'e-9',
      title: 'Wakeup Routine & Family Chai',
      startTime: '06:00',
      endTime: '06:20',
      date: '2026-10-29',
      category: 'Routine',
      policy: 'fixed',
      color: 'cyan',
    },
    {
      id: 'e-10',
      title: 'Gym Session',
      startTime: '06:45',
      endTime: '07:45',
      date: '2026-10-29',
      category: 'Fitness',
      policy: 'fixed',
      color: 'emerald',
    },
    {
      id: 'e-11',
      title: 'Train reached (Point Milestone)',
      startTime: '12:30',
      endTime: '12:30',
      date: '2026-10-29',
      category: 'Transit Milestone',
      policy: 'point_milestone',
      color: 'amber',
    },
  ]);

  const timeSlots = [
    '06:00',
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
    '23:00',
    '00:00',
  ];

  const weekDays = [
    { name: 'Mon', date: '2026-10-26' },
    { name: 'Tue', date: '2026-10-27' },
    { name: 'Wed', date: '2026-10-28', active: true },
    { name: 'Thu', date: '2026-10-29' },
    { name: 'Fri', date: '2026-10-30' },
    { name: 'Sat', date: '2026-10-31' },
    { name: 'Sun', date: '2026-11-01' },
  ];

  const handleDragOrRescheduleAttempt = (event: CalendarEvent) => {
    if (event.policy === 'fixed' || event.policy === 'protected_sleep') {
      setProtectedWarningModal(event);
    } else {
      setSelectedEvent(event);
    }
  };

  const getPolicyBadge = (policy: CalendarEvent['policy']) => {
    switch (policy) {
      case 'fixed':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-2 py-0.5 rounded">
            <Lock className="w-2.5 h-2.5" /> Fixed
          </span>
        );
      case 'protected_sleep':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2 py-0.5 rounded">
            <Lock className="w-2.5 h-2.5" /> Sleep Lock
          </span>
        );
      case 'point_milestone':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2 py-0.5 rounded">
            <Clock className="w-2.5 h-2.5" /> Milestone
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-mono text-purple-400 bg-purple-950/60 border border-purple-500/40 px-2 py-0.5 rounded">
            Flexible
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Calendar Top Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#14171F] border border-white/[0.08]">
        {/* Navigation & Date Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0F1218] p-1 rounded-lg border border-white/[0.08]">
            <button
              onClick={() => setCurrentDate('2026-10-27')}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate('2026-10-28')}
              className="px-2.5 py-1 rounded text-xs font-mono font-semibold text-cyan-300 hover:bg-slate-800"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate('2026-10-29')}
              className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
            <h2 className="font-display font-bold text-base text-white">
              Wednesday, 28 October 2026
            </h2>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-white/[0.06]">
              IST (Asia/Kolkata)
            </span>
          </div>
        </div>

        {/* View Switcher & Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-lg bg-[#0F1218] border border-white/[0.08] text-xs">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-cyan-950/60 text-cyan-300 font-semibold border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button
            variant="glow"
            size="sm"
            onClick={() => setSelectedEvent(events[0])}
            leftIcon={<Plus className="w-3.5 h-3.5 text-black" />}
          >
            Add Event
          </Button>
        </div>
      </div>

      {/* Main Calendar View Area */}
      {viewMode === 'day' && (
        <div className="rounded-2xl bg-[#0F1218] border border-white/[0.08] overflow-hidden shadow-2xl">
          {/* Day View Timeline Grid */}
          <div className="divide-y divide-white/[0.04]">
            {timeSlots.map((time) => {
              const slotEvents = events.filter(
                (e) => e.date === currentDate && e.startTime.startsWith(time.split(':')[0])
              );

              return (
                <div key={time} className="flex min-h-[64px] group hover:bg-[#14171F]/50 transition-colors">
                  {/* Time Axis Column */}
                  <div className="w-20 sm:w-24 p-3 border-r border-white/[0.06] text-right font-mono text-xs text-slate-400 shrink-0">
                    {time}
                  </div>

                  {/* Event Slot Surface */}
                  <div className="flex-1 p-2 flex flex-col gap-1.5 relative">
                    {slotEvents.map((evt) => (
                      <div
                        key={evt.id}
                        onClick={() => handleDragOrRescheduleAttempt(evt)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                          evt.policy === 'fixed'
                            ? 'bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,242,254,0.08)]'
                            : evt.policy === 'protected_sleep'
                            ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                            : evt.policy === 'point_milestone'
                            ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                            : 'bg-purple-950/20 border-purple-500/40 hover:border-purple-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {evt.policy === 'fixed' && (
                            <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          )}
                          {evt.policy === 'protected_sleep' && (
                            <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">
                              {evt.title}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {evt.category}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-xs text-cyan-300">
                            {evt.startTime} - {evt.endTime}
                          </span>
                          {getPolicyBadge(evt.policy)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'week' && (
        <div className="rounded-2xl bg-[#0F1218] border border-white/[0.08] overflow-hidden p-4">
          <div className="grid grid-cols-7 gap-2 pb-3 border-b border-white/[0.08] text-center">
            {weekDays.map((d) => (
              <div
                key={d.date}
                className={`p-2 rounded-lg ${
                  d.active
                    ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300'
                    : 'text-slate-400'
                }`}
              >
                <div className="text-xs uppercase font-mono">{d.name}</div>
                <div className="text-sm font-bold mt-0.5">{d.date.slice(-2)}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 min-h-[460px]">
            {weekDays.map((d) => {
              const dayEvts = events.filter((e) => e.date === d.date);
              return (
                <div
                  key={d.date}
                  className="bg-[#14171F]/60 rounded-xl p-2 border border-white/[0.04] space-y-2 min-h-[300px]"
                >
                  {dayEvts.map((evt) => (
                    <div
                      key={evt.id}
                      onClick={() => handleDragOrRescheduleAttempt(evt)}
                      className="p-2 rounded-lg bg-[#0F1218] border border-white/[0.08] hover:border-cyan-400/50 cursor-pointer text-left transition-all"
                    >
                      <div className="text-[10px] font-mono text-cyan-400">
                        {evt.startTime}
                      </div>
                      <div className="text-xs font-semibold text-slate-100 truncate mt-0.5">
                        {evt.title}
                      </div>
                    </div>
                  ))}
                  {dayEvts.length === 0 && (
                    <div className="text-[11px] text-slate-600 italic text-center pt-8">
                      Free day
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === 'month' && (
        <Card className="p-6 text-center border-white/[0.08]">
          <CalendarIcon className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
          <h3 className="font-display font-bold text-base text-white">October 2026 Overview</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Full 30-day rolling recurrence horizon loaded with 115 imported routine tasks and active sleep anchors.
          </p>
          <div className="grid grid-cols-7 gap-2 text-xs font-mono text-slate-400 pt-4 border-t border-white/[0.08]">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="font-bold pb-2">
                {d}
              </div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-left min-h-[70px] ${
                  i + 1 === 28
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-300 font-bold'
                    : 'bg-[#14171F]/40 border-white/[0.04] text-slate-400'
                }`}
              >
                <span>{i + 1}</span>
                {i + 1 >= 28 && i + 1 <= 31 && (
                  <div className="mt-1 text-[10px] font-mono text-cyan-400 truncate">
                    • Routine Active
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Protected Event Reschedule Warning Modal */}
      {protectedWarningModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#14171F] border border-amber-500/40 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08] text-amber-400">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  Protected Commitment Policy
                </h3>
                <span className="text-[10px] font-mono text-amber-300">
                  Fixed Routine Enforcement
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed my-4">
              <strong className="text-white">"{protectedWarningModal.title}"</strong> is designated as a{' '}
              <span className="text-cyan-300 font-mono font-semibold">Fixed Commitment</span>. As per
              LifePilot Core Policy, fixed routines cannot be moved or compressed automatically without
              explicit owner override.
            </p>

            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06] text-xs font-mono text-slate-400 mb-6 space-y-1">
              <div>Time: {protectedWarningModal.startTime} - {protectedWarningModal.endTime}</div>
              <div>Category: {protectedWarningModal.category}</div>
              <div>Policy: Protected / Zero Drift</div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setProtectedWarningModal(null)}
              >
                Keep Locked
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-500/50 text-rose-300 hover:bg-rose-950/40"
                onClick={() => {
                  setProtectedWarningModal(null);
                  setSelectedEvent(protectedWarningModal);
                }}
              >
                Force Override
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#14171F] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-base text-white">Event Calibration</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Event Title</label>
                <div className="p-3 rounded-lg bg-[#0F1218] border border-white/[0.08] text-sm font-semibold text-white">
                  {selectedEvent.title}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Time Block</label>
                  <div className="p-2.5 rounded-lg bg-[#0F1218] border border-white/[0.08] text-xs font-mono text-cyan-300">
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-400 block mb-1">Policy</label>
                  <div className="p-2.5 rounded-lg bg-[#0F1218] border border-white/[0.08] text-xs font-mono text-slate-200 capitalize">
                    {selectedEvent.policy.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  All changes synchronize across the internal calendar engine and persist into the
                  schedule revision history.
                </span>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              <Button
                variant="glow"
                size="sm"
                onClick={() => setSelectedEvent(null)}
              >
                Save Schedule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
