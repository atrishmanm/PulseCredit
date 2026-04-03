import { useState } from 'react';
import { useHealth } from '../context/HealthContext';
import { useAuth } from '../context/AuthContext';
import { Heart, AlertCircle, TrendingDown, Activity } from 'lucide-react';
import { cn } from '../lib/utils';

interface DiseaseProfileSetupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DiseaseProfileSetup({ isOpen, onClose }: DiseaseProfileSetupProps) {
  const { user, updateUser } = useHealth();
  const { setUserDisease } = useAuth();
  const [selectedDisease, setSelectedDisease] = useState<string>(user.disease || 'none');
  const [bmi, setBmi] = useState<string>(user.bmi?.toString() || '');
  const [showTargets, setShowTargets] = useState(false);
  const [saving, setSaving] = useState(false);

  const diseases = [
    {
      id: 'none',
      name: 'General Health',
      description: 'Balanced fitness & wellness tracking',
      icon: '💚',
      targets: { steps: 9000, sleep: '7.5h', calories: 2000 }
    },
    {
      id: 'diabetes',
      name: 'Diabetes Management',
      description: 'Glucose control & consistency focus',
      icon: '🩺',
      targets: { steps: 7000, sleep: '8h', calories: 2000 }
    },
    {
      id: 'obesity',
      name: 'Weight Loss',
      description: 'Metabolic improvement & activity boost',
      icon: '🏃',
      targets: { steps: 11000, sleep: '8h', calories: 1800 }
    },
    {
      id: 'hypertension',
      name: 'Blood Pressure',
      description: 'Cardio health & stress management',
      icon: '❤️',
      targets: { steps: 10000, sleep: '7h', calories: 2000 }
    }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to local health context
      updateUser({
        disease: selectedDisease,
        bmi: bmi ? parseFloat(bmi) : undefined
      });

      // Also save to Firebase auth context
      await setUserDisease(selectedDisease);

      onClose();
    } catch (error) {
      console.error('Error saving disease profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full bg-surface rounded-t-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold text-on-surface">Health Profile</h2>
          </div>
          <p className="text-sm text-on-surface-variant">
            Personalize your health targets based on your condition
          </p>
        </div>

        {/* Disease Selection */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Select Your Profile</h3>
          <div className="grid grid-cols-2 gap-3">
            {diseases.map((disease) => (
              <button
                key={disease.id}
                onClick={() => {
                  setSelectedDisease(disease.id as any);
                  setShowTargets(true);
                }}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left space-y-2',
                  selectedDisease === disease.id
                    ? 'border-primary bg-primary/10'
                    : 'border-surface-container-highest bg-surface-container-high hover:border-primary/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{disease.icon}</span>
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2',
                    selectedDisease === disease.id
                      ? 'border-primary bg-primary'
                      : 'border-on-surface-variant'
                  )} />
                </div>
                <p className="font-bold text-xs text-on-surface">{disease.name}</p>
                <p className="text-[10px] text-on-surface-variant leading-tight">{disease.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Personalized Targets */}
        {showTargets && (
          <div className="bg-surface-container-high p-4 rounded-xl space-y-3 border border-surface-container-highest">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-secondary" />
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Research-Backed Targets</h4>
            </div>
            {diseases.find(d => d.id === selectedDisease) && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Daily Steps</span>
                  <span className="font-bold text-on-surface">{diseases.find(d => d.id === selectedDisease)?.targets.steps.toLocaleString()} steps</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Sleep Target</span>
                  <span className="font-bold text-on-surface">{diseases.find(d => d.id === selectedDisease)?.targets.sleep}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Calorie Budget</span>
                  <span className="font-bold text-on-surface">{diseases.find(d => d.id === selectedDisease)?.targets.calories.toLocaleString()} kcal</span>
                </div>
              </div>
            )}
            <div className="pt-2 border-t border-surface-container text-[11px] text-on-surface-variant italic flex gap-2">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>Targets personalized from research: Physiopedia, Sage Journals</span>
            </div>
          </div>
        )}

        {/* BMI Input */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block">BMI (Optional)</label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              placeholder="e.g., 28.5"
              value={bmi}
              onChange={(e) => setBmi(e.target.value)}
              className="flex-1 bg-surface-container text-on-surface px-4 py-3 rounded-lg border border-surface-container-highest focus:outline-none focus:border-primary transition-colors"
            />
            <span className="bg-surface-container px-4 py-3 rounded-lg text-on-surface-variant text-sm font-medium">kg/m²</span>
          </div>
        </div>

        {/* Scoring System Info */}
        <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/20 space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-secondary" />
            <p className="text-xs font-bold text-on-surface">Smart Personalization</p>
          </div>
          <p className="text-[11px] text-on-surface-variant leading-relaxed">
            Your health score now adjusts weights based on your profile:
            <br/>• <strong>Diabetes:</strong> Diet (50%) → Sleep (25%) → Activity (25%)
            <br/>• <strong>Weight Loss:</strong> Activity (40%) → Diet (40%) → Sleep (20%)
            <br/>• <strong>General:</strong> Balanced (33% each)
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-lg text-on-surface font-bold bg-surface-container border border-surface-container-highest hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 rounded-lg text-on-primary font-bold bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save Profile'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
