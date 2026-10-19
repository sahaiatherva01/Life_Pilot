import React, { useState, useEffect } from 'react';
import { Compass, ShieldCheck, Delete, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';

interface PinLockScreenProps {
  onUnlock: (pin: string) => Promise<boolean>;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9' && pin.length < 8) {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  const handleDigit = (digit: string) => {
    sound.playClick();
    setError(false);
    if (pin.length < 8) {
      const nextPin = pin + digit;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    sound.playClick();
    setError(false);
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length >= 4) {
      verify(pin);
    }
  };

  const verify = async (pinToVerify: string) => {
    setLoading(true);
    const success = await onUnlock(pinToVerify);
    setLoading(false);
    if (success) {
      sound.playSuccess();
    } else {
      sound.playClick();
      setError(true);
      setPin('');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'radial-gradient(circle at center, #12141A 0%, #0A0B0E 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '360px',
        padding: '36px 28px',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Emblem */}
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #00F2FE 0%, #7928CA 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow-cyan)',
        }}>
          <Compass size={32} color="#05070B" />
        </div>

        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
            Life<span className="neon-gradient-text">Pilot</span> OS
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Enter Master PIN to authenticate
          </p>
        </div>

        {/* PIN Dots */}
        <div style={{ display: 'flex', gap: '14px', margin: '4px 0' }}>
          {[0, 1, 2, 3].map(i => {
            const filled = i < pin.length;
            return (
              <div
                key={i}
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  border: error ? '2px solid #FF3366' : '2px solid var(--border-subtle)',
                  background: filled ? 'var(--neon-cyan)' : 'transparent',
                  boxShadow: filled ? '0 0 12px var(--neon-cyan)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            );
          })}
        </div>

        {error && (
          <span style={{ fontSize: '0.8rem', color: '#FF3366', fontWeight: 600 }}>
            Incorrect Master PIN. Default is 1234.
          </span>
        )}

        {/* Numeric Keypad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          width: '100%',
          maxWidth: '260px',
        }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(d => (
            <button
              key={d}
              onClick={() => handleDigit(d)}
              disabled={loading}
              style={{
                height: '56px',
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.04)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
              onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {d}
            </button>
          ))}

          <button
            onClick={handleBackspace}
            style={{
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Delete size={20} />
          </button>

          <button
            onClick={() => handleDigit('0')}
            disabled={loading}
            style={{
              height: '56px',
              borderRadius: '50%',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(255, 255, 255, 0.04)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.3rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            0
          </button>

          <button
            onClick={handleSubmit}
            className="btn-primary"
            style={{
              height: '56px',
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowRight size={20} />
          </button>
        </div>

        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Default PIN: <strong style={{ color: 'var(--text-secondary)' }}>1234</strong>
        </span>
      </div>
    </div>
  );
};
