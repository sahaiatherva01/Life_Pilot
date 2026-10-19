import React, { useEffect } from 'react';
import { BellRing, Play, AlarmClockOff, CheckCircle2, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Reminder } from '../types';
import { sound } from '../utils/audio';

interface AlarmModalProps {
  alarm: Reminder | null;
  onAction: (reminderId: string, action: 'start' | 'snooze' | 'complete' | 'dismiss', minutes?: number) => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({ alarm, onAction }) => {
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

  const handleStart = () => {
    sound.stopAlarmLoop();
    sound.playClick();
    onAction(alarm.id, 'start');
  };

  const handleSnooze = () => {
    sound.stopAlarmLoop();
    sound.playClick();
    onAction(alarm.id, 'snooze', 10);
  };

  const handleComplete = () => {
    sound.stopAlarmLoop();
    sound.playSuccess();
    try {
      confetti({
        particleCount: 80,
        spread: 70,
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
      background: 'rgba(5, 7, 11, 0.85)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div 
        className="alarm-pulsing glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '36px 28px',
          borderRadius: 'var(--radius-lg)',
          textAlign: 'center',
          border: '1px solid rgba(255, 51, 102, 0.5)',
          background: 'linear-gradient(180deg, rgba(24, 27, 36, 0.95) 0%, rgba(10, 11, 14, 0.98) 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Pulsing Alarm Icon */}
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 51, 102, 0.3) 0%, rgba(255, 51, 102, 0.05) 70%)',
          border: '2px solid #FF3366',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 35px rgba(255, 51, 102, 0.4)',
        }}>
          <BellRing size={38} color="#FF3366" />
        </div>

        <div>
          <span style={{
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            color: '#FF3366',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
          }}>
            SCHEDULED ALERT • ACTION REQUIRED
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.75rem',
            fontWeight: 800,
            marginTop: '8px',
            color: 'var(--text-primary)',
          }}>
            {alarm.task_title}
          </h2>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '8px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            background: 'rgba(255, 255, 255, 0.06)',
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
          }}>
            <Flame size={14} color="var(--neon-cyan)" />
            <span>Category: <strong>{alarm.task_category}</strong></span>
            {alarm.snooze_count > 0 && (
              <span style={{ color: 'var(--neon-amber)', marginLeft: '6px' }}>
                (Snoozed {alarm.snooze_count}x)
              </span>
            )}
          </div>
        </div>

        <p style={{
          fontSize: '0.88rem',
          color: 'var(--text-muted)',
          maxWidth: '340px',
          lineHeight: 1.4,
        }}>
          LifePilot alerts will repeat until you initiate the block, delay for 10 minutes, or mark it completed.
        </p>

        {/* Action Buttons */}
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: '6px',
        }}>
          <button
            className="btn-primary"
            onClick={handleStart}
            style={{
              padding: '14px',
              fontSize: '1rem',
              width: '100%',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <Play size={18} fill="#05070B" />
            <span>Start Task Now</span>
          </button>

          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <button
              className="btn-secondary"
              onClick={handleSnooze}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '0.9rem',
                justifyContent: 'center',
              }}
            >
              <AlarmClockOff size={16} color="var(--neon-amber)" />
              <span>Snooze 10m</span>
            </button>

            <button
              className="btn-secondary"
              onClick={handleComplete}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '0.9rem',
                justifyContent: 'center',
                borderColor: 'rgba(0, 245, 160, 0.4)',
                color: 'var(--neon-emerald)',
              }}
            >
              <CheckCircle2 size={16} color="var(--neon-emerald)" />
              <span>Mark Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
