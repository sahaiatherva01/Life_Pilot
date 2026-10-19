import React, { useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Kanban,
  List,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { Badge, Button, Card, Input } from '@lifepilot/ui';

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'planned' | 'in_progress' | 'completed';
  estimatedMinutes: number;
  subtasks: Array<{ id: string; title: string; isCompleted: boolean }>;
}

export const TasksScreen: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Study');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');
  const [newMinutes, setNewMinutes] = useState(60);
  const [newSubtasks, setNewSubtasks] = useState('');

  const [tasks, setTasks] = useState<TaskItem[]>([
    {
      id: 't-1',
      title: 'DSA Handwritten Practice & Research',
      category: 'Study',
      priority: 'urgent',
      status: 'in_progress',
      estimatedMinutes: 90,
      subtasks: [
        { id: 's-1', title: 'Dynamic Programming Patterns', isCompleted: true },
        { id: 's-2', title: 'Graph Traversal Handwritten Proofs', isCompleted: false },
        { id: 's-3', title: 'Time Complexity Boundary Cases', isCompleted: false },
      ],
    },
    {
      id: 't-2',
      title: 'Project Learn_Mind Architecture & GitHub Push',
      category: 'Projects',
      priority: 'high',
      status: 'planned',
      estimatedMinutes: 90,
      subtasks: [
        { id: 's-4', title: 'Implement Vector Embeddings Gateway', isCompleted: false },
        { id: 's-5', title: 'Draft Component Tests', isCompleted: false },
      ],
    },
    {
      id: 't-3',
      title: 'Cold Outreach & Resume Iteration',
      category: 'Career',
      priority: 'medium',
      status: 'planned',
      estimatedMinutes: 45,
      subtasks: [
        { id: 's-6', title: 'Update Metrics in LifePilot Resume Bullet', isCompleted: true },
        { id: 's-7', title: 'Dispatch 5 Targeted Cold Inquiries', isCompleted: false },
      ],
    },
    {
      id: 't-4',
      title: 'Morning Chai for Family & Gym Readiness',
      category: 'Routine',
      priority: 'medium',
      status: 'completed',
      estimatedMinutes: 15,
      subtasks: [],
    },
    {
      id: 't-5',
      title: 'Gym Workout Session',
      category: 'Fitness',
      priority: 'high',
      status: 'completed',
      estimatedMinutes: 60,
      subtasks: [],
    },
  ]);

  const categories = ['All', 'Study', 'Projects', 'Career', 'Fitness', 'Routine'];

  const filteredTasks = tasks.filter((t) => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const subList = newSubtasks
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((title, i) => ({ id: `sub-${Date.now()}-${i}`, title, isCompleted: false }));

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      priority: newPriority,
      status: 'planned',
      estimatedMinutes: newMinutes,
      subtasks: subList,
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTitle('');
    setNewSubtasks('');
    setIsModalOpen(false);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const updatedSubs = t.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
        );
        const updatedTask = { ...t, subtasks: updatedSubs };
        if (activeTask && activeTask.id === taskId) {
          setActiveTask(updatedTask);
        }
        return updatedTask;
      })
    );
  };

  const handleStatusChange = (taskId: string, newStatus: 'planned' | 'in_progress' | 'completed') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#14171F] border border-white/[0.08]">
        {/* Left: Search & Categories */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-[#0F1218] border border-white/[0.08] rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-400/50"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,242,254,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-white bg-[#0F1218] border border-white/[0.04]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Right: View Mode Toggle & Add Task Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-lg bg-[#0F1218] border border-white/[0.08]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'kanban'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <Kanban className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="glow"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-3.5 h-3.5 text-black" />}
          >
            Create Task
          </Button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              interactive
              onClick={() => setActiveTask(task)}
              className="p-4 flex items-center justify-between gap-4 border-white/[0.08] hover:border-cyan-500/30"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(
                      task.id,
                      task.status === 'completed' ? 'planned' : 'completed'
                    );
                  }}
                  className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                    task.status === 'completed'
                      ? 'bg-emerald-500 border-emerald-400 text-black'
                      : 'border-slate-600 hover:border-cyan-400'
                  }`}
                >
                  {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white truncate">
                      {task.title}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {task.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                    <span>Est: {task.estimatedMinutes}m</span>
                    {task.subtasks.length > 0 && (
                      <span className="text-cyan-400 font-mono">
                        {task.subtasks.filter((s) => s.isCompleted).length} /{' '}
                        {task.subtasks.length} subtasks
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                    task.priority === 'urgent'
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : task.priority === 'high'
                      ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  {task.priority}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {(['planned', 'in_progress', 'completed'] as const).map((colStatus) => {
            const colTasks = filteredTasks.filter((t) => t.status === colStatus);
            const titles = {
              planned: 'Planned Tasks',
              in_progress: 'In Progress Deep Work',
              completed: 'Completed & Audited',
            };

            return (
              <div
                key={colStatus}
                className="bg-[#0F1218]/90 rounded-2xl p-4 border border-white/[0.08] min-h-[400px] flex flex-col gap-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] text-xs font-semibold text-slate-300">
                  <span>{titles[colStatus]}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1">
                  {colTasks.map((task) => (
                    <Card
                      key={task.id}
                      interactive
                      onClick={() => setActiveTask(task)}
                      className="p-3.5 border-white/[0.06] hover:border-cyan-500/40"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-semibold text-white">
                          {task.title}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {task.category}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-white/[0.04]">
                        <span>{task.estimatedMinutes}m duration</span>
                        <span className="capitalize font-mono text-[10px] text-cyan-400">
                          {task.priority}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details Side Drawer */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#14171F] border-l border-white/[0.1] h-full p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
                <Badge variant="cyan" size="sm">
                  {activeTask.category}
                </Badge>
                <button
                  onClick={() => setActiveTask(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="font-display font-bold text-xl text-white mb-2">
                {activeTask.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mb-6">
                <span>Estimated: {activeTask.estimatedMinutes}m</span>
                <span>·</span>
                <span className="capitalize">Priority: {activeTask.priority}</span>
              </div>

              {/* Subtasks Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase font-mono tracking-wider text-cyan-400">
                  Subtask Checklist ({activeTask.subtasks.filter((s) => s.isCompleted).length} /{' '}
                  {activeTask.subtasks.length})
                </h4>
                <div className="space-y-2">
                  {activeTask.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => handleToggleSubtask(activeTask.id, sub.id)}
                      className="p-3 rounded-lg bg-[#0F1218] border border-white/[0.06] hover:border-cyan-500/30 flex items-center gap-3 cursor-pointer text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={sub.isCompleted}
                        readOnly
                        className="h-4 w-4 rounded accent-cyan-400"
                      />
                      <span
                        className={
                          sub.isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                        }
                      >
                        {sub.title}
                      </span>
                    </div>
                  ))}
                  {activeTask.subtasks.length === 0 && (
                    <div className="text-xs text-slate-500 italic">No subtasks defined.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-6 border-t border-white/[0.08] flex items-center gap-3">
              {activeTask.status !== 'completed' ? (
                <Button
                  variant="glow"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    handleStatusChange(activeTask.id, 'completed');
                    setActiveTask(null);
                  }}
                >
                  Mark Completed
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="md"
                  className="flex-1"
                  onClick={() => {
                    handleStatusChange(activeTask.id, 'planned');
                    setActiveTask(null);
                  }}
                >
                  Reopen Task
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#14171F] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-6">
              <h3 className="font-display font-bold text-lg text-white">Create Smart Task</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <Input
                label="Task Title"
                placeholder="e.g. DSA Handwritten Practice"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#0F1218] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400"
                  >
                    <option value="Study">Study / DSA</option>
                    <option value="Projects">Projects</option>
                    <option value="Career">Career</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Routine">Routine</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-[#0F1218] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Estimated Minutes</label>
                <input
                  type="number"
                  min={5}
                  max={480}
                  value={newMinutes}
                  onChange={(e) => setNewMinutes(parseInt(e.target.value) || 30)}
                  className="w-full bg-[#0F1218] border border-white/[0.1] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Subtasks Checklist (One item per line)
                </label>
                <textarea
                  rows={3}
                  value={newSubtasks}
                  onChange={(e) => setNewSubtasks(e.target.value)}
                  placeholder="Review Dynamic Programming&#10;Write proofs&#10;Verify test cases"
                  className="w-full bg-[#0F1218] border border-white/[0.1] rounded-lg p-3 text-xs text-slate-100 outline-none focus:border-cyan-400 resize-none font-sans"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="glow" size="sm" type="submit">
                  Save Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
