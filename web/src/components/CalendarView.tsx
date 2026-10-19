import React, { useEffect, useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Clock, 
  Flame, 
  Sun, 
  Moon, 
  CheckCircle2,
  PieChart,
  Sparkles
} from 'lucide-react';
import { DailyBriefing } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/audio';

interface CalendarViewProps {
  onSelectDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onSelectDate }) => {
  const [stats, setStats] = useState<any>(null);
  const [weekData, setWeekData] = useState<any>(null);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [s, w, b] = await Promise.all([
        api.getStats(),
        api.getWeekOverview(),
        api.getLatestBriefing(),
      ]);
      setStats(s);
      setWeekData(w);
      setBriefing(b);
    } catch (e) {}
  };

  const handleTriggerBriefing = async (type: 'morning' | 'night') => {
    sound.playClick();
    setBriefingLoading(true);
    try {
      await api.triggerBriefing(type);
      const updated = await api.getLatestBriefing(type);
      setBriefing(updated);
    } catch (e) {}
    finally {
      setBriefingLoading(false);
    }
  };

  const daysList = weekData?.days ? Object.values(weekData.days) : [];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px 60px' }}>
      {/* Productivity Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Adherence Rate */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Adherence Rate</span>
            <TrendingUp size={18} color="var(--neon-emerald)" />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 800,
            marginTop: '10px',
            color: 'var(--neon-emerald)',
          }}>
            {stats?.adherence_percentage ?? 0}%
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {stats?.completed_tasks ?? 0} of {stats?.total_tasks ?? 0} tasks completed today
          </span>
        </div>

        {/* Scheduled Hours */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Scheduled Focus</span>
            <Clock size={18} color="var(--neon-cyan)" />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 800,
            marginTop: '10px',
            color: 'var(--neon-cyan)',
          }}>
            {stats?.total_scheduled_hours ?? 0}h
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Planned across all life dimensions
          </span>
        </div>

        {/* Energy Balance */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pillars Active</span>
            <Flame size={18} color="var(--neon-amber)" />
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '2.2rem',
            fontWeight: 800,
            marginTop: '10px',
            color: 'var(--neon-amber)',
          }}>
            {stats?.category_distribution ? Object.keys(stats.category_distribution).length : 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Fitness, Study, Career, Routine
          </span>
        </div>
      </div>

      {/* 7-Day Week Overview */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '16px' }}>
          Weekly Flight Path
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }}>
          {daysList.map((day: any, i: number) => {
            const dateObj = new Date(day.date + 'T00:00:00');
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = dateObj.getDate();
            const isToday = day.date === new Date().toISOString().split('T')[0];

            return (
              <div
                key={i}
                onClick={() => {
                  sound.playClick();
                  onSelectDate(day.date);
                }}
                className="glass-panel"
                style={{
                  padding: '16px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  border: isToday ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
                  background: isToday ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  color: isToday ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  fontWeight: 700,
                }}>
                  {dayName}
                </span>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  margin: '6px 0',
                }}>
                  {dayNum}
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: day.total > 0 ? 'var(--neon-emerald)' : 'var(--text-muted)',
                  fontWeight: 600,
                }}>
                  {day.completed}/{day.total} Done
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Circadian Briefings Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sun size={22} color="var(--neon-amber)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
              Circadian AI Briefing (7:00 AM & 11:30 PM)
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn-secondary"
              onClick={() => handleTriggerBriefing('morning')}
              disabled={briefingLoading}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <Sun size={14} color="var(--neon-amber)" />
              <span>Trigger 7 AM Plan</span>
            </button>

            <button
              className="btn-secondary"
              onClick={() => handleTriggerBriefing('night')}
              disabled={briefingLoading}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              <Moon size={14} color="var(--cat-projects)" />
              <span>Trigger 11:30 PM Review</span>
            </button>
          </div>
        </div>

        {briefing ? (
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '20px',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
          }}>
            {briefing.content}
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No briefings generated yet today. LifePilot will automatically deliver them at 7:00 AM and 11:30 PM.
          </p>
        )}
      </div>
    </div>
  );
};
