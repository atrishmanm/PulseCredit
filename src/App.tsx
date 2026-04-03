import { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { EngineScreen } from './components/EngineScreen';
import { ScannerScreen } from './components/ScannerScreen';
import { VaultScreen } from './components/VaultScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LifetimeScoreScreen } from './components/LifetimeScoreScreen';
import { DiseaseSelector } from './components/DiseaseSelector';
import { Screen } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { HealthProvider } from './context/HealthContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import { NotificationPopup } from './components/NotificationPopup';
import { Notification } from './types';
import { useHealth } from './context/HealthContext';
import { getUnreadNotifications, markNotificationAsRead } from './lib/notificationService';
import { initializeDailyUpdateSystem, calculateLifetimeScore } from './lib/dailyUpdateManager';

function AppContent() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, loading } = useAuth();
  const { scoreBreakdown, lifetimeScore, updateLifetimeScore } = useHealth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Simulate initial loading sequence
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Initialize daily update system and load notifications
  useEffect(() => {
    if (user && isLoaded) {
      // Initialize daily updates
      initializeDailyUpdateSystem(
        user.uid,
        scoreBreakdown.total,
        lifetimeScore,
        () => {
          updateLifetimeScore();
          return lifetimeScore;
        }
      ).catch(err => console.error('Error initializing daily updates:', err));

      // Load notifications from Firebase
      getUnreadNotifications(user.uid)
        .then(setNotifications)
        .catch(err => console.error('Error loading notifications:', err));
    }
  }, [user, isLoaded]);

  const handleDismissNotification = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-headline font-black text-primary text-xl">C</span>
          </div>
        </div>
        <p className="font-headline text-xs font-bold tracking-[0.3em] text-on-surface-variant animate-pulse">
          INITIALIZING CHRONOS...
        </p>
      </div>
    );
  }

  // Show auth screen if user is not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30">
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-tertiary/5 rounded-full blur-[150px]"></div>
        </div>
        <AuthScreen />
      </div>
    );
  }

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen />;
      case 'lifetime':
        return <LifetimeScoreScreen />;
      case 'engine':
        return <EngineScreen />;
      case 'scanner':
        return <ScannerScreen />;
      case 'vault':
        return <VaultScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/30">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-secondary/5 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-tertiary/5 rounded-full blur-[150px]"></div>
      </div>

      <TopBar />

      <DiseaseSelector />

      <main className="relative z-10 pt-24 px-6 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeScreen}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeScreen={activeScreen} onScreenChange={setActiveScreen} />

      <NotificationPopup
        notifications={notifications}
        onDismiss={handleDismissNotification}
        onViewAll={() => setActiveScreen('profile')}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <HealthProvider>
        <AppContent />
      </HealthProvider>
    </AuthProvider>
  );
}

export default App;
