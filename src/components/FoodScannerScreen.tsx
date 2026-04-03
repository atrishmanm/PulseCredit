import { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Plus, Trash2, Leaf, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { recognizeFoodFromImage, FoodData } from '../lib/foodRecognition';
import { addFoodLog } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface FoodScannerScreenProps {
  onSave?: () => void;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export function FoodScannerScreen({ onSave, mealType = 'lunch' }: FoodScannerScreenProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [recognizedFoods, setRecognizedFoods] = useState<FoodData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [manualEntry, setManualEntry] = useState<Partial<FoodData>>({});
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>(mealType);

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        try {
          const foods = await recognizeFoodFromImage(base64);
          setRecognizedFoods(foods);
        } catch (err) {
          setError('Failed to recognize food. Please try another image.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError('Error processing image');
      console.error(err);
      setLoading(false);
    }
  }

  async function handleSaveFood(food: FoodData, index: number) {
    if (!user) {
      setError('Please log in to save food');
      return;
    }

    try {
      await addFoodLog(user.uid, {
        userId: user.uid,
        foodName: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        servingSize: food.serving_size,
        manualEntry: false,
        confirmedByUser: true,
        mealType: selectedMealType,
        timestamp: Date.now(),
      });

      setRecognizedFoods(recognizedFoods.filter((_, i) => i !== index));
      setError('');
    } catch (err) {
      setError('Failed to save food log');
      console.error(err);
    }
  }

  async function handleManualEntry() {
    if (!user || !manualEntry.name) {
      setError('Please fill in food name');
      return;
    }

    try {
      await addFoodLog(user.uid, {
        userId: user.uid,
        foodName: manualEntry.name || '',
        calories: manualEntry.calories || 0,
        protein: manualEntry.protein || 0,
        carbs: manualEntry.carbs || 0,
        fat: manualEntry.fat || 0,
        fiber: manualEntry.fiber || 0,
        servingSize: manualEntry.serving_size || '1 serving',
        manualEntry: true,
        confirmedByUser: true,
        mealType: selectedMealType,
        timestamp: Date.now(),
      });

      setManualEntry({});
      setError('');
      onSave?.();
    } catch (err) {
      setError('Failed to save food log');
      console.error(err);
    }
  }

  const mealEmojis = {
    breakfast: '🌅',
    lunch: '🍽️',
    dinner: '🌙',
    snack: '🍿',
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Header */}
      <header className="space-y-4">
        <div className="space-y-2">
          <p className="font-headline uppercase text-xs font-bold tracking-widest text-primary">Nutrition Tracker</p>
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter">Food Scanner</h1>
        </div>
        <p className="text-on-surface-variant max-w-2xl">Scan your meal, log your food, and track your nutrition effortlessly</p>
      </header>

      {/* Meal Type Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-2">Select Meal Type</label>
        <div className="grid grid-cols-4 gap-3">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedMealType(type)}
              className={cn(
                "py-3 px-2 rounded-lg font-semibold transition-all capitalize text-xs border",
                selectedMealType === type
                  ? "bg-primary text-on-primary border-primary shadow-lg"
                  : "bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:border-primary/50"
              )}
            >
              {mealEmojis[type as keyof typeof mealEmojis]} {type}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-tertiary/10 border border-tertiary rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-tertiary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-tertiary">{error}</p>
        </div>
      )}

      {/* Upload Options */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex flex-col items-center gap-3 p-6 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-on-primary rounded-2xl font-semibold transition-all border border-primary/20 hover:border-primary/50"
        >
          <Upload className="w-6 h-6" />
          <span className="text-xs md:text-sm">Upload Image</span>
        </button>
        <button
          onClick={() => setUseCamera(!useCamera)}
          className="flex flex-col items-center gap-3 p-6 bg-secondary hover:bg-secondary/90 text-on-secondary rounded-2xl font-semibold transition-all border border-secondary/20 hover:border-secondary/50"
        >
          <Camera className="w-6 h-6" />
          <span className="text-xs md:text-sm">{useCamera ? 'Close' : 'Take Photo'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          className="hidden"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-surface-container-high rounded-2xl border border-white/5">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
          <p className="text-sm text-on-surface-variant font-medium">Analyzing your meal...</p>
        </div>
      )}

      {/* Recognized Foods */}
      {recognizedFoods.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Zap className="w-5 h-5 text-secondary" />
            <h2 className="text-xl font-bold font-headline">Recognized Foods</h2>
            <span className="ml-auto text-xs font-bold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">{recognizedFoods.length} items</span>
          </div>
          <div className="space-y-3">
            {recognizedFoods.map((food, index) => (
              <div key={index} className="bg-surface-container-low rounded-xl p-5 border border-white/5 hover:border-primary/20 transition-colors space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-on-surface">{food.name}</h3>
                    <p className="text-xs text-on-surface-variant mt-1">{food.serving_size}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-lg">{food.confidence}%</p>
                    <p className="text-[10px] text-on-surface-variant uppercase">Confidence</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-surface-container rounded-lg p-3">
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Calories</p>
                    <p className="text-lg font-bold text-on-surface">{food.calories}</p>
                  </div>
                  <div className="bg-surface-container rounded-lg p-3">
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Protein</p>
                    <p className="text-lg font-bold text-on-surface">{food.protein}g</p>
                  </div>
                  <div className="bg-surface-container rounded-lg p-3">
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Carbs</p>
                    <p className="text-lg font-bold text-on-surface">{food.carbs}g</p>
                  </div>
                  <div className="bg-surface-container rounded-lg p-3">
                    <p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">Fat</p>
                    <p className="text-lg font-bold text-on-surface">{food.fat}g</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveFood(food, index)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container hover:shadow-lg text-on-primary py-3 rounded-lg font-bold transition-all"
                  >
                    <Check className="w-4 h-4" />
                    Add to Log
                  </button>
                  <button
                    onClick={() => setRecognizedFoods(recognizedFoods.filter((_, i) => i !== index))}
                    className="px-4 py-3 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg font-bold transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Entry Form */}
      <div className="bg-surface-container-low rounded-2xl p-8 border border-white/5 space-y-6">
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-bold font-headline">Manual Entry</h2>
          <p className="text-xs text-on-surface-variant ml-auto">Can't find your food? Add it manually</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-on-surface">Food Name</label>
            <input
              type="text"
              placeholder="e.g., Grilled Chicken Breast"
              value={manualEntry.name || ''}
              onChange={(e) => {
                setManualEntry({ ...manualEntry, name: e.target.value });
                setError('');
              }}
              className="w-full bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface">Calories</label>
              <input
                type="number"
                placeholder="0"
                value={manualEntry.calories || ''}
                onChange={(e) => setManualEntry({ ...manualEntry, calories: parseInt(e.target.value) || 0 })}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface">Protein (g)</label>
              <input
                type="number"
                placeholder="0"
                value={manualEntry.protein || ''}
                onChange={(e) => setManualEntry({ ...manualEntry, protein: parseInt(e.target.value) || 0 })}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface">Carbs (g)</label>
              <input
                type="number"
                placeholder="0"
                value={manualEntry.carbs || ''}
                onChange={(e) => setManualEntry({ ...manualEntry, carbs: parseInt(e.target.value) || 0 })}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface">Fat (g)</label>
              <input
                type="number"
                placeholder="0"
                value={manualEntry.fat || ''}
                onChange={(e) => setManualEntry({ ...manualEntry, fat: parseInt(e.target.value) || 0 })}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface">Fiber (g)</label>
              <input
                type="number"
                placeholder="0"
                value={manualEntry.fiber || ''}
                onChange={(e) => setManualEntry({ ...manualEntry, fiber: parseInt(e.target.value) || 0 })}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-on-surface">Serving Size</label>
              <input
                type="text"
                placeholder="e.g., 150g, 1 piece"
                value={manualEntry.serving_size || ''}
                onChange={(e) => setManualEntry({ ...manualEntry, serving_size: e.target.value })}
                className="w-full bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleManualEntry}
          className="w-full bg-gradient-to-r from-secondary to-secondary-container hover:shadow-lg text-on-secondary py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Manual Entry
        </button>
      </div>
    </div>
  );
}

