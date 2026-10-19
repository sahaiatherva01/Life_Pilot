import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { TodayTimeline } from './components/TodayTimeline';
import { CalendarView } from './components/CalendarView';
import { LandingPage } from './components/LandingPage';
import { AlarmModal } from './components/AlarmModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { OrionDrawer } from './components/OrionDrawer';
import { SettingsModal } from './components/SettingsModal';
import { PinLockScreen } from './components/PinLockScreen';
import { Reminder, Task, TaskStatus } from './types';
import { api, clearAuthToken, getAuthToken } from './services/api';
import { sound } from './utils/audio';

export const App: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'landing'>('today');
  const [currentDate, setCurrentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [activeAlarms, setActiveAlarms] = useState<Reminder[]>([]);
  const [upcomingAlarm, setUpcomingAlarm] = useState<any>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // Modals state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isOrionOpen, setIsOrionOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial authentication check
  useEffect(() => {
    const checkAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsUnlocked(false);
        return;
      }
      const valid = await api.verifyToken();
      if (valid) {
        setIsUnlocked(true);
      } else {
        clearAuthToken();
        setIsUnlocked(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch tasks and poll alarms whenever unlocked
  useEffect(() => {
    if (!isUnlocked) return;
    loadDaySchedule(currentDate);

    // Poll active alarms and upcoming alarms every 8 seconds
    const pollAlarms = async () => {
      try {
        const [alarms, upcoming] = await Promise.all([
          api.getActiveAlarms(),
          api.getUpcomingAlarm(),
        ]);
        setActiveAlarms(alarms);
        setUpcomingAlarm(upcoming);
        setBackendOnline(true);

        // If an alarm just fired and browser notifications are enabled, trigger system alert
        if (alarms.length > 0 && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          const first = alarms[0];
          new Notification(`⏰ LifePilot Alarm: ${first.task_title}`, {
            body: `Scheduled block is due now (${first.task_category}). Tap to open LifePilot.`,
            icon: '/favicon.svg',
          });
        }
      } catch (e) {
        setBackendOnline(false);
      }
    };

    pollAlarms();
    const interval = setInterval(pollAlarms, 8000);
    return () => clearInterval(interval);
  }, [isUnlocked, currentDate]);

  const loadDaySchedule = async (dateStr: string) => {
    try {
      const schedule = await api.getDaySchedule(dateStr, true);
      setTasks(schedule.tasks);
      setBackendOnline(true);
    } catch (e) {
      setBackendOnline(false);
    }
  };

  const handleUnlock = async (pin: string): Promise<boolean> => {
    try {
      await api.login(pin);
      setIsUnlocked(true);
      // Request desktop notifications upon login
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        Notification.requestPermission().then(perm => setNotificationPermission(perm));
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleLock = () => {
    clearAuthToken();
    setIsUnlocked(false);
  };

  const handleRequestNotificationPermission = () => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission().then(perm => {
        setNotificationPermission(perm);
        if (perm === 'granted') {
          new Notification('LifePilot Alerts Armed', {
            body: 'You will receive exact desktop alerts when your scheduled tasks are due.',
          });
        }
      });
    }
  };

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    try {
      await api.updateTaskStatus(taskId, status);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, status } : t))
      );
    } catch (e) {
      alert('Failed to update task status.');
    }
  };

  const handleReschedule = async (taskId: string, newStart: string, newEnd: string) => {
    try {
      const updated = await api.rescheduleTask(taskId, newStart, newEnd);
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? updated : t))
      );
      sound.playSuccess();
    } catch (e: any) {
      alert(`Failed to reschedule: ${e.message}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (e) {
      alert('Failed to delete task.');
    }
  };

  const handleCreateTask = async (newTaskData: Partial<Task>) => {
    try {
      const created = await api.createTask(newTaskData);
      setTasks(prev => [...prev, created].sort((a, b) => a.start_time.localeCompare(b.start_time)));
      sound.playSuccess();
    } catch (e: any) {
      alert(`Failed to create task: ${e.message}`);
    }
  };

  const handleQuickAlarm = async (title: string, minutes: number) => {
    try {
      await api.createQuickAlarm(title, minutes);
      sound.playSuccess();
      loadDaySchedule(currentDate);
      const upcoming = await api.getUpcomingAlarm();
      setUpcomingAlarm(upcoming);
    } catch (e: any) {
      alert(`Failed to arm quick alarm: ${e.message}`);
    }
  };

  const handleToggleSubtask = async (taskId: string, subtaskIndex: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    sound.playClick();
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;

    try {
      const updated = await api.updateTask(taskId, { subtasks: updatedSubtasks });
      setTasks(prev => prev.map(t => (t.id === taskId ? updated : t)));
    } catch (e) {}
  };

  const handleAlarmAction = async (
    reminderId: string,
    action: 'start' | 'snooze' | 'complete' | 'dismiss',
    minutes: number = 10
  ) => {
    try {
      await api.sendAlarmAction(reminderId, action, minutes);
      setActiveAlarms(prev => prev.filter(a => a.id !== reminderId));
      loadDaySchedule(currentDate);
      const upcoming = await api.getUpcomingAlarm();
      setUpcomingAlarm(upcoming);
    } catch (e) {}
  };

  if (!isUnlocked) {
    return <PinLockScreen onUnlock={handleUnlock} />;
  }

  const currentAlarm = activeAlarms.length > 0 ? activeAlarms[0] : null;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenOrion={() => setIsOrionOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLock={handleLock}
        backendOnline={backendOnline}
        activeAlarmCount={activeAlarms.length}
        upcomingAlarm={upcomingAlarm}
        notificationPermission={notificationPermission}
        onRequestNotificationPermission={handleRequestNotificationPermission}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {activeTab === 'today' && (
          <TodayTimeline
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            tasks={tasks}
            onStatusChange={handleStatusChange}
            onReschedule={handleReschedule}
            onDeleteTask={handleDeleteTask}
            onCreateTask={handleCreateTask}
            onOpenImport={() => setIsImportOpen(true)}
            onToggleSubtask={handleToggleSubtask}
            onQuickAlarm={handleQuickAlarm}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            onSelectDate={(newDate) => {
              setCurrentDate(newDate);
              setActiveTab('today');
            }}
          />
        )}

        {activeTab === 'landing' && (
          <LandingPage
            onLaunchApp={() => setActiveTab('today')}
            onOpenImport={() => setIsImportOpen(true)}
          />
        )}
      </main>

      {/* Persistent Alarm Ringing Modal */}
      <AlarmModal
        alarm={currentAlarm}
        onAction={handleAlarmAction}
      />

      {/* Guide.xlsx Import Modal */}
      <ExcelImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => loadDaySchedule(currentDate)}
      />

      {/* Orion AI Assistant Slide-out Drawer */}
      <OrionDrawer
        isOpen={isOrionOpen}
        onClose={() => setIsOrionOpen(false)}
        onTaskModified={() => loadDaySchedule(currentDate)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsSaved={() => loadDaySchedule(currentDate)}
      />
    </div>
  );
};

export default App;
