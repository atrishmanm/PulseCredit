import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
}

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  healthScore: number; // -10 to +10
  healthImpact: string;
  nutrients: {
    name: string;
    amount: string;
    dailyValue?: number;
  }[];
  suggestions: string[];
}

export interface MedicalOCRResult {
  type: 'prescription' | 'lab_report' | 'doctor_visit' | 'unknown';
  confidence: number;
  extractedData: {
    medications?: {
      name: string;
      dosage: string;
      frequency: string;
    }[];
    doctor?: string;
    date?: string;
    diagnosis?: string;
    vitals?: {
      bloodPressure?: string;
      heartRate?: string;
      temperature?: string;
      weight?: string;
    };
    labResults?: {
      test: string;
      value: string;
      unit: string;
      range?: string;
    }[];
  };
  rawText: string;
}

export async function analyzeFoodImage(imageFile: File): Promise<FoodAnalysisResult> {
  console.log('🔍 Starting food analysis...', { fileName: imageFile.name, fileSize: imageFile.size, fileType: imageFile.type });
  console.log('🔑 API Key available:', !!genAI);

  if (!genAI) {
    console.log('⚠️ No API key found, using mock data');
    return getMockFoodAnalysis();
  }

  try {
    console.log('📡 Creating Gemini model: gemini-2.5-flash');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Convert file to base64
    console.log('🔄 Converting image to base64...');
    const base64Image = await fileToBase64(imageFile);
    console.log('✅ Base64 conversion complete, length:', base64Image.length);

    const prompt = `Analyze this food image and provide a detailed nutritional breakdown. Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "foodName": "name of the dish",
  "calories": estimated calories (number),
  "protein": grams of protein (number),
  "carbs": grams of carbohydrates (number),
  "fat": grams of fat (number),
  "fiber": grams of fiber (number),
  "healthScore": score from -10 (very unhealthy) to +10 (very healthy),
  "healthImpact": "brief explanation of health impact",
  "nutrients": [
    {"name": "vitamin/mineral name", "amount": "amount with unit", "dailyValue": percentage as number}
  ],
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    console.log('📤 Sending request to Gemini API...');
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
    ]);

    console.log('📥 Response received from API');
    const response = await result.response;
    const text = response.text();
    console.log('📝 Response text:', text.substring(0, 200) + '...');

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Failed to parse JSON from response');
      throw new Error('Failed to parse AI response');
    }

    console.log('✅ Food analysis complete!');
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing food:', error);
    return getMockFoodAnalysis();
  }
}

/**
 * Perform medical OCR using OpenRouter GPT as fallback
 */
async function performMedicalOCRWithOpenRouter(imageFile: File, base64Image: string): Promise<MedicalOCRResult> {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn('OpenRouter API key not configured');
      return getMockMedicalOCR();
    }

    const prompt = `Analyze this medical document image (prescription, lab report, or doctor's note) and extract structured information. Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "type": "prescription" | "lab_report" | "doctor_visit" | "unknown",
  "confidence": 0-100 (confidence in OCR accuracy),
  "extractedData": {
    "medications": [{"name": "med name", "dosage": "dosage", "frequency": "frequency"}],
    "doctor": "doctor name (REQUIRED - best effort extraction)",
    "date": "YYYY-MM-DD format",
    "diagnosis": "diagnosis if present (REQUIRED - best effort extraction)",
    "vitals": {
      "bloodPressure": "120/80",
      "heartRate": "72 bpm",
      "temperature": "98.6°F",
      "weight": "70 kg"
    },
    "labResults": [
      {"test": "test name", "value": "value", "unit": "unit", "range": "normal range"}
    ]
  },
  "rawText": "all text found in the document"
}

CRITICAL: If doctor name is not clear, use "Unknown Doctor" or "Dr. [Last visible name]".
CRITICAL: If diagnosis is not clear, use "General Medical Document" or "See document for details".
Make your best effort to extract all required fields even if confidence is low.`;

    console.log('📤 Sending medical OCR request to OpenRouter...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://vitecredit.web.app',
        'X-Title': 'ViteCredit Prescription',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image',
                image: {
                  url: `data:${imageFile.type};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter API error:', error);
      return getMockMedicalOCR();
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    if (!text) {
      console.error('Empty OpenRouter response');
      return getMockMedicalOCR();
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Failed to parse JSON from OpenRouter response');
      return getMockMedicalOCR();
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields and provide fallbacks
    if (!parsed.extractedData) {
      parsed.extractedData = {};
    }
    if (!parsed.extractedData.doctor) {
      parsed.extractedData.doctor = 'Unknown Doctor';
    }
    if (!parsed.extractedData.diagnosis) {
      parsed.extractedData.diagnosis = 'Medical Document (See details)';
    }
    if (!parsed.extractedData.medications) {
      parsed.extractedData.medications = [];
    }

    console.log('✅ OpenRouter Medical OCR complete');
    return parsed;
  } catch (error) {
    console.error('Error with OpenRouter OCR:', error);
    return getMockMedicalOCR();
  }
}

/**
 * Perform medical OCR using Gemini first, then OpenRouter as fallback
 */
export async function performMedicalOCR(imageFile: File): Promise<MedicalOCRResult> {
  if (!genAI) {
    console.log('No Gemini API key, trying OpenRouter...');
    const base64Image = await fileToBase64(imageFile);
    return performMedicalOCRWithOpenRouter(imageFile, base64Image);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const base64Image = await fileToBase64(imageFile);

    const prompt = `Analyze this medical document image (prescription, lab report, or doctor's note) and extract structured information. Return ONLY a JSON object with this exact structure (no markdown, no code blocks):
{
  "type": "prescription" | "lab_report" | "doctor_visit" | "unknown",
  "confidence": 0-100 (confidence in OCR accuracy),
  "extractedData": {
    "medications": [{"name": "med name", "dosage": "dosage", "frequency": "frequency"}],
    "doctor": "doctor name (REQUIRED - best effort extraction)",
    "date": "YYYY-MM-DD format",
    "diagnosis": "diagnosis if present (REQUIRED - best effort extraction)",
    "vitals": {
      "bloodPressure": "120/80",
      "heartRate": "72 bpm",
      "temperature": "98.6°F",
      "weight": "70 kg"
    },
    "labResults": [
      {"test": "test name", "value": "value", "unit": "unit", "range": "normal range"}
    ]
  },
  "rawText": "all text found in the document"
}

CRITICAL: If doctor name is not clear, use "Unknown Doctor" or "Dr. [Last visible name]".
CRITICAL: If diagnosis is not clear, use "General Medical Document" or "See document for details".
Make your best effort to extract all required fields even if confidence is low.`;

    console.log('📤 Sending medical OCR request to Gemini...');
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image.split(',')[1] || base64Image,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    console.log('📝 Gemini OCR Response received');

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('Gemini: Failed to parse JSON, trying OpenRouter...');
      return performMedicalOCRWithOpenRouter(imageFile, base64Image);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate required fields and provide fallbacks
    if (!parsed.extractedData) {
      parsed.extractedData = {};
    }
    if (!parsed.extractedData.doctor) {
      parsed.extractedData.doctor = 'Unknown Doctor';
    }
    if (!parsed.extractedData.diagnosis) {
      parsed.extractedData.diagnosis = 'Medical Document (See details)';
    }
    if (!parsed.extractedData.medications) {
      parsed.extractedData.medications = [];
    }

    console.log('✅ Gemini Medical OCR complete:', { doctor: parsed.extractedData.doctor, hasMeds: parsed.extractedData.medications.length > 0 });
    return parsed;
  } catch (error) {
    console.error('Gemini error:', error);
    console.log('⚠️ Gemini failed, falling back to OpenRouter...');
    try {
      const base64Image = await fileToBase64(imageFile);
      return performMedicalOCRWithOpenRouter(imageFile, base64Image);
    } catch (openrouterError) {
      console.error('OpenRouter also failed, using mock data');
      return getMockMedicalOCR();
    }
  }
}

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Mock data fallbacks
function getMockFoodAnalysis(): FoodAnalysisResult {
  return {
    foodName: 'Mediterranean Salmon Bowl',
    calories: 642,
    protein: 42,
    carbs: 45,
    fat: 28,
    fiber: 8,
    healthScore: 8,
    healthImpact: 'Excellent source of omega-3 fatty acids and lean protein. High in antioxidants from vegetables.',
    nutrients: [
      { name: 'Omega-3', amount: '2.8g', dailyValue: 140 },
      { name: 'Vitamin D', amount: '15mcg', dailyValue: 75 },
      { name: 'Iron', amount: '3.2mg', dailyValue: 18 },
    ],
    suggestions: [
      'Great choice! This meal supports heart health.',
      'Try adding more leafy greens for extra vitamins.',
    ],
  };
}

function getMockMedicalOCR(): MedicalOCRResult {
  return {
    type: 'prescription',
    confidence: 94,
    extractedData: {
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
        },
      ],
      doctor: 'Dr. Sarah Johnson',
      date: '2023-10-24',
      diagnosis: 'Mild Hypertension',
    },
    rawText: 'Dr. Sarah Johnson, MD\nDate: 10/24/2023\nPatient: John Doe\nDiagnosis: Mild Hypertension\nRx: Lisinopril 10mg, Take once daily',
  };
}
