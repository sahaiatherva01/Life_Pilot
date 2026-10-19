import React from 'react';
import { 
  Compass, 
  FileSpreadsheet, 
  BellRing, 
  Bot, 
  Sun, 
  Moon, 
  ArrowRight, 
  ShieldCheck, 
  Laptop, 
  Smartphone, 
  Zap, 
  Flame, 
  CheckCircle2 
} from 'lucide-react';
import { sound } from '../utils/audio';

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenImport: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onOpenImport }) => {
  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section style={{
        maxWidth: '1140px',
        margin: '40px auto 60px',
        padding: '0 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Futuristic Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 242, 254, 0.08)',
          border: '1px solid var(--border-highlight)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 16px',
          fontSize: '0.8rem',
          color: 'var(--neon-cyan)',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          marginBottom: '24px',
          boxShadow: 'var(--shadow-glow-cyan)',
        }}>
          <Compass size={14} />
          <span>AUTONOMOUS LIFE OPERATING SYSTEM</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(2.5rem, 6vw, 4.2rem)',
          fontWeight: 900,
          lineHeight: 1.08,
          letterSpacing: '-1.5px',
          maxWidth: '880px',
          marginBottom: '20px',
        }}>
          Transform Your Routine Spreadsheet Into An <span className="neon-gradient-text">Unstoppable Daily Reality</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '680px',
          lineHeight: 1.6,
          marginBottom: '36px',
        }}>
          LifePilot ingests your <strong>Guide.xlsx</strong>, generates an exact calendar, fires relentless alarms that repeat until actioned, and lets you reshape your day simply by talking to <strong>Orion AI</strong>.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn-primary"
            onClick={() => { sound.playClick(); onLaunchApp(); }}
            style={{ padding: '14px 32px', fontSize: '1.05rem' }}
          >
            <span>Launch LifePilot OS</span>
            <ArrowRight size={18} />
          </button>

          <button
            className="btn-secondary"
            onClick={() => { sound.playClick(); onOpenImport(); }}
            style={{ padding: '14px 28px', fontSize: '1.05rem' }}
          >
            <FileSpreadsheet size={18} color="var(--neon-cyan)" />
            <span>Upload Guide.xlsx</span>
          </button>
        </div>

        {/* Live Interactive UI Mockup Card */}
        <div className="glass-panel" style={{
          width: '100%',
          maxWidth: '900px',
          marginTop: '60px',
          padding: '28px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(0, 242, 254, 0.25)',
          background: 'linear-gradient(180deg, rgba(18, 20, 26, 0.95) 0%, rgba(10, 11, 14, 0.98) 100%)',
          textAlign: 'left',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 242, 254, 0.1)',
        }}>
          {/* Mockup Topbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '16px',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FF5F56' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FFBD2E' }} />
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27C93F' }} />
              <span style={{ marginLeft: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                lifepilot.local • Today's Active Orbit
              </span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: 'var(--neon-emerald)',
              fontWeight: 700,
            }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-emerald)', boxShadow: '0 0 8px var(--neon-emerald)' }} />
              <span>Orion AI Active (Qwen 2.5 3B)</span>
            </div>
          </div>

          {/* Sample Blocks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Block 1 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              background: 'rgba(0, 245, 160, 0.04)',
              borderLeft: '4px solid var(--cat-fitness)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-fitness)', fontWeight: 700 }}>FITNESS</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Gym + High Intensity Workout
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>06:15 - 07:30 (75 mins)</span>
              </div>
              <span style={{
                background: 'rgba(0, 245, 160, 0.15)',
                color: 'var(--neon-emerald)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}>
                ✓ COMPLETED
              </span>
            </div>

            {/* Block 2 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              background: 'rgba(0, 242, 254, 0.08)',
              borderLeft: '4px solid var(--cat-study)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--cat-study)', fontWeight: 700 }}>STUDY</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  DSA + Handwritten Notes
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>08:00 - 09:30 (90 mins)</span>
              </div>
              <span style={{
                background: 'rgba(0, 242, 254, 0.15)',
                color: 'var(--neon-cyan)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--neon-cyan)',
              }}>
                ▶ IN PROGRESS
              </span>
            </div>

            {/* Block 3 - Orion shift chip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              background: 'rgba(121, 40, 202, 0.08)',
              borderLeft: '4px solid var(--cat-projects)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#9B51E0', fontWeight: 700 }}>PROJECTS</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  LifePilot AI System Architecture
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>12:00 - 13:30 (Shifted by Orion)</span>
              </div>
              <span style={{
                background: 'rgba(255, 159, 67, 0.15)',
                color: 'var(--neon-amber)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}>
                PENDING
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pillars Section */}
      <section style={{ maxWidth: '1100px', margin: '40px auto 60px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 800 }}>
            Engineered For Zero Friction
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '8px' }}>
            Four pillars designed to enforce momentum and eliminate decision fatigue.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
        }}>
          {/* Pillar 1 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(0, 242, 254, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <FileSpreadsheet size={22} color="var(--neon-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
              Guide.xlsx Ingestion
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Upload your spreadsheet once. LifePilot parses time ranges, infers categories, splits <code>+</code> into subtasks, and generates daily recurring templates.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(255, 51, 102, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <BellRing size={22} color="#FF3366" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
              Relentless Exact Alarms
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              No silent notifications. Exact system alarms repeat until you explicitly hit Start, Snooze 10m, or Complete. Works with the app closed on Android and macOS.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(121, 40, 202, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Bot size={22} color="#9B51E0" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
              Orion On-Device AI
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Say: <em>"shift gym to 7 PM"</em>. Orion checks conflicts, moves the block, updates related alarms, and replies with confirmation. 100% private, running locally via Ollama.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(255, 159, 67, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Sun size={22} color="var(--neon-amber)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '8px' }}>
              Circadian Briefings
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>7:00 AM:</strong> Kickoff agenda of today's priorities.<br />
              <strong>11:30 PM:</strong> Day review, adherence score, and bedtime prep for tomorrow.
            </p>
          </div>
        </div>
      </section>

      {/* Single Shared Codebase Callout */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px' }}>
        <div className="glass-panel" style={{
          padding: '36px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(24, 27, 36, 0.8) 100%)',
          border: '1px solid rgba(0, 242, 254, 0.2)',
        }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, marginBottom: '12px' }}>
            One Shared Codebase • macOS & Android
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
            Wrapped cleanly by Capacitor (.apk) and Electron (.dmg). Runs on your 16GB Mac with PostgreSQL 17 and local Qwen 2.5 3B with zero cloud subscriptions.
          </p>
          <button
            className="btn-primary"
            onClick={() => { sound.playClick(); onLaunchApp(); }}
            style={{ padding: '12px 28px' }}
          >
            <span>Enter LifePilot OS</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};
