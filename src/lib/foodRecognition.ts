import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

export interface FoodData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  serving_size: string;
  confidence: number;
}

export async function recognizeFoodFromImage(imageBase64: string): Promise<FoodData[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `Analyze this food image and identify ALL visible food items.
    For each food item found, provide:
    1. Food name
    2. Estimated quantity/serving size
    3. Estimated calories
    4. Protein (grams)
    5. Carbs (grams)
    6. Fat (grams)
    7. Fiber (grams)
    8. Your confidence level (0-100)

    Format response as JSON array:
    [
      {
        "name": "food name",
        "serving_size": "1 cup or approximate amount",
        "calories": 100,
        "protein": 5,
        "carbs": 20,
        "fat": 3,
        "fiber": 2,
        "confidence": 85
      }
    ]

    Only return valid JSON, no markdown formatting.`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg',
        },
      },
      prompt,
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\[[\s\S]*\]/);

    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Food recognition error:', error);
    throw new Error('Failed to recognize food from image');
  }
}

export function calculateTotalNutrition(foods: FoodData[]) {
  return {
    totalCalories: foods.reduce((sum, food) => sum + food.calories, 0),
    totalProtein: foods.reduce((sum, food) => sum + food.protein, 0),
    totalCarbs: foods.reduce((sum, food) => sum + food.carbs, 0),
    totalFat: foods.reduce((sum, food) => sum + food.fat, 0),
    totalFiber: foods.reduce((sum, food) => sum + food.fiber, 0),
    itemCount: foods.length,
  };
}
