import React from 'react';
import { Sparkles, Moon, Sun, ArrowRight, Github } from 'lucide-react';
import { Button } from '@lifepilot/ui';
import { useUIStore } from '@/stores/uiStore';

export interface NavbarProps {
  onOpenApp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenApp }) => {
  const { theme, toggleTheme } = useUIStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#0A0B0E]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,254,0.35)] shrink-0">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-wide text-white">
              LifePilot
            </span>
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider -mt-1">
              ORION OS
            </span>
          </div>
        </div>

        {/* Anchor Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <a href="#hero" className="hover:text-cyan-400 transition-colors">
            Overview
          </a>
          <a href="#orion" className="hover:text-purple-400 transition-colors">
            Meet Orion
          </a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">
            Features
          </a>
          <a href="#timeline" className="hover:text-cyan-400 transition-colors">
            A Day with LifePilot
          </a>
          <a href="#reliability" className="hover:text-cyan-400 transition-colors">
            Reliability
          </a>
          <a href="#architecture" className="hover:text-cyan-400 transition-colors">
            Architecture
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors hidden sm:inline-flex"
            title="View Source on GitHub"
          >
            <Github className="w-4 h-4" />
          </a>

          <Button
            variant="glow"
            size="sm"
            onClick={onOpenApp}
            rightIcon={<ArrowRight className="w-3.5 h-3.5 text-black" />}
          >
            Launch System
          </Button>
        </div>
      </div>
    </header>
  );
};
