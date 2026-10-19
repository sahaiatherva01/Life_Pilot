import React from 'react';
import {
  Calendar,
  CheckSquare,
  Clock,
  Compass,
  FileSpreadsheet,
  Layers,
  LogOut,
  Sliders,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

export interface SidebarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeScreen, onNavigate }) => {
  const { sidebarCollapsed } = useUIStore();
  const { user, logout } = useAuthStore();

  const navItems = [
    { id: 'today', label: 'Today', icon: Clock, badge: 'Live' },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'planner', label: 'Planner', icon: Compass, badge: '23:30' },
    { id: 'reminders', label: 'Reminders', icon: Zap },
    { id: 'focus', label: 'Focus Mode', icon: Target },
    { id: 'orion', label: 'Orion Assistant', icon: Sparkles, highlight: true },
    { id: 'imports', label: 'Guide.xlsx Import', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Analytics', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-white/[0.08] bg-[#0A0B0E]/95 backdrop-blur-xl transition-all duration-300 z-30 select-none ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.08]">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_18px_rgba(0,242,254,0.35)] shrink-0">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-wide text-white">
              LifePilot
            </span>
            <span className="text-[10px] text-cyan-400 font-mono tracking-wider">
              ORION OS v0.1
            </span>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? item.highlight
                    ? 'bg-purple-950/50 text-purple-300 border border-purple-500/40 shadow-[0_0_15px_rgba(121,40,202,0.25)]'
                    : 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,242,254,0.18)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#14171F]'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive
                    ? item.highlight
                      ? 'text-purple-400'
                      : 'text-cyan-400'
                    : 'text-slate-400'
                }`}
              />
              {!sidebarCollapsed && (
                <span className="truncate flex-1 text-left">{item.label}</span>
              )}
              {!sidebarCollapsed && item.badge && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0F1218]/60">
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#14171F]/80 border border-white/[0.06]">
          <div className="flex items-center gap-2.5 truncate">
            <div className="h-7 w-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-cyan-400 shrink-0">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col truncate text-left">
                <span className="text-xs font-medium text-slate-200 truncate">
                  {user?.full_name || 'Owner'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate">
                  {user?.timezone || 'Asia/Kolkata'}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-colors shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
