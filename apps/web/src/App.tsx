import React, { useState } from 'react';
import { useAuthStore } from './stores/authStore';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AppDashboard } from './pages/AppDashboard';
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

  return (
    <AppShell activeScreen={activeScreen} onNavigate={setActiveScreen}>
      <AppDashboard onNavigate={setActiveScreen} />
    </AppShell>
  );
};

export default App;
