import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Play, 
  Clock, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit3, 
  Flame, 
  Sparkles,
  Layers,
  ArrowRight,
  BellRing,
  Timer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Category, SubtaskItem, Task, TaskStatus } from '../types';
import { sound } from '../utils/audio';

interface TodayTimelineProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onReschedule: (taskId: string, newStart: string, newEnd: string) => void;
  onDeleteTask: (taskId: string) => void;
  onCreateTask: (task: Partial<Task>) => void;
  onOpenImport: () => void;
  onToggleSubtask: (taskId: string, subtaskIndex: number) => void;
  onQuickAlarm: (titleOrOptions: string | any, minutes?: number) => void;
  onArmTaskAlarm?: (taskId: string, minutesFromNow?: number) => void;
}

const CATEGORY_COLORS: Record<Category, string> = {
  Fitness: 'var(--cat-fitness)',
  Study: 'var(--cat-study)',
  Projects: 'var(--cat-projects)',
  Career: 'var(--cat-career)',
  Sleep: 'var(--cat-sleep)',
  Skill: 'var(--cat-skill)',
  Routine: 'var(--cat-routine)',
};

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  currentDate,
  onDateChange,
  tasks,
  onStatusChange,
  onReschedule,
  onDeleteTask,
  onCreateTask,
  onOpenImport,
  onToggleSubtask,
  onQuickAlarm,
  onArmTaskAlarm,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showQuickAlarmModal, setShowQuickAlarmModal] = useState(false);
  const [quickAlarmTitle, setQuickAlarmTitle] = useState('');
  const [quickAlarmMinutes, setQuickAlarmMinutes] = useState(5);
  const [quickAlarmMode, setQuickAlarmMode] = useState<'minutes' | 'exact'>('minutes');
  const [quickAlarmExactTime, setQuickAlarmExactTime] = useState('');
  const [quickAlarmCat, setQuickAlarmCat] = useState<Category>('Routine');

  // Inline Quick Alarm bar state
  const [inlineTitle, setInlineTitle] = useState('');
  const [inlineMins, setInlineMins] = useState(5);
  const [inlineCat, setInlineCat] = useState<Category>('Routine');

  const [rescheduleTask, setRescheduleTask] = useState<Task | null>(null);
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');

  // Add task form state
  const [addTitle, setAddTitle] = useState('');
  const [addCategory, setAddCategory] = useState<Category>('Routine');
  const [addStart, setAddStart] = useState('09:00');
  const [addEnd, setAddEnd] = useState('10:00');
  const [addDesc, setAddDesc] = useState('');

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredTasks = selectedCategory === 'All' 
    ? tasks 
    : tasks.filter(t => t.category === selectedCategory);

  const handlePrevDay = () => {
    sound.playClick();
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    sound.playClick();
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    sound.playClick();
    onDateChange(new Date().toISOString().split('T')[0]);
  };

  const handleCompleteClick = (taskId: string) => {
    sound.playSuccess();
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {}
    onStatusChange(taskId, 'completed');
  };

  const handleInlineAlarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineTitle.trim()) return;
    onQuickAlarm({
      title: inlineTitle.trim(),
      minutes_from_now: inlineMins,
      category: inlineCat,
      priority: 'high',
    });
    setInlineTitle('');
    sound.playSuccess();
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim()) return;
    onCreateTask({
      title: addTitle.trim(),
      category: addCategory,
      date: currentDate,
      start_time: addStart,
      end_time: addEnd,
      description: addDesc.trim() || undefined,
      priority: 'medium',
      subtasks: [],
      is_reminder_enabled: true,
    });
    setAddTitle('');
    setAddDesc('');
    setShowAddModal(false);
  };

  const handleRescheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleTask || !newStart || !newEnd) return;
    onReschedule(rescheduleTask.id, newStart, newEnd);
    setRescheduleTask(null);
  };

  const formattedDate = new Date(currentDate + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px 60px' }}>
      {/* Date Switcher & Header Bar */}
      <div className="glass-panel" style={{
        padding: '18px 24px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Date Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            className="btn-secondary" 
            onClick={handlePrevDay} 
            style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px' }}
          >
            <ChevronLeft size={18} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
              }}>
                {formattedDate}
              </h2>
              {isToday && (
                <span style={{
                  background: 'rgba(0, 242, 254, 0.15)',
                  border: '1px solid var(--neon-cyan)',
                  color: 'var(--neon-cyan)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                }}>
                  TODAY
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {totalCount} blocks scheduled • {completedCount} completed
            </span>
          </div>

          <button 
            className="btn-secondary" 
            onClick={handleNextDay} 
            style={{ padding: '8px', borderRadius: '50%', width: '36px', height: '36px' }}
          >
            <ChevronRight size={18} />
          </button>

          {!isToday && (
            <button 
              className="btn-secondary" 
              onClick={handleToday}
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              Back to Today
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={onOpenImport}
            style={{ fontSize: '0.85rem' }}
          >
            <Sparkles size={16} color="var(--neon-cyan)" />
            <span>Import Guide.xlsx</span>
          </button>

          <button
            className="btn-secondary"
            onClick={() => { sound.playClick(); setShowQuickAlarmModal(true); }}
            style={{
              fontSize: '0.85rem',
              borderColor: 'rgba(255, 159, 67, 0.4)',
              background: 'rgba(255, 159, 67, 0.08)',
              color: 'var(--neon-amber)',
            }}
          >
            <BellRing size={15} color="var(--neon-amber)" />
            <span>Quick Alarm</span>
          </button>

          <button
            className="btn-primary"
            onClick={() => { sound.playClick(); setShowAddModal(true); }}
            style={{ fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Quick To-Do Alarm Bar */}
      <div className="glass-panel" style={{
        padding: '14px 20px',
        marginBottom: '16px',
        background: 'linear-gradient(90deg, rgba(255, 159, 67, 0.1) 0%, rgba(24, 27, 36, 0.85) 100%)',
        border: '1px solid rgba(255, 159, 67, 0.35)',
      }}>
        <form onSubmit={handleInlineAlarmSubmit} style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '130px' }}>
            <BellRing size={16} color="var(--neon-amber)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--neon-amber)', fontFamily: 'var(--font-mono)' }}>
              ⚡ QUICK ALARM
            </span>
          </div>

          <input
            type="text"
            required
            placeholder="What to do? (e.g. Call client, 5 DSA problems, drink water)"
            value={inlineTitle}
            onChange={e => setInlineTitle(e.target.value)}
            style={{
              flex: 1,
              minWidth: '220px',
              padding: '9px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(0,0,0,0.5)',
              color: 'var(--text-primary)',
              fontSize: '0.88rem',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            {[2, 5, 15, 30].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => { sound.playClick(); setInlineMins(mins); }}
                style={{
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: inlineMins === mins ? '1px solid var(--neon-amber)' : '1px solid var(--border-subtle)',
                  background: inlineMins === mins ? 'rgba(255, 159, 67, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  color: inlineMins === mins ? 'var(--neon-amber)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                +{mins}m
              </button>
            ))}
          </div>

          <select
            value={inlineCat}
            onChange={e => setInlineCat(e.target.value as Category)}
            style={{
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(0,0,0,0.5)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
            }}
          >
            {['Routine', 'Study', 'Fitness', 'Projects', 'Career', 'Skill'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <button
            type="submit"
            className="btn-primary"
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #FF9F43 0%, #FF5252 100%)',
              color: '#05070B',
              fontWeight: 800,
              boxShadow: '0 0 15px rgba(255, 159, 67, 0.3)',
            }}
          >
            <BellRing size={14} />
            <span>Arm ({inlineMins}m)</span>
          </button>
        </form>
      </div>

      {/* Daily Progress Tracker Card */}
      <div className="glass-panel" style={{
        padding: '16px 24px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, rgba(18, 20, 26, 0.9) 0%, rgba(24, 27, 36, 0.7) 100%)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Daily Adherence & Discipline
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '1rem',
            fontWeight: 700,
            color: progressPct >= 70 ? 'var(--neon-emerald)' : 'var(--neon-cyan)',
          }}>
            {progressPct}% ({completedCount}/{totalCount})
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: progressPct >= 70 
              ? 'linear-gradient(90deg, #00F2FE 0%, #00F5A0 100%)' 
              : 'linear-gradient(90deg, #7928CA 0%, #00F2FE 100%)',
            transition: 'width 0.4s ease',
            boxShadow: '0 0 12px rgba(0, 242, 254, 0.5)',
          }} />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '10px',
        marginBottom: '16px',
      }}>
        {['All', 'Fitness', 'Study', 'Projects', 'Career', 'Sleep', 'Skill', 'Routine'].map(cat => (
          <button
            key={cat}
            onClick={() => { sound.playClick(); setSelectedCategory(cat); }}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCategory === cat ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
              background: selectedCategory === cat ? 'rgba(0, 242, 254, 0.15)' : 'rgba(255, 255, 255, 0.04)',
              color: selectedCategory === cat ? 'var(--neon-cyan)' : 'var(--text-secondary)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <div className="glass-panel" style={{
          padding: '60px 20px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <Layers size={48} color="var(--text-muted)" />
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
            No tasks found for this day
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '420px', fontSize: '0.9rem' }}>
            Upload your <strong>Guide.xlsx</strong> to seed your daily routine, or talk to Orion: <em>"shift gym to 7 PM"</em>.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={onOpenImport}>
              <Sparkles size={16} />
              <span>Import Guide.xlsx</span>
            </button>
            <button className="btn-secondary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              <span>Add First Task</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTasks.map(task => {
            const catColor = CATEGORY_COLORS[task.category] || 'var(--text-muted)';
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';

            return (
              <div
                key={task.id}
                className="glass-panel"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderLeft: `4px solid ${catColor}`,
                  opacity: isCompleted ? 0.65 : 1,
                  background: isInProgress 
                    ? 'linear-gradient(90deg, rgba(0, 242, 254, 0.08) 0%, rgba(18, 20, 26, 0.8) 100%)' 
                    : undefined,
                }}
              >
                {/* Left: Timing badge */}
                <div style={{ minWidth: '110px' }}>
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                  }}>
                    {task.start_time} - {task.end_time}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {task.duration_minutes} mins
                  </span>
                </div>

                {/* Middle: Title, Category & Subtasks */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span 
                      className="badge-category"
                      style={{
                        background: `${catColor}20`,
                        color: catColor,
                        border: `1px solid ${catColor}50`,
                      }}
                    >
                      {task.category}
                    </span>

                    {isInProgress && (
                      <span style={{
                        background: 'rgba(0, 242, 254, 0.15)',
                        color: 'var(--neon-cyan)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        border: '1px solid var(--neon-cyan)',
                      }}>
                        IN PROGRESS
                      </span>
                    )}

                    {task.is_reminder_enabled && !isCompleted && (
                      <span style={{
                        background: 'rgba(0, 242, 254, 0.08)',
                        border: '1px solid rgba(0, 242, 254, 0.25)',
                        color: 'var(--neon-cyan)',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <BellRing size={10} />
                        <span>Alarm Armed</span>
                      </span>
                    )}

                    <h3 style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                    }}>
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {task.description}
                    </p>
                  )}

                  {/* Subtask checklist if any */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {task.subtasks.map((st, idx) => (
                        <label 
                          key={st.id || idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.82rem',
                            color: st.completed ? 'var(--text-muted)' : 'var(--text-secondary)',
                            textDecoration: st.completed ? 'line-through' : 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => onToggleSubtask(task.id, idx)}
                        >
                          <input 
                            type="checkbox" 
                            checked={st.completed} 
                            readOnly 
                            style={{ accentColor: 'var(--neon-cyan)', cursor: 'pointer' }}
                          />
                          <span>{st.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {onArmTaskAlarm && !isCompleted && (
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        sound.playClick();
                        onArmTaskAlarm(task.id, 2);
                      }}
                      style={{
                        padding: '6px 9px',
                        fontSize: '0.75rem',
                        borderColor: 'rgba(255, 159, 67, 0.4)',
                        color: 'var(--neon-amber)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Arm or ring alarm in 2 minutes for this task"
                    >
                      <BellRing size={13} color="var(--neon-amber)" />
                      <span>+2m Alarm</span>
                    </button>
                  )}

                  {!isCompleted && (
                    <>
                      <button
                        className="btn-secondary"
                        onClick={() => {
                          sound.playClick();
                          onStatusChange(task.id, isInProgress ? 'pending' : 'in_progress');
                        }}
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        title={isInProgress ? 'Pause' : 'Start'}
                      >
                        <Play size={14} fill={isInProgress ? 'var(--neon-cyan)' : 'none'} />
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => {
                          sound.playClick();
                          setRescheduleTask(task);
                          setNewStart(task.start_time);
                          setNewEnd(task.end_time);
                        }}
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        title="Reschedule"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        className="btn-secondary"
                        onClick={() => handleCompleteClick(task.id)}
                        style={{ 
                          padding: '6px 12px', 
                          fontSize: '0.8rem',
                          borderColor: 'rgba(0, 245, 160, 0.4)',
                          color: 'var(--neon-emerald)',
                        }}
                        title="Mark Complete"
                      >
                        <CheckCircle2 size={14} />
                        <span>Done</span>
                      </button>
                    </>
                  )}

                  {isCompleted && (
                    <button
                      className="btn-secondary"
                      onClick={() => onStatusChange(task.id, 'pending')}
                      style={{ padding: '6px 10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}
                    >
                      Undo
                    </button>
                  )}

                  <button
                    className="btn-secondary"
                    onClick={() => {
                      if (confirm(`Delete "${task.title}"?`)) {
                        onDeleteTask(task.id);
                      }
                    }}
                    style={{ padding: '6px 8px', color: 'var(--text-muted)' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '28px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-secondary)',
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '16px' }}>
              Create Scheduled Task
            </h3>
            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Work DSA + Notes"
                  value={addTitle}
                  onChange={e => setAddTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Start Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={addStart}
                    onChange={e => setAddStart(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    End Time (24h)
                  </label>
                  <input
                    type="time"
                    required
                    value={addEnd}
                    onChange={e => setAddEnd(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={addCategory}
                  onChange={e => setAddCategory(e.target.value as Category)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                >
                  {['Fitness', 'Study', 'Projects', 'Career', 'Sleep', 'Skill', 'Routine'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Optional details or goal"
                  value={addDesc}
                  onChange={e => setAddDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Create Task
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {rescheduleTask && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '420px',
            padding: '24px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-secondary)',
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: '6px' }}>
              Reschedule Task
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {rescheduleTask.title}
            </p>

            <form onSubmit={handleRescheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    New Start Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newStart}
                    onChange={e => setNewStart(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    New End Time
                  </label>
                  <input
                    type="time"
                    required
                    value={newEnd}
                    onChange={e => setNewEnd(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                  Confirm Reschedule
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setRescheduleTask(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Alarm / To-Do Modal */}
      {showQuickAlarmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '440px',
            padding: '26px',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-secondary)',
            border: '1px solid rgba(255, 159, 67, 0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <BellRing size={20} color="var(--neon-amber)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800 }}>
                Set Quick To-Do Alarm
              </h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Arms a persistent alarm that will ring X minutes from now until you start or complete it.
            </p>

            <form onSubmit={e => {
              e.preventDefault();
              if (!quickAlarmTitle.trim()) return;
              if (quickAlarmMode === 'exact') {
                if (!quickAlarmExactTime) {
                  alert('Please enter a time for the alarm');
                  return;
                }
                onQuickAlarm({
                  title: quickAlarmTitle.trim(),
                  exact_time: quickAlarmExactTime,
                  category: quickAlarmCat,
                  priority: 'high',
                });
              } else {
                onQuickAlarm({
                  title: quickAlarmTitle.trim(),
                  minutes_from_now: quickAlarmMinutes,
                  category: quickAlarmCat,
                  priority: 'high',
                });
              }
              setQuickAlarmTitle('');
              setShowQuickAlarmModal(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  What do you need to do?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Drink water, Check DSA test, Stretch"
                  value={quickAlarmTitle}
                  onChange={e => setQuickAlarmTitle(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>

              {/* Mode switch */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { sound.playClick(); setQuickAlarmMode('minutes'); }}
                  style={{
                    flex: 1,
                    padding: '7px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: quickAlarmMode === 'minutes' ? '1px solid var(--neon-amber)' : '1px solid var(--border-subtle)',
                    background: quickAlarmMode === 'minutes' ? 'rgba(255, 159, 67, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: quickAlarmMode === 'minutes' ? 'var(--neon-amber)' : 'var(--text-muted)',
                  }}
                >
                  ⏱ In X Minutes
                </button>
                <button
                  type="button"
                  onClick={() => { sound.playClick(); setQuickAlarmMode('exact'); }}
                  style={{
                    flex: 1,
                    padding: '7px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: quickAlarmMode === 'exact' ? '1px solid var(--neon-cyan)' : '1px solid var(--border-subtle)',
                    background: quickAlarmMode === 'exact' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: quickAlarmMode === 'exact' ? 'var(--neon-cyan)' : 'var(--text-muted)',
                  }}
                >
                  🕒 Exact Time Today
                </button>
              </div>

              {quickAlarmMode === 'minutes' ? (
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Ring Alarm In:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                    {[1, 2, 5, 10, 15, 30, 60].map(mins => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => { sound.playClick(); setQuickAlarmMinutes(mins); }}
                        style={{
                          padding: '8px 2px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: quickAlarmMinutes === mins ? '1px solid var(--neon-amber)' : '1px solid var(--border-subtle)',
                          background: quickAlarmMinutes === mins ? 'rgba(255, 159, 67, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          color: quickAlarmMinutes === mins ? 'var(--neon-amber)' : 'var(--text-secondary)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Exact Alarm Time Today (24h)
                  </label>
                  <input
                    type="time"
                    required={quickAlarmMode === 'exact'}
                    value={quickAlarmExactTime}
                    onChange={e => setQuickAlarmExactTime(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--neon-cyan)',
                      background: 'rgba(0,0,0,0.5)',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  />
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={quickAlarmCat}
                  onChange={e => setQuickAlarmCat(e.target.value as Category)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {['Routine', 'Study', 'Fitness', 'Projects', 'Career', 'Skill'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #FF9F43 0%, #FF5252 100%)',
                    boxShadow: '0 0 20px rgba(255, 159, 67, 0.3)',
                    color: '#05070B',
                    fontWeight: 800,
                  }}
                >
                  <BellRing size={16} />
                  <span>
                    {quickAlarmMode === 'exact' 
                      ? `Arm Alarm (${quickAlarmExactTime || 'Select Time'})`
                      : `Arm Alarm (${quickAlarmMinutes}m)`}
                  </span>
                </button>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowQuickAlarmModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
