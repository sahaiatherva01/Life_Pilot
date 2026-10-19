export type Category = 
  | 'Fitness'
  | 'Study'
  | 'Projects'
  | 'Career'
  | 'Sleep'
  | 'Skill'
  | 'Routine';

export type TaskStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'snoozed'
  | 'cancelled';

export interface SubtaskItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high';
  subtasks: SubtaskItem[];
  routine_template_id?: string;
  is_reminder_enabled: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  original_time_text?: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  category: Category;
  schedule_type: 'fixed' | 'flexible';
  subtasks: SubtaskItem[];
  sort_order: number;
  is_active: boolean;
}

export interface ImportPreviewRow {
  row_index: number;
  original_time: string;
  activity: string;
  parsed_start: string;
  parsed_end: string;
  duration_minutes: number;
  category: Category;
  schedule_type: 'fixed' | 'flexible';
  subtasks: SubtaskItem[];
  warnings: string[];
}

export interface ImportPreviewResponse {
  filename: string;
  total_rows: number;
  rows: ImportPreviewRow[];
}

export interface Reminder {
  id: string;
  task_id: string;
  task_title: string;
  task_category: Category;
  trigger_time: string;
  repeat_interval_minutes: number;
  status: 'pending' | 'fired' | 'snoozed' | 'dismissed' | 'completed';
  snoozed_until?: string;
  snooze_count: number;
  last_fired_at?: string;
}

export interface DailyBriefing {
  id: string;
  date: string;
  briefing_type: 'morning' | 'night';
  content: string;
  key_focus?: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'orion';
  content: string;
  timestamp: string;
  actions_taken?: any[];
}
