import {
  Boxes,
  Cpu,
  Database,
  Globe,
  Smartphone,
  Workflow,
  Zap,
} from 'lucide-react';

export const Architecture: React.FC = () => {
  const stackBadges = [
    { category: 'Frontend', items: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', '@lifepilot/ui', 'Zustand', 'Framer Motion'] },
    { category: 'Backend', items: ['Python 3.11', 'FastAPI', 'Pydantic v2', 'SQLAlchemy 2', 'Alembic', 'Argon2id'] },
    { category: 'Data & Jobs', items: ['PostgreSQL 16', 'Redis 7', 'Celery Workers', 'Transactional Outbox'] },
    { category: 'AI & Inference', items: ['Qwen2.5-3B (4-bit)', 'Ollama / llama-cpp', 'Apple Silicon Metal', 'Regex Rule Parsers'] },
  ];

  return (
    <section id="architecture" className="py-24 relative bg-[#0F1218]/50 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-3">
            <Boxes className="w-4 h-4 text-cyan-400" />
            <span>Engineering Architecture</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight">
            Compact Modular Monolith
          </h2>
          <p className="mt-4 text-slate-400 text-sm">
            Designed for rock-solid maintainability: clean separation between clients, application logic, and private local model execution.
          </p>
        </div>

        {/* Visual Architecture Topology Diagram */}
        <div className="w-full max-w-4xl mx-auto mb-16 p-6 rounded-2xl bg-[#0A0B0E] border border-white/[0.08] shadow-2xl relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Top Tier: Clients */}
            <div className="p-4 rounded-xl bg-[#14171F] border border-cyan-500/30 flex flex-col items-center">
              <Globe className="w-6 h-6 text-cyan-400 mb-2" />
              <h4 className="font-semibold text-sm text-white">Web Client</h4>
              <span className="text-[11px] text-slate-400 font-mono">React 18 + Vite SPA</span>
            </div>
            <div className="p-4 rounded-xl bg-[#14171F] border border-cyan-500/30 flex flex-col items-center">
              <Smartphone className="w-6 h-6 text-cyan-400 mb-2" />
              <h4 className="font-semibold text-sm text-white">Mobile Client</h4>
              <span className="text-[11px] text-slate-400 font-mono">React Native + Expo (Android)</span>
            </div>
            <div className="p-4 rounded-xl bg-[#14171F] border border-purple-500/30 flex flex-col items-center">
              <Cpu className="w-6 h-6 text-purple-400 mb-2" />
              <h4 className="font-semibold text-sm text-white">Orion Local Node</h4>
              <span className="text-[11px] text-purple-300 font-mono">Tailscale Mesh (Apple Silicon)</span>
            </div>
          </div>

          {/* Middle Tier: FastAPI Core Engine */}
          <div className="my-6 p-5 rounded-xl bg-[#1B202B]/90 border border-white/[0.12] text-center shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h4 className="font-display font-bold text-base text-white">
                FastAPI Unified Monolith Core (/api/v1)
              </h4>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-slate-300 max-w-2xl mx-auto pt-2">
              <span className="p-1.5 rounded bg-black/40 border border-white/[0.06]">Deterministic Planner</span>
              <span className="p-1.5 rounded bg-black/40 border border-white/[0.06]">Reminder State Machine</span>
              <span className="p-1.5 rounded bg-black/40 border border-white/[0.06]">Orion Policy Guard</span>
              <span className="p-1.5 rounded bg-black/40 border border-white/[0.06]">Calendar Sync Engine</span>
            </div>
          </div>

          {/* Bottom Tier: Storage & Worker Mesh */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
            <div className="p-4 rounded-xl bg-[#14171F] border border-white/[0.08] flex flex-col items-center">
              <Database className="w-6 h-6 text-cyan-400 mb-2" />
              <h4 className="font-semibold text-sm text-white">PostgreSQL 16</h4>
              <span className="text-[11px] text-slate-400 font-mono">Authoritative State · TIMESTAMPTZ · FTS</span>
            </div>
            <div className="p-4 rounded-xl bg-[#14171F] border border-white/[0.08] flex flex-col items-center">
              <Workflow className="w-6 h-6 text-amber-400 mb-2" />
              <h4 className="font-semibold text-sm text-white">Redis 7 + Celery Workers</h4>
              <span className="text-[11px] text-slate-400 font-mono">Persistent Alarm Scheduling & Recovery Checks</span>
            </div>
          </div>
        </div>

        {/* Tech Stack Badges Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stackBadges.map((badge, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-[#14171F] border border-white/[0.08]">
              <h4 className="font-mono text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-3">
                {badge.category}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {badge.items.map((it, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-md bg-black/40 text-slate-300 border border-white/[0.06] font-mono"
                  >
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
