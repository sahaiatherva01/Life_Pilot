import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  X, 
  Wifi, 
  Key, 
  CheckCircle2, 
  AlertTriangle, 
  Smartphone, 
  Laptop 
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, api } from '../services/api';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
}) => {
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinStatus, setPinStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    sound.playClick();
    setPingStatus('Testing connection...');
    try {
      setApiBaseUrl(apiUrl);
      const health = await api.getHealth();
      setPingStatus(`Connected! Server: ${health.app} (${health.timezone})`);
      sound.playSuccess();
    } catch (e: any) {
      setPingStatus(`Failed to connect: ${e.message}`);
    }
  };

  const handleSaveApiUrl = () => {
    sound.playClick();
    setApiBaseUrl(apiUrl);
    onSettingsSaved();
    alert('API Base URL saved successfully!');
  };

  const handleChangePin = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    try {
      await api.changePin(currentPin, newPin);
      sound.playSuccess();
      setPinStatus('PIN updated successfully!');
      setCurrentPin('');
      setNewPin('');
    } catch (e: any) {
      setPinStatus(`Error: ${e.message}`);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(5, 7, 11, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SettingsIcon size={22} color="var(--neon-cyan)" />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
              LifePilot Configuration
            </h2>
          </div>
          <button
            onClick={() => { sound.playClick(); onClose(); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Network & Backend URL */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Wifi size={18} color="var(--neon-cyan)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Backend API Host (Wi-Fi / Tailscale)</h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              To connect your Android phone to the backend running on your laptop, enter your laptop's local Wi-Fi IP (e.g. <code>http://192.168.1.15:8000</code>) or Tailscale mesh IP.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                }}
              />
              <button className="btn-secondary" onClick={handleTestConnection} style={{ fontSize: '0.8rem' }}>
                Test
              </button>
              <button className="btn-primary" onClick={handleSaveApiUrl} style={{ fontSize: '0.8rem' }}>
                Save
              </button>
            </div>
            {pingStatus && (
              <p style={{
                fontSize: '0.8rem',
                marginTop: '8px',
                color: pingStatus.startsWith('Connected') ? 'var(--neon-emerald)' : 'var(--neon-rose)',
              }}>
                {pingStatus}
              </p>
            )}
          </div>

          {/* Change PIN */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Key size={18} color="var(--neon-amber)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Change Master PIN</h3>
            </div>
            <form onSubmit={handleChangePin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <input
                  type="password"
                  placeholder="Current PIN (e.g. 1234)"
                  value={currentPin}
                  onChange={e => setCurrentPin(e.target.value)}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
                <input
                  type="password"
                  placeholder="New PIN (4-12 digits)"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  required
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)',
                  }}
                />
              </div>
              <button type="submit" className="btn-secondary" style={{ alignSelf: 'flex-start' }}>
                Update PIN
              </button>
              {pinStatus && (
                <p style={{ fontSize: '0.8rem', color: pinStatus.startsWith('PIN updated') ? 'var(--neon-emerald)' : '#FF3366' }}>
                  {pinStatus}
                </p>
              )}
            </form>
          </div>

          {/* Device Architecture Information */}
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '20px',
            background: 'rgba(255, 255, 255, 0.02)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>
              One Codebase Dual Targets
            </h4>
            <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div>
                <Laptop size={16} color="var(--neon-cyan)" />
                <p style={{ marginTop: '4px' }}>
                  <strong>macOS:</strong> Electron Menu-bar Tray daemon with background alarms and auto-start.
                </p>
              </div>
              <div>
                <Smartphone size={16} color="var(--neon-emerald)" />
                <p style={{ marginTop: '4px' }}>
                  <strong>Android:</strong> Capacitor exact alarm notifications that ring with the app closed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
