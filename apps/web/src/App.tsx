import React, { useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AppDashboard } from './pages/AppDashboard';
import { TodayScreen } from './pages/TodayScreen';
import { CalendarScreen } from './pages/CalendarScreen';
import { TasksScreen } from './pages/TasksScreen';
import { ImportsScreen } from './pages/ImportsScreen';
import { AppShell } from './components/layout/AppShell';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'app'>('landing');
  const [activeScreen, setActiveScreen] = useState('today');

  // Handle direct navigation
  const handleOpenApp = () => {
    if (isAuthenticated) {
      setCurrentView('app');
    } else {
      setCurrentView('login');
    }
  };

  if (currentView === 'landing') {
    return <LandingPage onOpenApp={handleOpenApp} />;
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onSuccess={() => setCurrentView('app')}
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'today':
        return <TodayScreen />;
      case 'calendar':
        return <CalendarScreen />;
      case 'tasks':
        return <TasksScreen />;
      case 'imports':
        return <ImportsScreen />;
      default:
        return <AppDashboard onNavigate={setActiveScreen} />;
    }
  };

  return (
    <AppShell activeScreen={activeScreen} onNavigate={setActiveScreen}>
      {renderActiveScreen()}
    </AppShell>
  );
};

export default App;

