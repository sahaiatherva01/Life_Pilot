import React, { useState } from 'react';
import { Sparkles, X, Send } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { CommandPalette } from '../command/CommandPalette';
import { Button } from '@lifepilot/ui';

export interface AppShellProps {
  children: React.ReactNode;
  activeScreen: string;
  onNavigate: (screen: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeScreen,
  onNavigate,
}) => {
  const [orionModalOpen, setOrionModalOpen] = useState(false);
  const [orionInput, setOrionInput] = useState('');
  const [orionMessages, setOrionMessages] = useState<Array<{ role: 'user' | 'orion'; content: string }>>([
    {
      role: 'orion',
      content:
        'Greetings! I am Orion, running locally on your laptop (Qwen2.5-3B). Your daily schedule is active in Asia/Kolkata. How can I help you calibrate your tasks today?',
    },
  ]);

  const screenTitles: Record<string, string> = {
    today: "Today's Live Timeline",
    calendar: 'Unified Calendar & Fixed Events',
    tasks: 'Smart Task Management',
    planner: 'Night Planning & Schedule Review',
    reminders: 'Persistent Reminder State Machine',
    focus: 'Focus Mode & Session Timers',
    orion: 'Orion AI Command Centre',
    imports: 'Guide.xlsx Spreadsheet Review',
    analytics: 'Performance & Behavioral Analytics',
    settings: 'System & Hardware Settings',
  };

  const handleSendOrion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orionInput.trim()) return;

    const query = orionInput;
    setOrionMessages((prev) => [...prev, { role: 'user', content: query }]);
    setOrionInput('');

    // Rule-based instant reply + thinking simulation
    setTimeout(() => {
      let reply = `Understood: "${query}". I have checked your active constraints. No conflicts detected with your fixed commitments.`;
      if (query.toLowerCase().includes('dsa') || query.toLowerCase().includes('practice')) {
        reply = 'I found your DSA handwritten practice session scheduled for 09:00 AM. Estimated 90 minutes. I will suppress notifications once you begin.';
      } else if (query.toLowerCase().includes('briefing')) {
        reply = 'Your 07:00 AM briefing is pre-compiled. Top 3 priorities today: (1) DSA Handwritten Research, (2) Project Learn_Mind Push, (3) Gym Session.';
      }
      setOrionMessages((prev) => [...prev, { role: 'orion', content: reply }]);
    }, 400);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0B0E] text-slate-100 cyber-grid">
      <Sidebar activeScreen={activeScreen} onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={screenTitles[activeScreen] || 'Dashboard'}
          onOpenOrion={() => setOrionModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6 relative">{children}</main>
      </div>

      <CommandPalette onNavigate={onNavigate} />

      {/* Persistent Floating Orion Button */}
      <button
        onClick={() => setOrionModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-[0_0_28px_rgba(121,40,202,0.6)] hover:shadow-[0_0_36px_rgba(121,40,202,0.85)] hover:scale-105 active:scale-95 transition-all border border-purple-300/40"
        title="Invoke Orion (Alt+O)"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

      {/* Orion Quick Chat Overlay */}
      {orionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-150">
          <div className="w-full sm:max-w-lg bg-[#14171F] border border-purple-500/40 rounded-t-2xl sm:rounded-2xl shadow-[0_0_60px_rgba(121,40,202,0.3)] flex flex-col h-[520px] overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] bg-[#0F1218] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(121,40,202,0.4)]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm text-white">Orion Intelligence</h3>
                  <span className="text-[10px] text-purple-300 font-mono">Local Qwen2.5-3B · Deterministic Engine</span>
                </div>
              </div>
              <button
                onClick={() => setOrionModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {orionMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3.5 py-2.5 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-cyan-950/70 text-cyan-100 border border-cyan-500/30'
                        : 'bg-[#1B202B] text-slate-200 border border-purple-500/20 shadow-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Command Input Form */}
            <form
              onSubmit={handleSendOrion}
              className="p-3 border-t border-white/[0.08] bg-[#0F1218] flex items-center gap-2"
            >
              <input
                value={orionInput}
                onChange={(e) => setOrionInput(e.target.value)}
                placeholder="Give Orion a command or ask a question..."
                className="flex-1 bg-[#14171F] border border-white/[0.1] rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40"
                autoFocus
              />
              <Button type="submit" variant="orion" size="sm" rightIcon={<Send className="w-3.5 h-3.5" />}>
                Send
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
