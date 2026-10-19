import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Github, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Does LifePilot depend on an OpenAI or cloud LLM subscription?',
      a: 'No. Orion runs completely on your laptop using small, quantised open-weight models (such as Qwen2.5-3B) with CPU/Metal inference. Monthly AI API cost is $0.00, and your personal routines never leave your control.',
    },
    {
      q: 'What happens when my laptop is asleep or offline?',
      a: 'LifePilot gracefully shows an "Orion Offline" badge, and every single deterministic feature (alarms, scheduling engine, task actions, calendar viewing) continues operating normally without interruptions.',
    },
    {
      q: 'Can Orion silently modify or delete my fixed exams or meetings?',
      a: 'Never. Fixed commitments have mathematical protection in the scheduling engine. Orion can propose shifts to flexible coding/study blocks, but protected changes always require explicit user approval.',
    },
    {
      q: 'How does the persistent reminder state machine differ from phone notifications?',
      a: 'Ordinary mobile push alerts fire once and disappear. LifePilot tracks delivery status in PostgreSQL, escalating and repeating alerts until explicit acknowledgement or completion occurs.',
    },
  ];

  return (
    <footer className="border-t border-white/[0.08] bg-[#0A0B0E] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-20">
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-[#14171F] border border-white/[0.08] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between text-sm font-semibold text-slate-100 hover:text-cyan-300 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.08] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-cyan-500 flex items-center justify-center text-black">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-display font-bold text-slate-300">LifePilot</span>
            <span>— The Autonomous Personal Life OS</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1.5"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub Repository</span>
            </a>
            <span className="text-slate-600">·</span>
            <span>Single-Owner Architecture</span>
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400 font-mono">Asia/Kolkata</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
