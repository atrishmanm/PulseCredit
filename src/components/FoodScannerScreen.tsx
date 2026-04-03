import { useState, useRef } from 'react';
import { Camera, Upload, Check, X, Plus, Trash2 } from 'lucide-react';
import { recognizeFoodFromImage, FoodData } from '../lib/foodRecognition';
import { addFoodLog } from '../lib/dataService';
import { useAuth } from '../context/AuthContext';

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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Meal Type Selector */}
      <div className="grid grid-cols-4 gap-2">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedMealType(type)}
            className={`py-2 px-3 rounded-lg font-semibold transition-all capitalize ${
              selectedMealType === type
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Upload Options */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center justify-center gap-2 p-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-semibold"
        >
          <Upload size={20} />
          Upload Image
        </button>
        <button
          onClick={() => setUseCamera(!useCamera)}
          className="flex items-center justify-center gap-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
        >
          <Camera size={20} />
          {useCamera ? 'Close Camera' : 'Use Camera'}
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
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className="ml-4 text-gray-600">Analyzing food...</span>
        </div>
      )}

      {/* Recognized Foods */}
      {recognizedFoods.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Recognized Foods - Please Confirm:</h3>
          {recognizedFoods.map((food, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>{food.name}</strong></div>
                <div className="text-gray-600">{food.serving_size}</div>
                <div>🔥 {food.calories} cal</div>
                <div className="text-gray-600">Confidence: {food.confidence}%</div>
                <div className="text-xs text-gray-500">P: {food.protein}g C: {food.carbs}g F: {food.fat}g</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveFood(food, index)}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
                >
                  <Check size={16} />
                  Confirm & Add
                </button>
                <button
                  onClick={() => setRecognizedFoods(recognizedFoods.filter((_, i) => i !== index))}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
                >
                  <X size={16} />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Entry Form */}
      <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Plus size={20} />
          Manual Entry
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Food name"
            value={manualEntry.name || ''}
            onChange={(e) => setManualEntry({ ...manualEntry, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Calories"
            value={manualEntry.calories || ''}
            onChange={(e) => setManualEntry({ ...manualEntry, calories: parseInt(e.target.value) || 0 })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Protein (g)"
            value={manualEntry.protein || ''}
            onChange={(e) => setManualEntry({ ...manualEntry, protein: parseInt(e.target.value) || 0 })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Carbs (g)"
            value={manualEntry.carbs || ''}
            onChange={(e) => setManualEntry({ ...manualEntry, carbs: parseInt(e.target.value) || 0 })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Fat (g)"
            value={manualEntry.fat || ''}
            onChange={(e) => setManualEntry({ ...manualEntry, fat: parseInt(e.target.value) || 0 })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder="Fiber (g)"
            value={manualEntry.fiber || ''}
            onChange={(e) => setManualEntry({ ...manualEntry, fiber: parseInt(e.target.value) || 0 })}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
        <button
          onClick={handleManualEntry}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg font-semibold"
        >
          Add Manual Entry
        </button>
      </div>
    </div>
  );
}
