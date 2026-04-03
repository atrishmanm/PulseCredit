import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeHealthConditionWithAI, PersonalizedHealthPlan } from '../lib/aiHealthAnalysis';
import { Heart, AlertCircle, Loader, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export function DiseaseSelector() {
  const { userData, setUserDisease } = useAuth();
  const [diseaseInput, setDiseaseInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [plan, setPlan] = useState<PersonalizedHealthPlan | null>(null);
  const [error, setError] = useState('');
  const [skipSetup, setSkipSetup] = useState(false);

  // If user already has disease set or skipped setup, don't show this
  if (userData?.disease || skipSetup) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDiseaseInput(value);
    setError('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!diseaseInput.trim()) {
      setError('Please enter your health condition');
      return;
    }

    setAnalyzing(true);
    setError('');

    try {
      // Call Gemini AI to analyze health condition
      const result = await analyzeHealthConditionWithAI(diseaseInput);
      setPlan(result);

      if (result.errorMessage) {
        setError(result.errorMessage);
      }
    } catch (err) {
      setError('Could not analyze health condition. Please check your input and try again.');
      console.error('Error analyzing health condition:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (!plan) return;

    setLoading(true);
    try {
      await setUserDisease(plan.disease);
    } catch (error) {
      console.error('Error setting disease:', error);
      setError('Error saving disease profile');
    } finally {
      setLoading(false);
    }
  };

  // Show confirmation screen after AI analysis
  if (plan) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-surface-container rounded-2xl max-w-2xl w-full p-8 space-y-6 border border-white/10 max-h-[90vh] overflow-y-auto relative">
          {/* Close Button */}
          <button
            onClick={() => {
              setPlan(null);
              setDiseaseInput('');
              setError('');
            }}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-on-surface-variant hover:text-on-surface"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <Heart className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface">
              Your Personalized Health Plan
            </h1>
            <p className="text-on-surface-variant text-sm">
              Based on your health profile
            </p>
          </div>

          {/* AI Analysis Results */}
          <div className="space-y-6">
            {/* Health Profile */}
            <div className="bg-surface-container-high rounded-xl p-4 border border-white/10">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Your Health Profile
              </p>
              <p className="text-on-surface font-semibold">{plan.healthProfile}</p>
              <p className="text-xs text-on-surface-variant mt-2">
                AI Confidence: <strong>{plan.confidence}%</strong>
              </p>
            </div>

            {/* Risk Factors */}
            {plan.riskFactors.length > 0 && (
              <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-2">
                  ⚠️ Risk Factors
                </p>
                <ul className="space-y-1">
                  {plan.riskFactors.map((factor, i) => (
                    <li key={i} className="text-sm text-on-surface-variant">
                      • {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personalized Targets */}
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                🎯 Your Personalized Targets
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container rounded-lg p-3">
                  <p className="text-xs text-on-surface-variant">Daily Steps</p>
                  <p className="text-xl font-bold text-on-surface">
                    {plan.personalizedTargets.dailySteps.toLocaleString()}
                  </p>
                </div>
                <div className="bg-surface-container rounded-lg p-3">
                  <p className="text-xs text-on-surface-variant">Sleep Target</p>
                  <p className="text-xl font-bold text-on-surface">
                    {plan.personalizedTargets.sleepHours}h
                  </p>
                </div>
                <div className="bg-surface-container rounded-lg p-3">
                  <p className="text-xs text-on-surface-variant">Calories</p>
                  <p className="text-xl font-bold text-on-surface">
                    {plan.personalizedTargets.calorieTarget.toLocaleString()}
                  </p>
                </div>
                <div className="bg-surface-container rounded-lg p-3">
                  <p className="text-xs text-on-surface-variant">Exercise</p>
                  <p className="text-xl font-bold text-on-surface">
                    {plan.personalizedTargets.exerciseMinutes}m
                  </p>
                </div>
              </div>
            </div>

            {/* Focus Areas (Weights) */}
            <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20">
              <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
                ⚖️ Your Focus Areas
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Activity</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${plan.personalizedWeights.activity * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-on-surface w-8 text-right">
                      {Math.round(plan.personalizedWeights.activity * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Sleep</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-secondary rounded-full"
                        style={{ width: `${plan.personalizedWeights.sleep * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-on-surface w-8 text-right">
                      {Math.round(plan.personalizedWeights.sleep * 100)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Nutrition</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className="h-full bg-tertiary rounded-full"
                        style={{ width: `${plan.personalizedWeights.nutrition * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-on-surface w-8 text-right">
                      {Math.round(plan.personalizedWeights.nutrition * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-tertiary/10 rounded-xl p-4 border border-tertiary/20">
              <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-3">
                💡 AI Recommendations
              </p>
              <ul className="space-y-2">
                {plan.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-on-surface-variant flex gap-2">
                    <span className="text-tertiary">→</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Health Tips */}
            <div className="bg-surface-container-high rounded-xl p-4 border border-white/5">
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3">
                🌟 Daily Tips
              </p>
              <ul className="space-y-2">
                {plan.personalizedTips.map((tip, i) => (
                  <li key={i} className="text-sm text-on-surface-variant flex gap-2">
                    <span>✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Error Message if exists */}
            {plan.errorMessage && (
              <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                <p className="text-xs text-yellow-600">{plan.errorMessage}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              onClick={() => setPlan(null)}
              disabled={loading}
              className="flex-1 px-6 py-3 rounded-lg text-on-surface font-bold bg-surface-container border border-surface-container-highest hover:bg-surface-container-high transition-colors disabled:opacity-50"
            >
              Edit Input
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                'flex-1 px-6 py-3 rounded-lg text-on-primary font-bold transition-all flex items-center justify-center gap-2',
                loading
                  ? 'bg-primary/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary to-primary-container hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
              )}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                  Personalizing...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  Confirm & Continue
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show input form
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-container rounded-2xl max-w-xl w-full p-8 space-y-8 border border-white/10 max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={() => setSkipSetup(true)}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors text-on-surface-variant hover:text-on-surface"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <Heart className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="font-headline text-3xl font-extrabold text-on-surface">
            AI-Powered Health Profile
          </h1>
          <p className="text-on-surface-variant max-w-sm mx-auto text-sm">
            Describe your health condition in your own words - our AI will create a personalized plan
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Disease Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-on-surface">
              Your Health Condition
            </label>
            <textarea
              autoFocus
              placeholder="e.g., I have type 2 diabetes and trying to manage my blood sugar levels by walking more consistently..."
              value={diseaseInput}
              onChange={handleInputChange}
              disabled={analyzing}
              rows={4}
              className="w-full bg-surface-container-high text-on-surface px-4 py-3 rounded-lg border border-white/10 focus:border-primary focus:outline-none transition-colors placeholder:text-on-surface-variant/50 disabled:opacity-50 resize-none"
            />
            <p className="text-xs text-on-surface-variant">
              Be specific: mention your condition, goals, age, lifestyle factors - anything relevant
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/20">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={analyzing || !diseaseInput.trim()}
            className={cn(
              'w-full px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2',
              analyzing || !diseaseInput.trim()
                ? 'bg-primary/50 text-on-primary/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-primary-container text-on-primary hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]'
            )}
          >
            {analyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                AI is analyzing...
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                Analyze & Create Plan
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="space-y-3 border-t border-white/5 pt-6">
          <p className="text-xs text-on-surface-variant flex gap-2">
            <span>🤖</span>
            <span>
              <strong>AI-Powered:</strong> Uses Gemini 2.0 Flash to analyze your unique situation
            </span>
          </p>
          <p className="text-xs text-on-surface-variant flex gap-2">
            <span>🧬</span>
            <span>
              <strong>Personalized:</strong> Creates custom targets based on your specific condition
            </span>
          </p>
          <p className="text-xs text-on-surface-variant flex gap-2">
            <span>🔄</span>
            <span>
              <strong>Always Editable:</strong> Change your profile anytime in Settings
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

