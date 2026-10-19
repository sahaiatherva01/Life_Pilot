import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Calendar, 
  Clock, 
  Upload, 
  Bot, 
  Settings, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  BellRing
} from 'lucide-react';
import { sound } from '../utils/audio';

interface TopNavProps {
  activeTab: 'today' | 'calendar' | 'landing';
  setActiveTab: (tab: 'today' | 'calendar' | 'landing') => void;
  onOpenImport: () => void;
  onOpenOrion: () => void;
  onOpenSettings: () => void;
  onLock: () => void;
  backendOnline: boolean;
  activeAlarmCount: number;
  upcomingAlarm?: { task_title: string; trigger_time: string; seconds_remaining?: number; minutes_remaining: number; is_snoozed?: boolean } | null;
  onTestAlarm?: () => void;
  notificationPermission?: NotificationPermission;
  onRequestNotificationPermission?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenImport,
  onOpenOrion,
  onOpenSettings,
  onLock,
  backendOnline,
  activeAlarmCount,
  upcomingAlarm,
  onTestAlarm,
  notificationPermission,
  onRequestNotificationPermission,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [countdownSecs, setCountdownSecs] = useState<number | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(sound.isMuted());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live second-by-second countdown for next upcoming alarm
  useEffect(() => {
    if (!upcomingAlarm) {
      setCountdownSecs(null);
      return;
    }

    const calcDiff = () => {
      const target = new Date(upcomingAlarm.trigger_time).getTime();
      const now = Date.now();
      const diff = Math.max(0, Math.floor((target - now) / 1000));
      setCountdownSecs(diff);
    };

    calcDiff();
    const timer = setInterval(calcDiff, 1000);
    return () => clearInterval(timer);
  }, [upcomingAlarm?.trigger_time]);

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsAudioMuted(muted);
    if (!muted) {
      sound.playClick();
    }
  };

  return (
    <header className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      margin: '12px 16px',
      padding: '12px 20px',
      borderRadius: 'var(--radius-md)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
    }}>
      {/* Brand */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={() => { sound.playClick(); setActiveTab('today'); }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #00F2FE 0%, #7928CA 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow-cyan)',
        }}>
          <Compass size={22} color="#05070B" />
        </div>
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            lineHeight: 1.1,
          }}>
            Life<span className="neon-gradient-text">Pilot</span>
          </h1>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            v1.0 • ASIA/KOLKATA
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          className={activeTab === 'today' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => { sound.playClick(); setActiveTab('today'); }}
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <Clock size={16} />
          <span>Today</span>
        </button>

        <button
          className={activeTab === 'calendar' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => { sound.playClick(); setActiveTab('calendar'); }}
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <Calendar size={16} />
          <span>Calendar</span>
        </button>

        <button
          className="btn-secondary"
          onClick={() => { sound.playClick(); onOpenImport(); }}
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
        >
          <Upload size={16} color="var(--neon-cyan)" />
          <span>Import Excel</span>
        </button>

        <button
          className="btn-secondary"
          onClick={() => { sound.playClick(); onOpenOrion(); }}
          style={{ 
            padding: '8px 14px', 
            fontSize: '0.85rem',
            borderColor: 'rgba(121, 40, 202, 0.4)',
            background: 'rgba(121, 40, 202, 0.1)',
          }}
        >
          <Bot size={16} color="#00F2FE" />
          <span>Orion AI</span>
        </button>

        <button
          className="btn-secondary"
          onClick={() => { sound.playClick(); setActiveTab('landing'); }}
          style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          title="Overview & Architecture Showcase"
        >
          <span>Showcase</span>
        </button>
      </nav>

      {/* Right side Status & Clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Active Alarm Badge if ringing */}
        {activeAlarmCount > 0 && (
          <div className="alarm-pulsing" style={{
            background: 'rgba(255, 51, 102, 0.2)',
            border: '1px solid #FF3366',
            color: '#FF3366',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 800,
            boxShadow: '0 0 15px rgba(255, 51, 102, 0.4)',
          }}>
            <BellRing size={15} />
            <span>ALARM RINGING ({activeAlarmCount})</span>
          </div>
        )}

        {/* Upcoming Alarm Countdown with live seconds */}
        {upcomingAlarm && activeAlarmCount === 0 && (
          <div style={{
            background: 'rgba(0, 242, 254, 0.08)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            color: 'var(--neon-cyan)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
          }}>
            <BellRing size={13} color="var(--neon-cyan)" />
            <span>
              {countdownSecs !== null
                ? `Next: ${formatCountdown(countdownSecs)} (${upcomingAlarm.task_title})`
                : `Next: ${upcomingAlarm.minutes_remaining}m (${upcomingAlarm.task_title})`}
              {upcomingAlarm.is_snoozed ? ' [Snoozed]' : ''}
            </span>
          </div>
        )}

        {/* Test Alarm Quick Button */}
        {onTestAlarm && (
          <button
            onClick={() => { sound.playClick(); onTestAlarm(); }}
            style={{
              background: 'rgba(255, 51, 102, 0.12)',
              border: '1px solid rgba(255, 51, 102, 0.4)',
              color: '#FF3366',
              borderRadius: 'var(--radius-full)',
              padding: '5px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Fire an instant verification test alarm"
          >
            <BellRing size={12} />
            <span>Test Alarm</span>
          </button>
        )}

        {/* Notification Permission Request */}
        {notificationPermission !== 'granted' && onRequestNotificationPermission && (
          <button
            onClick={() => { sound.playClick(); onRequestNotificationPermission(); }}
            style={{
              background: 'rgba(255, 159, 67, 0.15)',
              border: '1px solid var(--neon-amber)',
              color: 'var(--neon-amber)',
              borderRadius: 'var(--radius-full)',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
            title="Enable background desktop alarm notifications"
          >
            <BellRing size={12} />
            <span>Enable Desktop Alerts</span>
          </button>
        )}

        {/* Audio Mute quick toggle */}
        <button
          onClick={toggleSound}
          style={{
            background: isAudioMuted ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 242, 254, 0.1)',
            border: isAudioMuted ? '1px solid var(--border-subtle)' : '1px solid rgba(0, 242, 254, 0.4)',
            color: isAudioMuted ? 'var(--text-muted)' : 'var(--neon-cyan)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={isAudioMuted ? 'Sound is Muted (Click to unmute)' : 'Sound is Active (Click to mute)'}
        >
          {isAudioMuted ? '🔇' : '🔔'}
        </button>

        {/* Live IST Clock */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.9rem',
          color: 'var(--text-primary)',
          background: 'rgba(0, 0, 0, 0.4)',
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: backendOnline ? '#00F5A0' : '#FF3366',
            boxShadow: backendOnline ? '0 0 8px #00F5A0' : '0 0 8px #FF3366',
          }} />
          <span>{timeStr || 'IST --:--:--'}</span>
        </div>

        {/* Settings button */}
        <button
          className="btn-secondary"
          onClick={() => { sound.playClick(); onOpenSettings(); }}
          style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px' }}
          title="App & Network Settings"
        >
          <Settings size={18} />
        </button>

        {/* Lock button */}
        <button
          className="btn-secondary"
          onClick={() => { sound.playClick(); onLock(); }}
          style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px' }}
          title="Lock LifePilot"
        >
          <Lock size={18} />
        </button>
      </div>
    </header>
  );
};
