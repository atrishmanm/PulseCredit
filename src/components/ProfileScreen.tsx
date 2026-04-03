import { useState } from 'react';
import { GlassCard } from './GlassCard';
import { ManualHealthUpdate } from './ManualHealthUpdate';
import { SettingsModal } from './SettingsModal';
import { HealthDashboard } from './HealthDashboard';
import { ScoreGauge } from './ScoreGauge';
import { Settings, LogOut, ChevronRight, Shield, Bell, CreditCard, User, Heart, Activity, BarChart3, Plus, X, Loader, AlertCircle } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { useAuth } from '../context/AuthContext';
import { analyzeHealthConditionWithAI, PersonalizedHealthPlan } from '../lib/aiHealthAnalysis';
import { cn } from '../lib/utils';

interface ProfileScreenProps {}

export function ProfileScreen({}: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'health'>('overview');
  const { metrics, updateMetrics, scoreBreakdown, user } = useHealth();
  const { setUserDisease } = useAuth();
  const [isHealthConnectSyncing, setIsHealthConnectSyncing] = useState(false);
  const [isManualUpdateOpen, setIsManualUpdateOpen] = useState(false);
  const [showDataViewer, setShowDataViewer] = useState(false);
  const [settingsModal, setSettingsModal] = useState<'personal' | 'health' | 'privacy' | 'notifications' | 'subscription' | null>(null);
  const [showDiseaseEditor, setShowDiseaseEditor] = useState(false);
  const [diseaseInput, setDiseaseInput] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [plan, setPlan] = useState<PersonalizedHealthPlan | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleHealthConnectSync = async () => {
    setIsHealthConnectSyncing(true);
    try {
      setShowDataViewer(true);
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

  const handleDiseaseAnalyze = async () => {
    if (!diseaseInput.trim()) {
      setError('Please enter your health condition');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      const result = await analyzeHealthConditionWithAI(diseaseInput);
      setPlan(result);
      if (result.errorMessage) {
        setError(result.errorMessage);
      }
    } catch (err) {
      setError('Could not analyze health condition. Please try again.');
      console.error('Error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDiseaseConfirm = async () => {
    if (!plan) return;
    setLoading(true);
    try {
      await setUserDisease(plan.disease);
      setShowDiseaseEditor(false);
      setPlan(null);
      setDiseaseInput('');
    } catch (error) {
      console.error('Error setting disease:', error);
      setError('Error saving disease profile');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Score Gauge Card */}
          <div className="bg-surface-container-low rounded-2xl p-8 flex flex-col items-center border border-white/5">
            <div className="text-center mb-6 space-y-2">
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Your Health Score</p>
              <p className="text-sm text-on-surface-variant">Vitality and wellness metrics</p>
            </div>
            <ScoreGauge score={scoreBreakdown.total} maxScore={100} size="md" showLabel={true} />
          </div>

          <div className="bg-surface-container p-6 rounded-xl border border-white/5">
            <Activity className="w-6 h-6 text-primary mb-3" />
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">Vitality Score Legacy</p>
            <p className="text-2xl font-black font-headline text-white">{scoreBreakdown.total}</p>
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
                onClick={() => setShowDiseaseEditor(true)}
                className="bg-tertiary text-on-tertiary px-6 py-2 rounded-full text-xs font-bold w-full sm:w-auto hover:bg-tertiary/90 transition-colors"
              >
                {user.disease ? 'EDIT' : 'SETUP'}
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

          <ManualHealthUpdate isOpen={isManualUpdateOpen} onClose={() => setIsManualUpdateOpen(false)} />
          <SettingsModal isOpen={settingsModal !== null} onClose={() => setSettingsModal(null)} tab={settingsModal} />

          {/* Data Viewer Modal */}
          {showDataViewer && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container rounded-2xl max-w-md w-full p-8 space-y-6 border border-white/10 max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                  onClick={() => setShowDataViewer(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="text-center space-y-2">
                  <Activity className="w-8 h-8 text-primary mx-auto" />
                  <h2 className="font-headline text-2xl font-bold text-on-surface">
                    Your Health Data
                  </h2>
                  <p className="text-xs text-on-surface-variant">Current tracked metrics</p>
                </div>

                {/* Data Grid */}
                <div className="space-y-4">
                  {/* Activity Section */}
                  <div className="bg-surface-container-high rounded-xl p-4 border border-white/5 space-y-3">
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">🏃 Activity</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="text-[10px] text-on-surface-variant uppercase">Daily Steps</p>
                        <p className="text-xl font-bold text-on-surface mt-1">{metrics.activity.dailySteps.toLocaleString()}</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="text-[10px] text-on-surface-variant uppercase">Exercise</p>
                        <p className="text-xl font-bold text-on-surface mt-1">{metrics.activity.exerciseMinutes}m</p>
                      </div>
                    </div>
                  </div>

                  {/* Nutrition Section */}
                  <div className="bg-surface-container-high rounded-xl p-4 border border-white/5 space-y-3">
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider">🍽️ Nutrition</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="text-[10px] text-on-surface-variant uppercase">Calories</p>
                        <p className="text-xl font-bold text-on-surface mt-1">{metrics.diet.calories.toLocaleString()}</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="text-[10px] text-on-surface-variant uppercase">Protein</p>
                        <p className="text-xl font-bold text-on-surface mt-1">{metrics.diet.proteinGrams}g</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="text-[10px] text-on-surface-variant uppercase">Water</p>
                        <p className="text-xl font-bold text-on-surface mt-1">{metrics.diet.waterLiters.toFixed(1)}L</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="text-[10px] text-on-surface-variant uppercase">Healthy %</p>
                        <p className="text-xl font-bold text-on-surface mt-1">{metrics.diet.healthyMealsPercentage}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Rest Section */}
                  <div className="bg-surface-container-high rounded-xl p-4 border border-white/5 space-y-3">
                    <p className="text-xs font-bold text-tertiary uppercase tracking-wider">😴 Rest</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="text-[10px] text-on-surface-variant uppercase">Sleep Hours</p>
                        <p className="text-xl font-bold text-on-surface mt-1">{metrics.sleep.averageHours.toFixed(1)}h</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="text-[10px] text-on-surface-variant uppercase">Quality</p>
                        <p className="text-xl font-bold text-on-surface mt-1">{metrics.sleep.quality}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Stress Section */}
                  <div className="bg-surface-container-high rounded-xl p-4 border border-white/5 space-y-3">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">🧘 Wellness</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="text-[10px] text-on-surface-variant uppercase">Stress Level</p>
                        <p className="text-xl font-bold text-on-surface mt-1">{metrics.stress.level}/10</p>
                      </div>
                      <div className="bg-surface-container rounded-lg p-3">
                        <p className="text-[10px] text-on-surface-variant uppercase">Meditation</p>
                        <p className="text-xl font-bold text-on-surface mt-1">{metrics.stress.meditationMinutes}m</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setShowDataViewer(false)}
                  className="w-full py-3 bg-primary text-on-primary font-bold rounded-full hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Disease Editor Modal */}
          {showDiseaseEditor && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-surface-container rounded-2xl max-w-xl w-full p-8 space-y-8 border border-white/10 max-h-[90vh] overflow-y-auto relative">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowDiseaseEditor(false);
                    setPlan(null);
                    setDiseaseInput('');
                    setError('');
                  }}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Show Plan or Input */}
                {!plan ? (
                  <>
                    {/* Header */}
                    <div className="text-center space-y-3">
                      <Heart className="w-8 h-8 text-secondary mx-auto" />
                      <h1 className="font-headline text-3xl font-extrabold text-on-surface">
                        Edit Your Health Profile
                      </h1>
                      <p className="text-on-surface-variant text-sm">
                        Describe your health condition - AI will create a personalized plan
                      </p>
                    </div>

                    {/* Input Form */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-on-surface">
                          Your Health Condition
                        </label>
                        <textarea
                          autoFocus
                          placeholder="e.g., I have type 2 diabetes and trying to manage my blood sugar levels..."
                          value={diseaseInput}
                          onChange={(e) => {
                            setDiseaseInput(e.target.value);
                            setError('');
                          }}
                          disabled={analyzing}
                          rows={4}
                          className="w-full bg-surface-container-high text-on-surface px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none transition-colors resize-none"
                        />
                      </div>

                      {error && (
                        <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                          <p className="text-sm text-red-400">{error}</p>
                        </div>
                      )}

                      <button
                        onClick={handleDiseaseAnalyze}
                        disabled={analyzing || !diseaseInput.trim()}
                        className={cn(
                          'w-full px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2',
                          analyzing || !diseaseInput.trim()
                            ? 'bg-primary/50 text-on-primary/50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary to-primary-container text-on-primary hover:shadow-lg'
                        )}
                      >
                        {analyzing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            Analyze & Save
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Confirmation Screen */}
                    <div className="text-center space-y-2">
                      <Heart className="w-8 h-8 text-secondary mx-auto" />
                      <h1 className="font-headline text-3xl font-extrabold text-on-surface">
                        Your Personalized Health Plan
                      </h1>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-surface-container-high rounded-xl p-4 border border-white/10">
                        <p className="text-xs font-bold text-on-surface-variant uppercase mb-2">Profile</p>
                        <p className="text-on-surface font-semibold">{plan.healthProfile}</p>
                        <p className="text-xs text-on-surface-variant mt-2">AI Confidence: <strong>{plan.confidence}%</strong></p>
                      </div>

                      <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                        <p className="text-xs font-bold text-primary uppercase mb-3">🎯 Personalized Targets</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-surface-container rounded-lg p-3">
                            <p className="text-xs text-on-surface-variant">Daily Steps</p>
                            <p className="text-xl font-bold">{plan.personalizedTargets.dailySteps.toLocaleString()}</p>
                          </div>
                          <div className="bg-surface-container rounded-lg p-3">
                            <p className="text-xs text-on-surface-variant">Sleep</p>
                            <p className="text-xl font-bold">{plan.personalizedTargets.sleepHours}h</p>
                          </div>
                          <div className="bg-surface-container rounded-lg p-3">
                            <p className="text-xs text-on-surface-variant">Calories</p>
                            <p className="text-xl font-bold">{plan.personalizedTargets.calorieTarget.toLocaleString()}</p>
                          </div>
                          <div className="bg-surface-container rounded-lg p-3">
                            <p className="text-xs text-on-surface-variant">Exercise</p>
                            <p className="text-xl font-bold">{plan.personalizedTargets.exerciseMinutes}m</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-white/5">
                      <button
                        onClick={() => {
                          setPlan(null);
                          setDiseaseInput('');
                        }}
                        disabled={loading}
                        className="flex-1 px-6 py-3 rounded-lg text-on-surface font-bold bg-surface-container border border-surface-container-highest hover:bg-surface-container-high transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleDiseaseConfirm}
                        disabled={loading}
                        className={cn(
                          'flex-1 px-6 py-3 rounded-lg text-on-primary font-bold transition-all flex items-center justify-center gap-2',
                          loading ? 'bg-primary/50' : 'bg-gradient-to-r from-primary to-primary-container hover:shadow-lg'
                        )}
                      >
                        {loading ? (
                          <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Heart className="w-4 h-4" />
                            Confirm & Save
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <HealthDashboard />
      )}
    </div>
  );
}
