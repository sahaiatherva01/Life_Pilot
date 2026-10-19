import React, { useEffect, useState } from 'react';
import { BellRing, Play, AlarmClockOff, CheckCircle2, Flame, Volume2, VolumeX, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Reminder } from '../types';
import { sound } from '../utils/audio';

interface AlarmModalProps {
  alarm: Reminder | null;
  totalAlarms?: number;
  onAction: (reminderId: string, action: 'start' | 'snooze' | 'complete' | 'dismiss', minutes?: number) => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({ alarm, totalAlarms = 1, onAction }) => {
  const [isMuted, setIsMuted] = useState(sound.isMuted());

  useEffect(() => {
    if (alarm) {
      sound.startAlarmLoop();
    } else {
      sound.stopAlarmLoop();
    }
    return () => {
      sound.stopAlarmLoop();
    };
  }, [alarm]);

  if (!alarm) return null;

  const handleToggleMute = () => {
    const newMuted = sound.toggleMute();
    setIsMuted(newMuted);
  };

  const handleStart = () => {
    sound.stopAlarmLoop();
    sound.playClick();
    onAction(alarm.id, 'start');
  };

  const handleSnooze = (minutes: number) => {
    sound.stopAlarmLoop();
    sound.playClick();
    onAction(alarm.id, 'snooze', minutes);
  };

  const handleDismiss = () => {
    sound.stopAlarmLoop();
    sound.playClick();
    onAction(alarm.id, 'dismiss');
  };

  const handleComplete = () => {
    sound.stopAlarmLoop();
    sound.playSuccess();
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {}
    onAction(alarm.id, 'complete');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(5, 7, 11, 0.88)',
      backdropFilter: 'blur(22px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div 
        className="alarm-pulsing glass-panel"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          padding: '36px 30px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          border: '1px solid rgba(255, 51, 102, 0.6)',
          background: 'linear-gradient(180deg, rgba(26, 29, 40, 0.98) 0%, rgba(10, 11, 14, 0.99) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          boxShadow: '0 0 60px rgba(255, 51, 102, 0.25)',
        }}
      >
        {/* Top bar: Multi-alarm counter & Audio Mute toggle */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '20px',
          right: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {totalAlarms > 1 ? (
            <span style={{
              fontSize: '0.75rem',
              fontFamily: 'var(--font-mono)',
              background: 'rgba(255, 51, 102, 0.2)',
              border: '1px solid #FF3366',
              color: '#FF3366',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
            }}>
              1 OF {totalAlarms} ALARMS ACTIVE
            </span>
          ) : <span />}

          <button
            onClick={handleToggleMute}
            style={{
              background: isMuted ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 51, 102, 0.15)',
              border: isMuted ? '1px solid var(--border-subtle)' : '1px solid #FF3366',
              color: isMuted ? 'var(--text-muted)' : '#FF3366',
              borderRadius: 'var(--radius-full)',
              padding: '5px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title={isMuted ? 'Unmute alarm sound' : 'Mute alarm sound'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isMuted ? 'MUTED' : 'RINGING'}</span>
          </button>
        </div>

        {/* Pulsing Alarm Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          marginTop: '10px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 51, 102, 0.35) 0%, rgba(255, 51, 102, 0.08) 70%)',
          border: '2px solid #FF3366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(255, 51, 102, 0.5)',
        }}>
          <BellRing size={42} color="#FF3366" />
        </div>

        <div>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '2.5px',
            color: '#FF3366',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
          }}>
            SCHEDULED TO-DO ALARM
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.85rem',
            fontWeight: 800,
            marginTop: '8px',
            color: 'var(--text-primary)',
            letterSpacing: '-0.5px',
          }}>
            {alarm.task_title}
          </h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '10px',
            padding: '5px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.06)',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
          }}>
            <Flame size={14} color="var(--neon-cyan)" />
            <span>Category: <strong style={{ color: 'var(--neon-cyan)' }}>{alarm.task_category}</strong></span>
            {alarm.snooze_count > 0 && (
              <span style={{ color: 'var(--neon-amber)', marginLeft: '4px', fontWeight: 700 }}>
                • Snoozed {alarm.snooze_count}x
              </span>
            )}
          </div>
        </div>

        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-muted)',
          maxWidth: '360px',
          lineHeight: 1.45,
        }}>
          Take action now or delay for a few minutes. LifePilot will keep alerting you until you complete or snooze.
        </p>

        {/* Action Buttons */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginTop: '6px',
        }}>
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button
              className="btn-primary"
              onClick={handleStart}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-sm)',
                justifyContent: 'center',
              }}
            >
              <Play size={18} fill="#05070B" />
              <span>Start Task Now</span>
            </button>

            <button
              className="btn-secondary"
              onClick={handleComplete}
              style={{
                flex: 1,
                padding: '14px',
                fontSize: '0.95rem',
                justifyContent: 'center',
                borderColor: 'rgba(0, 245, 160, 0.6)',
                background: 'rgba(0, 245, 160, 0.12)',
                color: 'var(--neon-emerald)',
                fontWeight: 700,
              }}
            >
              <CheckCircle2 size={18} color="var(--neon-emerald)" />
              <span>Mark Done</span>
            </button>
          </div>

          {/* Snooze Row */}
          <div>
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              marginBottom: '6px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <AlarmClockOff size={12} color="var(--neon-amber)" />
              <span>Snooze Alarm:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[5, 10, 15, 30].map(mins => (
                <button
                  key={mins}
                  className="btn-secondary"
                  onClick={() => handleSnooze(mins)}
                  style={{
                    padding: '9px 4px',
                    fontSize: '0.8rem',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--neon-amber)',
                    borderColor: 'rgba(255, 159, 67, 0.35)',
                  }}
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              textDecoration: 'underline',
            }}
          >
            <X size={13} />
            <span>Dismiss Alarm</span>
          </button>
        </div>
      </div>
    </div>
  );
};

