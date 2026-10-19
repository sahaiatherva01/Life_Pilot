import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import {
  Calendar,
  CheckSquare,
  Clock,
  FileSpreadsheet,
  Moon,
  Search,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

export interface CommandPaletteProps {
  onNavigate?: (screen: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onNavigate }) => {
  const { commandPaletteOpen, setCommandPaletteOpen, toggleTheme, theme } = useUIStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const handleSelect = (action: () => void) => {
    action();
    setCommandPaletteOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        className="w-full max-w-xl bg-[#14171F] border border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(0,242,254,0.15)] overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <Command label="Global Command Palette">
          <div className="flex items-center px-4 border-b border-white/[0.08] bg-[#0F1218]">
            <Search className="w-4 h-4 text-cyan-400 mr-2 shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or ask Orion..."
              className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-500 text-slate-100 font-sans"
              autoFocus
            />
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
              ESC
            </span>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2 text-sm">
            <Command.Empty className="py-6 text-center text-xs text-slate-500">
              No matching commands found.
            </Command.Empty>

            <Command.Group heading="Orion Intelligence" className="text-[11px] font-semibold text-purple-400 px-2 py-1.5 uppercase tracking-wider">
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate?.('orion'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-purple-950/40 hover:text-purple-200 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Talk to Orion ("What is my next priority?")</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate?.('briefing'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-purple-950/40 hover:text-purple-200 transition-colors"
              >
                <Zap className="w-4 h-4 text-purple-400" />
                <span>Trigger Instant 07:00 Morning Briefing</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Navigation" className="text-[11px] font-semibold text-cyan-400 px-2 py-1.5 uppercase tracking-wider mt-2">
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate?.('today'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-cyan-950/40 hover:text-cyan-200 transition-colors"
              >
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Today's Live Timeline</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate?.('calendar'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-cyan-950/40 hover:text-cyan-200 transition-colors"
              >
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Calendar & Fixed Commitments</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate?.('tasks'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-cyan-950/40 hover:text-cyan-200 transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-cyan-400" />
                <span>Task Manager & Subtasks</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onNavigate?.('imports'))}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-cyan-950/40 hover:text-cyan-200 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span>Review Guide.xlsx Imports</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Preferences & System" className="text-[11px] font-semibold text-slate-400 px-2 py-1.5 uppercase tracking-wider mt-2">
              <Command.Item
                onSelect={() => handleSelect(toggleTheme)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-800/60 hover:text-slate-100 transition-colors"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span>Switch to Light Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Switch to Obsidian Dark Theme</span>
                  </>
                )}
              </Command.Item>
            </Command.Group>
          </Command.List>

          <div className="flex items-center justify-between px-3 py-2 border-t border-white/[0.08] text-[11px] text-slate-500 bg-[#0F1218]">
            <div className="flex items-center gap-1.5">
              <span>Navigate with</span>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">↑</kbd>
              <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">↓</kbd>
            </div>
            <span>Press <kbd className="px-1 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">↵</kbd> to execute</span>
          </div>
        </Command>
      </div>
    </div>
  );
};
