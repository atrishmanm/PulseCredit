import { useState } from 'react';
import { X, Plus, Footprints, Dumbbell, Droplets, Moon, Utensils, Zap, Check } from 'lucide-react';
import { useHealth } from '../context/HealthContext';
import { useAuth } from '../context/AuthContext';
import { saveHealthMetrics } from '../lib/dataService';
import { cn } from '@/src/lib/utils';

interface ManualHealthUpdateProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualHealthUpdate({ isOpen, onClose }: ManualHealthUpdateProps) {
  const { metrics, updateMetrics } = useHealth();
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    steps: metrics.activity.dailySteps,
    exercise: metrics.activity.exerciseMinutes,
    water: metrics.diet.waterLiters,
    sleep: metrics.sleep.averageHours,
    calories: metrics.diet.calories,
    protein: metrics.diet.proteinGrams,
  });

  const [activeTab, setActiveTab] = useState<'activity' | 'nutrition' | 'rest'>('activity');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSliderChange = (key: keyof typeof formData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authUser) {
      alert('Please log in first');
      return;
    }

    setIsSaving(true);

    try {
      const newMetrics = {
        activity: {
          ...metrics.activity,
          dailySteps: formData.steps,
          exerciseMinutes: formData.exercise,
        },
        diet: {
          ...metrics.diet,
          waterLiters: formData.water,
          calories: formData.calories,
          proteinGrams: formData.protein,
        },
        sleep: {
          ...metrics.sleep,
          averageHours: formData.sleep,
        },
      };

      // Update local state immediately
      updateMetrics(newMetrics);

      // Save immediately to Firebase (don't wait for debounce)
      await saveHealthMetrics(authUser.uid, newMetrics);

      // Show success state
      setShowSuccess(true);

      // Close after success feedback
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Error saving health metrics:', error);
      alert('Error saving data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const getStepsPercentage = () => Math.min(100, (formData.steps / 10000) * 100);
  const getExercisePercentage = () => Math.min(100, (formData.exercise / 60) * 100);
  const getWaterPercentage = () => Math.min(100, (formData.water / 3) * 100);
  const getSleepPercentage = () => Math.min(100, (formData.sleep / 10) * 100);
  const getCaloriesPercentage = () => Math.min(100, (formData.calories / 2500) * 100);
  const getProteinPercentage = () => Math.min(100, (formData.protein / 100) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-end md:items-center justify-center pb-24 md:pb-0 animate-in fade-in">
      <div className="bg-surface-container-low w-full md:w-[500px] rounded-t-3xl md:rounded-3xl p-0 max-h-[85vh] md:max-h-[95vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 md:zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 px-6 py-6 flex items-center justify-between border-b border-outline-variant/10 sticky top-0">
          <div>
            <h2 className="font-headline text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Today's Health
            </h2>
            <p className="text-xs text-on-surface-variant mt-1">Quick entry for your daily metrics</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-6 overflow-x-auto">
          {[
            { id: 'activity' as const, label: 'Activity', icon: Footprints },
            { id: 'nutrition' as const, label: 'Nutrition', icon: Utensils },
            { id: 'rest' as const, label: 'Rest', icon: Moon },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-primary text-on-primary shadow-lg"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              {/* Steps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Footprints className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Daily Steps</p>
                      <p className="text-[10px] text-on-surface-variant">Goal: 10,000</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black font-headline text-primary">{formData.steps.toLocaleString()}</p>
                  </div>
                </div>

                {/* Circular Progress */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-container-highest" />
                      <circle
                        cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                        className="text-primary transition-all duration-500"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (283 * getStepsPercentage()) / 100}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-bold text-primary">{Math.round(getStepsPercentage())}%</p>
                      <p className="text-[10px] text-on-surface-variant">of goal</p>
                    </div>
                  </div>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="20000"
                  step="100"
                  value={formData.steps}
                  onChange={(e) => handleSliderChange('steps', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                />

                {/* Quick buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[3000, 5000, 7500, 10000].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSliderChange('steps', value)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold transition-all",
                        formData.steps === value
                          ? "bg-primary text-on-primary shadow-md"
                          : "bg-surface-container hover:bg-surface-container-high"
                      )}
                    >
                      {(value / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercise */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Exercise Time</p>
                      <p className="text-[10px] text-on-surface-variant">Goal: 60 mins</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black font-headline text-secondary">{formData.exercise}</p>
                    <p className="text-[10px] text-on-surface-variant">mins</p>
                  </div>
                </div>

                <div className="relative h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-gradient-to-r from-secondary to-secondary-container transition-all duration-500 rounded-full"
                    style={{ width: `${getExercisePercentage()}%` }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={formData.exercise}
                  onChange={(e) => handleSliderChange('exercise', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-secondary"
                />

                <div className="grid grid-cols-4 gap-2">
                  {[15, 30, 45, 60].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSliderChange('exercise', value)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold transition-all",
                        formData.exercise === value
                          ? "bg-secondary text-on-secondary shadow-md"
                          : "bg-surface-container hover:bg-surface-container-high"
                      )}
                    >
                      {value}min
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Nutrition Tab */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6">
              {/* Water */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                      <Droplets className="w-5 h-5 text-tertiary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Hydration</p>
                      <p className="text-[10px] text-on-surface-variant">Goal: 2.5L</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black font-headline text-tertiary">{formData.water.toFixed(1)}</p>
                    <p className="text-[10px] text-on-surface-variant">liters</p>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={formData.water}
                  onChange={(e) => handleSliderChange('water', parseFloat(e.target.value))}
                  className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-tertiary"
                />

                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1.5, 2.5, 3.5].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSliderChange('water', value)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold transition-all",
                        Math.abs(formData.water - value) < 0.1
                          ? "bg-tertiary text-on-tertiary shadow-md"
                          : "bg-surface-container hover:bg-surface-container-high"
                      )}
                    >
                      {value}L
                    </button>
                  ))}
                </div>
              </div>

              {/* Calories */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Calories</p>
                      <p className="text-[10px] text-on-surface-variant">Goal: 2000 kcal</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black font-headline text-primary">{formData.calories}</p>
                    <p className="text-[10px] text-on-surface-variant">kcal</p>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="4000"
                  step="50"
                  value={formData.calories}
                  onChange={(e) => handleSliderChange('calories', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                />

                <div className="grid grid-cols-4 gap-2">
                  {[1000, 1500, 2000, 2500].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSliderChange('calories', value)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold transition-all",
                        formData.calories === value
                          ? "bg-primary text-on-primary shadow-md"
                          : "bg-surface-container hover:bg-surface-container-high"
                      )}
                    >
                      {value / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Protein */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <Utensils className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Protein</p>
                      <p className="text-[10px] text-on-surface-variant">Goal: 80g</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black font-headline text-secondary">{formData.protein}</p>
                    <p className="text-[10px] text-on-surface-variant">g</p>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={formData.protein}
                  onChange={(e) => handleSliderChange('protein', parseInt(e.target.value))}
                  className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-secondary"
                />

                <div className="grid grid-cols-4 gap-2">
                  {[30, 50, 80, 120].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSliderChange('protein', value)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold transition-all",
                        formData.protein === value
                          ? "bg-secondary text-on-secondary shadow-md"
                          : "bg-surface-container hover:bg-surface-container-high"
                      )}
                    >
                      {value}g
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Rest Tab */}
          {activeTab === 'rest' && (
            <div className="space-y-6">
              {/* Sleep */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Moon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Sleep Duration</p>
                      <p className="text-[10px] text-on-surface-variant">Goal: 8 hours</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black font-headline text-primary">{formData.sleep.toFixed(1)}</p>
                    <p className="text-[10px] text-on-surface-variant">hours</p>
                  </div>
                </div>

                {/* Sleep rings */}
                <div className="grid grid-cols-8 gap-2">
                  {Array.from({ length: 24 }).map((_, i) => {
                    const value = i / 3;
                    const isFilled = value <= formData.sleep;
                    return (
                      <div
                        key={i}
                        onClick={() => handleSliderChange('sleep', parseFloat((value + 0.5).toFixed(1)))}
                        className={cn(
                          "h-8 rounded-lg cursor-pointer transition-all duration-300 hover:scale-110",
                          isFilled ? "bg-primary shadow-lg" : "bg-surface-container hover:bg-surface-container-high"
                        )}
                      />
                    );
                  })}
                </div>

                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={formData.sleep}
                  onChange={(e) => handleSliderChange('sleep', parseFloat(e.target.value))}
                  className="w-full h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer accent-primary"
                />

                <div className="grid grid-cols-5 gap-2">
                  {[4, 6, 8, 10, 12].map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSliderChange('sleep', value)}
                      className={cn(
                        "py-2 rounded-lg text-xs font-bold transition-all",
                        formData.sleep === value
                          ? "bg-primary text-on-primary shadow-md"
                          : "bg-surface-container hover:bg-surface-container-high"
                      )}
                    >
                      {value}h
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </form>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 bg-surface-container-low border-t border-outline-variant/10 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 py-3 text-on-surface font-bold border border-outline-variant/20 rounded-full hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className={cn(
              "flex-1 py-3 font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-md",
              showSuccess
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-gradient-to-r from-primary to-primary-container text-on-primary hover:shadow-lg hover:shadow-primary/20 disabled:opacity-50"
            )}
          >
            {showSuccess ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Save & Update
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
