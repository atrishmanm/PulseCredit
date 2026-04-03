import { useState } from 'react';
import { GlassCard } from './GlassCard';
import { ManualHealthUpdate } from './ManualHealthUpdate';
import { SettingsModal } from './SettingsModal';
import { DiseaseProfileSetup } from './DiseaseProfileSetup';
import { HealthDashboard } from './HealthDashboard';
import { Settings, LogOut, ChevronRight, Shield, Bell, CreditCard, User, Heart, Activity, BarChart3, Plus } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { cn } from '../lib/utils';

interface ProfileScreenProps {}

export function ProfileScreen({}: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'health'>('overview');
  const { metrics, updateMetrics, scoreBreakdown, user } = useHealth();
  const [isHealthConnectSyncing, setIsHealthConnectSyncing] = useState(false);
  const [isManualUpdateOpen, setIsManualUpdateOpen] = useState(false);
  const [isDiseaseSetupOpen, setIsDiseaseSetupOpen] = useState(false);
  const [settingsModal, setSettingsModal] = useState<'personal' | 'health' | 'privacy' | 'notifications' | 'subscription' | null>(null);

  const handleHealthConnectSync = async () => {
    setIsHealthConnectSyncing(true);
    try {
      // Check if user has actual data from food logs
      if (metrics.diet.calories > 0 || metrics.activity.dailySteps > 0) {
        // Show existing real data
        alert('✅ Already synced!\n\n📊 Your Current Data:\n• ' + metrics.activity.dailySteps.toLocaleString() + ' steps\n• ' + metrics.activity.exerciseMinutes + ' min exercise\n• ' + metrics.diet.calories + ' kcal\n• ' + metrics.sleep.averageHours + 'h sleep');
      } else {
        // No real data yet
        alert('❌ No tracked data yet!\n\nTo sync:\n1. Go to Scanner → Upload food photo\n2. Go to Profile → UPDATE → Manually add data\n3. Or connect Google Health Connect (setup required)');
      }
    } catch (error) {
      console.error('Sync error:', error);
    } finally {
      setIsHealthConnectSyncing(false);
    }
  };

  const menuItems = [
    { icon: User, label: 'Personal Information', sub: 'Biometric data & identity' },
    { icon: Heart, label: 'Health Preferences', sub: 'Dietary & activity goals' },
    { icon: Shield, label: 'Privacy & Security', sub: 'Data vault encryption' },
    { icon: Bell, label: 'Notifications', sub: 'Alerts & smart reminders' },
    { icon: CreditCard, label: 'Subscription', sub: 'Chronos Elite Member' },
  ];

  return (
    <div className="space-y-12 pb-32">
      <header className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-primary p-1">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-on-primary p-2 rounded-full border-4 border-background">
            <Settings className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-black font-headline tracking-tight">{user.name}</h1>
          <p className="text-on-surface-variant font-medium uppercase tracking-widest text-xs mt-1">
            {user.email}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container px-6 py-2 rounded-full border border-white/5">
            <span className="text-primary font-bold">Level {user.level}</span>
          </div>
          <div className="bg-surface-container px-6 py-2 rounded-full border border-white/5">
            <span className="text-secondary font-bold">{user.streak} Day Streak</span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex gap-2 bg-surface-container p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all",
            activeTab === 'overview'
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={cn(
            "flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2",
            activeTab === 'health'
              ? "bg-primary text-on-primary shadow-lg"
              : "text-on-surface-variant hover:text-on-surface"
          )}
        >
          <BarChart3 className="w-4 h-4" />
          Health Dashboard
        </button>
      </div>

      {activeTab === 'overview' ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container p-6 rounded-xl border border-white/5">
              <Activity className="w-6 h-6 text-primary mb-3" />
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Vitality Score</p>
              <p className="text-2xl font-black font-headline text-white">{scoreBreakdown.total}</p>
            </div>
            <div className="bg-surface-container p-6 rounded-xl border border-white/5">
              <Shield className="w-6 h-6 text-secondary mb-3" />
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Vault Status</p>
              <p className="text-2xl font-black font-headline text-white">Secure</p>
            </div>
          </div>

          <section className="space-y-4">
            <div className="bg-surface-container rounded-xl p-6 border border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Your Real Health Data</h3>
                  <p className="text-xs text-on-surface-variant">View tracked metrics from food logs & manual updates</p>
                </div>
              </div>
              <button
                onClick={handleHealthConnectSync}
                disabled={isHealthConnectSyncing}
                className="bg-primary text-on-primary px-6 py-2 rounded-full text-xs font-bold w-full sm:w-auto hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isHealthConnectSyncing ? 'CHECKING...' : 'VIEW DATA'}
              </button>
            </div>

            <div className="bg-surface-container rounded-xl p-6 border border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Plus className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold">Manual Health Update</h3>
                  <p className="text-xs text-on-surface-variant">Add steps, food, sleep, exercise data</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualUpdateOpen(true)}
                className="bg-secondary text-on-secondary px-6 py-2 rounded-full text-xs font-bold w-full sm:w-auto hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                UPDATE
              </button>
            </div>

            <div className="bg-surface-container rounded-xl p-6 border border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-tertiary" />
                </div>
                <div>
                  <h3 className="font-bold">Personalized Health Profile</h3>
                  <p className="text-xs text-on-surface-variant">
                    {user.disease ? `📊 ${user.disease.charAt(0).toUpperCase() + user.disease.slice(1)} Management` : 'Set your health condition for smart goals'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDiseaseSetupOpen(true)}
                className="bg-tertiary text-on-tertiary px-6 py-2 rounded-full text-xs font-bold w-full sm:w-auto hover:bg-tertiary/90 transition-colors"
              >
                SETUP
              </button>
            </div>

            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-2 mb-4 mt-6">Account Settings</h3>
            <div className="bg-surface-container rounded-xl overflow-hidden border border-white/5">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (item.label === 'Personal Information') setSettingsModal('personal');
                    if (item.label === 'Health Preferences') setSettingsModal('health');
                    if (item.label === 'Privacy & Security') setSettingsModal('privacy');
                    if (item.label === 'Notifications') setSettingsModal('notifications');
                    if (item.label === 'Subscription') setSettingsModal('subscription');
                  }}
                  className="w-full flex items-center justify-between p-5 hover:bg-surface-container-high transition-colors border-b border-outline-variant/10 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-on-surface-variant" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm">{item.label}</p>
                      <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                </button>
              ))}
            </div>
          </section>

          <button className="w-full flex items-center justify-center gap-2 p-5 text-tertiary font-bold hover:bg-tertiary/5 rounded-xl transition-colors">
            <LogOut className="w-5 h-5" />
            Log Out
          </button>

          <div className="text-center">
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Chronos v1.0.4-beta</p>
            <p className="text-[9px] text-on-surface-variant/50 mt-1">End-to-end encrypted biological data</p>
          </div>

          <ManualHealthUpdate isOpen={isManualUpdateOpen} onClose={() => setIsManualUpdateOpen(false)} />
          <DiseaseProfileSetup isOpen={isDiseaseSetupOpen} onClose={() => setIsDiseaseSetupOpen(false)} />
          <SettingsModal isOpen={settingsModal !== null} onClose={() => setSettingsModal(null)} tab={settingsModal} />
        </>
      ) : (
        <HealthDashboard />
      )}
    </div>
  );
}
