import React from 'react';
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export interface TopBarProps {
  title: string;
  onOpenOrion?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ title, onOpenOrion }) => {
  const { toggleSidebar, setCommandPaletteOpen, theme, toggleTheme } = useUIStore();

  return (
    <header className="h-16 px-6 border-b border-white/[0.08] bg-[#0A0B0E]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Sidebar Toggle & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#14171F] transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">/</span>
          <h1 className="font-display font-semibold text-base text-slate-100 tracking-wide">
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#14171F] border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-cyan-500/30 transition-all text-xs w-72"
      >
        <Search className="w-3.5 h-3.5 text-cyan-400" />
        <span className="flex-1 text-left">Quick actions or ask Orion...</span>
        <kbd className="px-1.5 py-0.5 rounded bg-[#0F1218] border border-white/[0.1] text-[10px] font-mono text-slate-400">
          ⌘K
        </kbd>
      </button>

      {/* Right: Orion Status, Theme, Notifications */}
      <div className="flex items-center gap-3">
        {/* Orion Status Pill */}
        <div
          onClick={onOpenOrion}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-medium cursor-pointer hover:bg-purple-900/40 transition-all shadow-[0_0_12px_rgba(121,40,202,0.2)]"
          title="Click to interact with Orion AI"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="hidden sm:inline font-mono text-[11px]">Orion: Qwen2.5-3B (Local)</span>
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#14171F] transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </button>

        {/* Notifications */}
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#14171F] transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400 ring-2 ring-[#0A0B0E]" />
        </button>
      </div>
    </header>
  );
};
