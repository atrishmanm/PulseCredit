// AI-powered health analysis using Gemini API for true personalization
// Generates unique plans for ANY health condition, not just predefined categories

export interface PersonalizedHealthPlan {
  disease: string;
  confidence: number; // 0-100
  personalizedTargets: {
    dailySteps: number;
    sleepHours: number;
    calorieTarget: number;
    exerciseMinutes: number;
  };
  personalizedWeights: {
    activity: number;
    sleep: number;
    nutrition: number;
  };
  personalizedTips: string[];
  healthProfile: string;
  riskFactors: string[];
  recommendations: string[];
  errorMessage?: string;
}

/**
 * Fallback plan for when API fails or returns invalid data
 */
function createFallbackPlan(userInput: string, disease: string): PersonalizedHealthPlan {
  return {
    disease,
    confidence: 50,
    personalizedTargets: {
      dailySteps: 9000,
      sleepHours: 7.5,
      calorieTarget: 2000,
      exerciseMinutes: 30,
    },
    personalizedWeights: {
      activity: 0.33,
      sleep: 0.33,
      nutrition: 0.34,
    },
    personalizedTips: [
      'Start tracking your daily health metrics',
      'Maintain consistent movement and activity',
      'Get 7-8 hours of quality sleep',
      'Focus on balanced nutrition',
    ],
    healthProfile: `Profile: Someone managing ${disease}. Continue logging health data for personalized recommendations.`,
    riskFactors: ['Insufficient data for detailed risk assessment'],
    recommendations: [
      'Begin logging daily health metrics to get personalized recommendations',
      'Consult with your healthcare provider about your condition',
      'Set realistic goals and track progress',
    ],
  };
}

/**
 * Parse Gemini response and extract structured plan data
 */
function parseGeminiResponse(content: string): Partial<PersonalizedHealthPlan> {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        personalizedTargets: {
          dailySteps: parsed.dailySteps || 9000,
          sleepHours: parsed.sleepHours || 7.5,
          calorieTarget: parsed.calorieTarget || 2000,
          exerciseMinutes: parsed.exerciseMinutes || 30,
        },
        personalizedWeights: {
          activity: parsed.activity || 0.33,
          sleep: parsed.sleep || 0.33,
          nutrition: parsed.nutrition || 0.34,
        },
        personalizedTips: Array.isArray(parsed.tips) ? parsed.tips : [],
        riskFactors: Array.isArray(parsed.risks) ? parsed.risks : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        healthProfile: parsed.healthProfile || '',
      };
    }
  } catch (e) {
    console.error('Failed to parse Gemini JSON response:', e);
  }

  // Fallback: extract data from text response
  return {};
}

/**
 * Call OpenRouter API (GPT-OSS-120B) as alternative to Gemini
 */
async function callOpenRouterAPI(userInput: string): Promise<Partial<PersonalizedHealthPlan>> {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    if (!apiKey) {
      console.warn('OpenRouter API key not configured');
      return {};
    }

    const prompt = `Analyze this health condition and create a personalized health plan. Return ONLY valid JSON with no markdown formatting.

User's Health Condition: "${userInput}"

Generate a JSON object with EXACTLY this structure (no markdown, no code blocks, pure JSON):
{
  "dailySteps": <number between 5000-15000>,
  "sleepHours": <number between 6-9>,
  "calorieTarget": <number between 1500-3000>,
  "exerciseMinutes": <number between 20-90>,
  "activity": <number between 0.2-0.5>,
  "sleep": <number between 0.2-0.5>,
  "nutrition": <number between 0.2-0.5>,
  "tips": [<3-4 specific actionable tips for this condition>],
  "risks": [<2-3 main risk factors for this condition>],
  "recommendations": [<3-4 personalized recommendations>],
  "healthProfile": "<1-2 sentence profile describing their condition and approach>"
}

Rules for values:
- dailySteps: varies by condition (diabetes: 7000, obesity: 11000, general: 9000)
- sleepHours: varies by condition (sleep disorder: 8, normal: 7-7.5)
- calorieTarget: varies by condition (weight loss: 1800, normal: 2000-2200)
- exerciseMinutes: varies by condition (cardiac: 30, obesity: 60)
- Weights (activity, sleep, nutrition): must sum to ~1.0, vary by condition
  - Diabetes: nutrition heavy (0.5), activity (0.25), sleep (0.25)
  - Obesity: activity heavy (0.4), nutrition (0.4), sleep (0.2)
  - Cardiac: sleep heavy (0.35), activity (0.35), nutrition (0.3)
  - General: balanced (0.33, 0.33, 0.34)
- tips: specific to the condition, actionable
- risks: specific to the condition, medical accuracy
- recommendations: specific to the condition`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://vitecredit.web.app',
        'X-Title': 'ViteCredit Health',
      },
      body: JSON.stringify({
        model: 'gpt-oss-120b',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenRouter API error:', error);
      return {};
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    if (!content) {
      console.error('Empty OpenRouter response');
      return {};
    }

    // Parse the response using same logic as Gemini
    const parsed = parseGeminiResponse(content);
    return parsed;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    return {};
  }
}

