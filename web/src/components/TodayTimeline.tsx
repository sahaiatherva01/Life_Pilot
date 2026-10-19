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
  ArrowRight
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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
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
            className="btn-primary"
            onClick={() => { sound.playClick(); setShowAddModal(true); }}
            style={{ fontSize: '0.85rem' }}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </button>
        </div>
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
    </div>
  );
};
