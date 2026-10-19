import {
  DailyBriefing,
  ImportPreviewResponse,
  Reminder,
  RoutineTemplate,
  Task,
  TaskStatus,
} from '../types';

export const getApiBaseUrl = (): string => {
  return localStorage.getItem('lifepilot_api_url') || import.meta.env.VITE_API_URL || 'http://localhost:8000';
};

export const setApiBaseUrl = (url: string) => {
  localStorage.setItem('lifepilot_api_url', url.replace(/\/+$/, ''));
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('lifepilot_token');
};

export const setAuthToken = (token: string) => {
  localStorage.setItem('lifepilot_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('lifepilot_token');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Auto-set Content-Type if body is JSON string and not FormData
  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `API Error ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errorMsg;
    } catch (e) {
      // non-json response
    }
    throw new Error(errorMsg);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Auth
  async login(pin: string): Promise<{ access_token: string; token_type: string }> {
    const res = await request<{ access_token: string; token_type: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    });
    setAuthToken(res.access_token);
    return res;
  },

  async verifyToken(): Promise<boolean> {
    try {
      await request('/api/auth/verify');
      return true;
    } catch {
      return false;
    }
  },

  async changePin(currentPin: string, newPin: string): Promise<any> {
    return request('/api/auth/change-pin', {
      method: 'POST',
      body: JSON.stringify({ current_pin: currentPin, new_pin: newPin }),
    });
  },

  // Health
  async getHealth(): Promise<{ status: string; app: string; timezone: string }> {
    return request('/api/health');
  },

  // Tasks
  async getTasks(dateStr?: string, category?: string, status?: string): Promise<Task[]> {
    const params = new URLSearchParams();
    if (dateStr) params.append('date', dateStr);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    return request<Task[]>(`/api/tasks?${params.toString()}`);
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    return request<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return request<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
    return request<Task>(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async rescheduleTask(id: string, newStartTime: string, newEndTime: string): Promise<Task> {
    return request<Task>(`/api/tasks/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify({ new_start_time: newStartTime, new_end_time: newEndTime }),
    });
  },

  async deleteTask(id: string): Promise<void> {
    await request(`/api/tasks/${id}`, { method: 'DELETE' });
  },

  async getRoutineTemplates(): Promise<RoutineTemplate[]> {
    return request<RoutineTemplate[]>('/api/tasks/templates');
  },

  // Excel Importer
  async previewGuideExcel(file: File): Promise<ImportPreviewResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return request<ImportPreviewResponse>('/api/tasks/import/preview', {
      method: 'POST',
      body: formData,
    });
  },

  async confirmGuideImport(rows: any[], autoPopulateToday: boolean = true): Promise<any> {
    return request('/api/tasks/import/confirm', {
      method: 'POST',
      body: JSON.stringify({ rows, auto_populate_today: autoPopulateToday }),
    });
  },

  // Planner
  async getDaySchedule(dateStr?: string, autoGenerate: boolean = true): Promise<{
    date: string;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    pending_tasks: number;
    tasks: Task[];
  }> {
    const params = new URLSearchParams();
    if (dateStr) params.append('date', dateStr);
    params.append('auto_generate', String(autoGenerate));
    return request(`/api/planner/day?${params.toString()}`);
  },

  async getWeekOverview(startDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    return request(`/api/planner/week?${params.toString()}`);
  },

  async getStats(): Promise<{
    date: string;
    total_tasks: number;
    completed_tasks: number;
    adherence_percentage: number;
    total_scheduled_hours: number;
    category_distribution: Record<string, number>;
  }> {
    return request('/api/planner/stats');
  },

  // Reminders & Alarms
  async getActiveAlarms(): Promise<Reminder[]> {
    return request<Reminder[]>('/api/reminders/active');
  },

  async sendAlarmAction(reminderId: string, action: 'start' | 'snooze' | 'complete' | 'dismiss', snoozeMinutes: number = 10): Promise<any> {
    return request(`/api/reminders/${reminderId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, snooze_minutes: snoozeMinutes }),
    });
  },

  async createQuickAlarm(title: string, minutesFromNow: number = 5, category: string = 'Routine'): Promise<any> {
    return request('/api/reminders/quick', {
      method: 'POST',
      body: JSON.stringify({ title, minutes_from_now: minutesFromNow, category }),
    });
  },

  async getUpcomingAlarm(): Promise<{
    id: string;
    task_id: string;
    task_title: string;
    task_category: string;
    trigger_time: string;
    seconds_remaining: number;
    minutes_remaining: number;
  } | null> {
    return request('/api/reminders/upcoming');
  },

  async getLatestBriefing(type?: string): Promise<DailyBriefing | null> {
    const params = type ? `?briefing_type=${type}` : '';
    return request<DailyBriefing | null>(`/api/reminders/briefings/latest${params}`);
  },

  async triggerBriefing(type: 'morning' | 'night'): Promise<any> {
    return request(`/api/reminders/briefings/trigger-now?briefing_type=${type}`, {
      method: 'POST',
    });
  },

  // Orion AI Assistant
  async chatWithOrion(message: string): Promise<{ reply: string; actions_taken: any[] }> {
    return request('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },
};