/**
 * Call Gemini API to analyze health condition and generate personalized plan
 */
async function callGeminiAPI(userInput: string): Promise<Partial<PersonalizedHealthPlan>> {
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn('Gemini API key not configured, using fallback');
      return {};
    }

    const prompt = `Analyze this health condition and create a personalized health plan. Return ONLY valid JSON with no markdown formatting.

User's Health Condition: "${userInput}"

Generate a JSON object with EXACTLY this structure (no markdown, no code blocks, pure JSON):
{
  "dailySteps": <number between 5000-15000>,
  "sleepHours": <number between 6-9>,
  "calorieTarget": <number between 1500-3000>,
  "exerciseMinutes": <number between 20-90>,
  "activity": <number between 0.2-0.5>,
  "sleep": <number between 0.2-0.5>,
  "nutrition": <number between 0.2-0.5>,
  "tips": [<3-4 specific actionable tips for this condition>],
  "risks": [<2-3 main risk factors for this condition>],
  "recommendations": [<3-4 personalized recommendations>],
  "healthProfile": "<1-2 sentence profile describing their condition and approach>"
}

Rules for values:
- dailySteps: varies by condition (diabetes: 7000, obesity: 11000, general: 9000)
- sleepHours: varies by condition (sleep disorder: 8, normal: 7-7.5)
- calorieTarget: varies by condition (weight loss: 1800, normal: 2000-2200)
- exerciseMinutes: varies by condition (cardiac: 30, obesity: 60)
- Weights (activity, sleep, nutrition): must sum to ~1.0, vary by condition
  - Diabetes: nutrition heavy (0.5), activity (0.25), sleep (0.25)
  - Obesity: activity heavy (0.4), nutrition (0.4), sleep (0.2)
  - Cardiac: sleep heavy (0.35), activity (0.35), nutrition (0.3)
  - General: balanced (0.33, 0.33, 0.34)
- tips: specific to the condition, actionable
- risks: specific to the condition, medical accuracy
- recommendations: specific to the condition`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      return {};
    }

    const data = await response.json();
    const content = data.contents?.[0]?.parts?.[0]?.text || '';

    if (!content) {
      console.error('Empty Gemini response');
      return {};
    }

    // Parse the response
    const parsed = parseGeminiResponse(content);
    return parsed;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {};
  }
}

/**
 * Analyze health condition using AI for true personalization
 * Works with ANY health condition input, not limited to predefined categories
 * Falls back from Gemini → OpenRouter → local defaults
 */
export async function analyzeHealthConditionWithAI(userInput: string): Promise<PersonalizedHealthPlan> {
  try {
    // Extract disease name from user input (first few words or main topic)
    const disease = userInput.split(/[,.\s]/)[0] || 'health condition';

    // Try Gemini API first
    console.log('Trying Gemini 2.0 Flash API...');
    let aiPlan = await callGeminiAPI(userInput);

    // If Gemini failed, try OpenRouter as fallback
    if (!aiPlan.personalizedTargets) {
      console.log('Gemini failed, trying OpenRouter GPT-OSS-120B...');
      aiPlan = await callOpenRouterAPI(userInput);
    }

    // If AI returned valid data, use it
    if (
      aiPlan.personalizedTargets &&
      aiPlan.personalizedWeights &&
      aiPlan.personalizedTips?.length > 0
    ) {
      const source = aiPlan.personalizedTargets ? 'AI' : 'fallback';
      console.log(`Health analysis successful via ${source}`);
      return {
        disease: disease.charAt(0).toUpperCase() + disease.slice(1),
        confidence: 85, // High confidence for AI-generated
        personalizedTargets: aiPlan.personalizedTargets,
        personalizedWeights: aiPlan.personalizedWeights,
        personalizedTips: aiPlan.personalizedTips,
        healthProfile: aiPlan.healthProfile || `Personalized plan for managing ${disease}`,
        riskFactors: aiPlan.riskFactors || [],
        recommendations: aiPlan.recommendations || [],
      };
    }

    // If all AI failed, use fallback but still with the actual disease name
    console.log('All AI APIs failed, using fallback defaults');
    return createFallbackPlan(userInput, disease);
  } catch (error) {
    console.error('Error analyzing health condition:', error);

    return {
      disease: 'health condition',
      confidence: 30,
      personalizedTargets: {
        dailySteps: 9000,
        sleepHours: 7.5,
        calorieTarget: 2000,
        exerciseMinutes: 30,
      },
      personalizedWeights: {
        activity: 0.33,
        sleep: 0.33,
        nutrition: 0.34,
      },
      personalizedTips: ['Start tracking your health metrics', 'Maintain consistent daily movement'],
      healthProfile: 'Unable to analyze condition. Please try again.',
      riskFactors: [],
      recommendations: ['Try entering your condition with more detail', 'Consult with a healthcare provider'],
      errorMessage: 'Could not analyze condition. Please check your internet connection and try again.',
    };
  }
}
