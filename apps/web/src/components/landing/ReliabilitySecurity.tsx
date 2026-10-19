import React from 'react';
import {
  Database,
  Lock,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { Badge, Card } from '@lifepilot/ui';

export const ReliabilitySecurity: React.FC = () => {
  return (
    <section id="reliability" className="py-24 relative bg-[#0A0B0E] border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Mission-Critical Reliability</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight">
            An Assistant That Never Forgets an Alarm
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            "A system that makes brilliant scheduling recommendations but drops a wake-up alarm is useless."
            LifePilot is built on transactional outbox queues, persistent state machines, and private local inference.
          </p>
        </div>

        {/* Reliability Pillars Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Pillar 1: State Machine */}
          <Card className="p-6 border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-2">
                Persistent State Machine
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                A reminder is never a client-side timer. Every reminder lives in PostgreSQL and transitions through explicit states. Delivery is never assumed to be user acknowledgement.
              </p>

              {/* State Machine Flow Diagram */}
              <div className="space-y-2 p-3 rounded-xl bg-[#0F1218] border border-white/[0.06] font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>1. PENDING</span>
                  <span className="text-cyan-400">Scheduled in DB</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>2. PROCESSING</span>
                  <span className="text-amber-400">Celery Lock Claimed</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>3. DELIVERED</span>
                  <span className="text-blue-400">Device Push Accepted</span>
                </div>
                <div className="flex items-center justify-between text-slate-200 font-semibold border-t border-white/[0.06] pt-1.5">
                  <span>4. ACKNOWLEDGED</span>
                  <span className="text-emerald-400">User Took Action</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-slate-500 font-mono">
              Recovers automatically after server reboots
            </div>
          </Card>

          {/* Pillar 2: Private AI Architecture */}
          <Card className="p-6 border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-2">
                100% Self-Hosted & Private
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Zero external LLM API fees or privacy leaks. Orion runs on your laptop over Tailscale mesh. If the laptop is asleep, every deterministic feature keeps running uninterrupted.
              </p>

              <div className="space-y-2 p-3 rounded-xl bg-[#0F1218] border border-white/[0.06] font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span>No Cloud LLM Calls</span>
                  <Badge variant="success" size="sm">Guaranteed</Badge>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Tailscale Mesh VPN</span>
                  <Badge variant="cyan" size="sm">Encrypted</Badge>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Monthly AI API Cost</span>
                  <span className="text-emerald-400 font-bold">$0.00 / mo</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-slate-500 font-mono">
              Prompt-injection defense on all imported files
            </div>
          </Card>

          {/* Pillar 3: Transactional Outbox */}
          <Card className="p-6 border-white/[0.08] flex flex-col justify-between">
            <div>
              <div className="h-10 w-10 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-lg text-white mb-2">
                Atomic DB & Outbox Integrity
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Completing a task is an atomic single-transaction operation: updates task state, appends the immutable event log, and atomically revokes pending repeat alerts.
              </p>

              <div className="space-y-2 p-3 rounded-xl bg-[#0F1218] border border-white/[0.06] font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Idempotency Keys</span>
                  <span className="text-cyan-400">UUIDv4 Guarded</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Optimistic Concurrency</span>
                  <span className="text-cyan-400">ETag / Revision</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Audit Trail</span>
                  <span className="text-cyan-400">Full Actor Logging</span>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.06] text-[11px] text-slate-500 font-mono">
              Never overwrites conflicting edits silently
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
