import { useState, useRef, useEffect } from 'react';
import { analyzeFoodImage, FoodAnalysisResult, analyzeManualFoodEntry } from '../lib/geminiAI';
import { GlassCard } from './GlassCard';
import { useAuth } from '../context/AuthContext';
import { addFoodLog, getFoodLogsForDate, FoodLog } from '../lib/dataService';
import { Scan, ArrowRight, Flame, Zap, AlertCircle, Upload, Loader2, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function ScannerScreen() {
  const [tabs, setTabs] = useState<'scan' | 'manual'>('scan');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FoodAnalysisResult | null>(null);
  const [recentLogs, setRecentLogs] = useState<(FoodLog & { imageUrl?: string })[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const [manualFood, setManualFood] = useState('');
  const [manualServingSize, setManualServingSize] = useState('');

  // Load today's food logs
  useEffect(() => {
    if (user) {
      loadTodaysFoods();
    }
  }, [user]);

  const loadTodaysFoods = async () => {
    if (!user) return;
    try {
      const foods = await getFoodLogsForDate(user.uid, new Date());
      setRecentLogs(foods);
    } catch (error) {
      console.error('Error loading food logs:', error);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeFoodImage(file);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing food:', error);
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAnalyze = async () => {
    if (!manualFood) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeManualFoodEntry(manualFood, manualServingSize);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Error analyzing manual entry:', error);
      alert('Failed to analyze. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveFood = async () => {
    if (!analysisResult || !user) return;

    setIsSaving(true);
    try {
      await addFoodLog(user.uid, {
        userId: user.uid,
        foodName: analysisResult.foodName,
        calories: analysisResult.calories,
        protein: analysisResult.protein,
        carbs: analysisResult.carbs || 0,
        fat: analysisResult.fat || 0,
        fiber: analysisResult.fiber,
        servingSize: analysisResult.servingSize || '1 serving',
        mealType: 'lunch',
        manualEntry: tabs === 'manual',
        confirmedByUser: true,
        timestamp: Date.now(),
      });

      // Reload foods
      await loadTodaysFoods();
      setAnalysisResult(null);
      setManualFood('');
      setManualServingSize('');
    } catch (error) {
      console.error('Error saving food:', error);
      alert('Failed to save food. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScanClick = () => {
    fileInputRef.current?.click();
  };

  const noAnalysisMessage = `Use the ${tabs === 'scan' ? 'scanner' : 'manual entry'} above to analyze a meal`;

  return (
    <div className="space-y-8 pb-32">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Header with Tabs */}
      <section className="space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-bold text-primary tracking-widest uppercase font-headline">Nutrition Tracking</p>
          <h1 className="text-4xl font-black font-headline tracking-tighter">Food Logger</h1>
          <p className="text-on-surface-variant">Scan meals or enter manually to track your nutrition</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-surface-container-high rounded-xl p-1 w-fit">
          <button
            onClick={() => setTabs('scan')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2",
              tabs === 'scan'
                ? "bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-lg"
                : "bg-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            <Scan className="w-4 h-4" />
            Scan Meal
          </button>
          <button
            onClick={() => setTabs('manual')}
            className={cn(
              "px-6 py-2 rounded-lg font-bold text-sm transition-all duration-300 flex items-center gap-2",
              tabs === 'manual'
                ? "bg-gradient-to-r from-secondary to-secondary-container text-on-secondary shadow-lg"
                : "bg-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            <Plus className="w-4 h-4" />
            Manual Entry
          </button>
        </div>
      </section>

      {/* Scanner Tab Content */}
      {tabs === 'scan' && (
        <section className="relative group">
          <div className="aspect-[4/3] md:aspect-[21/9] w-full rounded-xl overflow-hidden bg-surface-container relative border border-white/5">
            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
              <div className="text-center">
                <Scan className="w-20 h-20 text-primary/30 mx-auto mb-4" />
                <p className="text-on-surface-variant text-sm">Upload food image to analyze</p>
              </div>
            </div>

            {/* Scanner UI Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {isAnalyzing ? (
                <div className="bg-surface-container-highest/80 backdrop-blur-md px-8 py-4 rounded-full border border-white/10 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <span className="text-sm font-bold font-headline uppercase tracking-widest text-primary">Analyzing...</span>
                </div>
              ) : !analysisResult ? (
                <div className="text-center opacity-75">
                  <div className="w-48 h-48 md:w-64 md:h-64 border-2 border-secondary rounded-xl relative mx-auto">
                    <div className="absolute inset-0 border-4 border-secondary/20 animate-pulse rounded-lg"></div>
                  </div>
                  <div className="mt-8 text-xs font-bold text-secondary uppercase tracking-widest">Ready to scan</div>
                </div>
              ) : null}
            </div>

            {/* Scan Button */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
              <button
                onClick={handleScanClick}
                disabled={isAnalyzing || isSaving}
                className="flex items-center gap-3 bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                <span>{isAnalyzing ? 'ANALYZING...' : 'UPLOAD & SCAN MEAL'}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Manual Entry Tab Content */}
      {tabs === 'manual' && (
        <section className="space-y-6">
          <div className="bg-surface-container-low rounded-2xl p-8 border border-white/5 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold text-secondary tracking-widest uppercase font-headline">AI Powered Analysis</p>
              <h2 className="text-2xl font-bold font-headline">Enter Your Meal</h2>
              <p className="text-on-surface-variant text-sm">Describe what you ate and let AI analyze the nutrition</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-on-surface mb-2 block">What did you eat?</label>
                <input
                  type="text"
                  placeholder="e.g., Grilled chicken breast with rice and vegetables"
                  value={manualFood}
                  onChange={(e) => setManualFood(e.target.value)}
                  className="w-full bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-on-surface mb-2 block">Serving Size (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., 150g, 1 plate, X pieces"
                  value={manualServingSize}
                  onChange={(e) => setManualServingSize(e.target.value)}
                  className="w-full bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-secondary focus:outline-none transition-colors"
                />
              </div>

              <button
                onClick={handleManualAnalyze}
                disabled={!manualFood || isAnalyzing}
                className={cn(
                  "w-full py-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2",
                  !manualFood || isAnalyzing
                    ? "bg-secondary/50 text-on-secondary cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-secondary to-secondary-container text-on-secondary hover:shadow-lg"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze Nutrition
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Analysis Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: AI Breakdown */}
        <div className="lg:col-span-7 space-y-8">
          {analysisResult ? (
            <>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold text-primary tracking-widest uppercase font-headline">AI Analysis Complete</p>
                  <h1 className="text-4xl font-black font-headline tracking-tighter mt-1">{analysisResult.foodName}</h1>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-surface-container rounded-lg p-6 border-l-4 border-primary">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Calories</span>
                  <span className="text-2xl font-black font-headline">{analysisResult.calories}</span>
                  <span className="text-xs text-on-surface-variant block">kcal</span>
                </div>
                <div className="bg-surface-container rounded-lg p-6 border-l-4 border-secondary">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Protein</span>
                  <span className="text-2xl font-black font-headline">{analysisResult.protein}g</span>
                  <span className="text-xs text-on-surface-variant block">Per serving</span>
                </div>
                <div className="bg-surface-container rounded-lg p-6 border-l-4 border-tertiary">
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest block mb-1">Fiber</span>
                  <span className="text-2xl font-black font-headline">{analysisResult.fiber}g</span>
                  <span className="text-xs text-on-surface-variant block">Dietary</span>
                </div>
              </div>

              {/* Health Impact */}
              <GlassCard className="p-8 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-secondary/10 blur-3xl"></div>
                <div className="flex items-start gap-6 relative z-10">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold font-headline leading-tight mb-4">
                      {analysisResult.healthImpact}
                    </h3>
                    {analysisResult.suggestions.length > 0 && (
                      <div className="space-y-2">
                        {analysisResult.suggestions.map((suggestion, i) => (
                          <p key={i} className="text-xs text-primary flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 flex-shrink-0" />
                            {suggestion}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* Save Button */}
              <button
                onClick={handleSaveFood}
                disabled={isSaving}
                className={cn(
                  "w-full py-4 rounded-lg font-bold text-center transition-all",
                  isSaving
                    ? "bg-primary/50 text-on-primary cursor-not-allowed"
                    : "bg-secondary text-on-secondary hover:bg-secondary/90"
                )}
              >
                {isSaving ? 'Saving...' : "✓ Save to Today's Log"}
              </button>
            </>
          ) : (
            <GlassCard className="p-12 text-center">
              <Scan className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold font-headline mb-2">No analysis yet</h3>
              <p className="text-on-surface-variant text-sm">{noAnalysisMessage}</p>
            </GlassCard>
          )}
        </div>

        {/* Right Column: Today's log - ALWAYS VISIBLE */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black font-headline tracking-tight">Today's Meals</h2>
            <span className="text-xs font-bold text-primary uppercase tracking-widest">{recentLogs.length} items</span>
          </div>

          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-surface-container-low rounded-lg p-4 flex items-center gap-4 hover:bg-surface-container transition-colors"
                >
                  <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-sm">{log.foodName}</h4>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-lg font-black font-headline text-secondary">
                      {log.calories}
                    </span>
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase">Cal</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <GlassCard className="p-6 text-center">
              <Scan className="w-12 h-12 text-primary/30 mx-auto mb-3" />
              <p className="text-sm text-on-surface-variant">No meals logged yet</p>
              <p className="text-xs text-on-surface-variant mt-1">Scan your first meal to get started</p>
            </GlassCard>
          )}

          {/* Daily Total */}
          <div className="bg-surface-container rounded-lg p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Daily Total</span>
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-black text-3xl font-headline">
              {recentLogs.reduce((sum, log) => sum + log.calories, 0)}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">calories logged</p>
          </div>
        </div>
      </div>
    </div>
  );
}
