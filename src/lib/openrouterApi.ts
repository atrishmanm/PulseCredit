/**
 * OpenRouter API integration for AI-powered health analysis
 * Provides disease-specific insights with reasoning
 */

interface AnalysisRequest {
  disease: string;
  metrics: {
    sleep: { averageHours: number; consistency: number; quality: number };
    activity: { dailySteps: number; exerciseMinutes: number; sedentaryHours: number };
    diet: { calories: number; proteinGrams: number; healthyMealsPercentage: number };
    stress: { level: number; screenTimeHours: number };
    habits: { smokingFrequency: number; alcoholUnitsPerWeek: number };
  };
}

export interface RiskAnalysis {
  diseaseRisk: number; // 0-100
  otherRisks: Array<{ name: string; percentage: number }>;
  reasoning: string;
  diseaseSpecificInsights: string[];
  recommendedTargets: {
    steps: number;
    sleepHours: number;
    calorieTarget: number;
    exerciseMinutes: number;
  };
  targetExplanations: {
    steps: string;
    sleep: string;
    calories: string;
    exercise: string;
  };
}

interface SimulationRequest {
  disease: string;
  currentMetrics: AnalysisRequest['metrics'];
  projectedMetrics: AnalysisRequest['metrics'];
  timeframeMonths: number;
}

interface SimulationAnalysis {
  projectedRisk: number;
  riskChange: number; // positive = worse, negative = better
  reasoningSteps: string[];
  impactSummary: string;
  keyFactors: Array<{ factor: string; impact: string }>;
  projectedRisks?: {
    obesity: number;
    diabetes: number;
    cardiovascularDisease: number;
    stressBurnout: number;
    sleepDisorder: number;
  };
}

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * Analyze health metrics for a specific disease with detailed reasoning
 */
export async function analyzeHealthWithAI(request: AnalysisRequest): Promise<RiskAnalysis> {
  try {
    const prompt = `You are a medical AI assistant. Analyze this patient's health profile and provide detailed risk analysis.

Disease: ${request.disease}

Current Metrics:
- Sleep: ${request.metrics.sleep.averageHours}h/night (consistency: ${request.metrics.sleep.consistency}%, quality: ${request.metrics.sleep.quality}%)
- Activity: ${request.metrics.activity.dailySteps} steps/day, ${request.metrics.activity.exerciseMinutes}min exercise/day, ${request.metrics.activity.sedentaryHours}h sedentary
- Diet: ${request.metrics.diet.calories} cal/day, ${request.metrics.diet.proteinGrams}g protein, ${request.metrics.diet.healthyMealsPercentage}% healthy meals
- Stress: Level ${request.metrics.stress.level}/100, ${request.metrics.stress.screenTimeHours}h screen time/day
- Habits: Smoking ${request.metrics.habits.smokingFrequency}/10, ${request.metrics.habits.alcoholUnitsPerWeek} alcohol units/week

Provide a JSON response with this exact structure (no markdown):
{
  "diseaseRisk": <0-100 number based on disease-specific risk factors>,
  "otherRisks": [
    {"name": "Obesity", "percentage": <0-100>},
    {"name": "Cardiovascular", "percentage": <0-100>},
    {"name": "Stress Burnout", "percentage": <0-100>}
  ],
  "reasoning": "<1-2 sentence explanation of why this risk level>",
  "diseaseSpecificInsights": [
    "<specific insight 1 for this disease>",
    "<specific insight 2 for this disease>",
    "<specific insight 3 for this disease>"
  ],
  "recommendedTargets": {
    "steps": <daily step target for this disease>,
    "sleepHours": <sleep hours for this disease>,
    "calorieTarget": <calorie target for this disease>,
    "exerciseMinutes": <exercise minutes for this disease>
  },
  "targetExplanations": {
    "steps": "<why this step target for this disease>",
    "sleep": "<why this sleep duration for this disease>",
    "calories": "<why this calorie target for this disease>",
    "exercise": "<why this exercise duration for this disease>"
  }
}

Focus on ${request.disease}-specific factors. Return only valid JSON.`;

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'ViteCredit Health Engine',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    // Extract JSON from response (in case it's wrapped in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from API');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error analyzing health with AI:', error);
    // Return sensible defaults on error
    return {
      diseaseRisk: 50,
      otherRisks: [
        { name: 'Obesity', percentage: 40 },
        { name: 'Cardiovascular', percentage: 35 },
        { name: 'Stress Burnout', percentage: 45 },
      ],
      reasoning: 'Unable to complete AI analysis. Showing baseline recommendations.',
      diseaseSpecificInsights: [
        'Monitor your current health metrics regularly',
        'Maintain consistent sleep and exercise schedules',
        'Track improvements over time',
      ],
      recommendedTargets: {
        steps: 9000,
        sleepHours: 7.5,
        calorieTarget: 2000,
        exerciseMinutes: 30,
      },
      targetExplanations: {
        steps: 'Standard recommendation for general health',
        sleep: 'Recommended for most adults',
        calories: 'Average daily calorie intake',
        exercise: 'WHO recommended daily exercise',
      },
    };
  }
}

/**
 * Simulate what-if scenario with step-by-step reasoning
 */
export async function simulateWhatIfWithAI(request: SimulationRequest): Promise<SimulationAnalysis> {
  try {
    const metricsChange = {
      stepsChange: request.projectedMetrics.activity.dailySteps - request.currentMetrics.activity.dailySteps,
      exerciseChange: request.projectedMetrics.activity.exerciseMinutes - request.currentMetrics.activity.exerciseMinutes,
      sleepChange: request.projectedMetrics.sleep.averageHours - request.currentMetrics.sleep.averageHours,
      calorieChange: request.projectedMetrics.diet.calories - request.currentMetrics.diet.calories,
      stressChange: request.projectedMetrics.stress.level - request.currentMetrics.stress.level,
    };

    const prompt = `You are a medical AI assistant. Predict how lifestyle changes will affect a patient's health over ${request.timeframeMonths} months.

Disease: ${request.disease}

Current Metrics:
- Daily Steps: ${request.currentMetrics.activity.dailySteps}
- Exercise: ${request.currentMetrics.activity.exerciseMinutes}min/day
- Sleep: ${request.currentMetrics.sleep.averageHours}h/night
- Calories: ${request.currentMetrics.diet.calories}/day
- Stress Level: ${request.currentMetrics.stress.level}/100

Projected Changes (in ${request.timeframeMonths} months):
- Daily Steps: ${request.projectedMetrics.activity.dailySteps} (change: ${metricsChange.stepsChange > 0 ? '+' : ''}${metricsChange.stepsChange})
- Exercise: ${request.projectedMetrics.activity.exerciseMinutes}min/day (change: ${metricsChange.exerciseChange > 0 ? '+' : ''}${metricsChange.exerciseChange})
- Sleep: ${request.projectedMetrics.sleep.averageHours}h/night (change: ${metricsChange.sleepChange > 0 ? '+' : ''}${metricsChange.sleepChange})
- Calories: ${request.projectedMetrics.diet.calories}/day (change: ${metricsChange.calorieChange > 0 ? '+' : ''}${metricsChange.calorieChange})
- Stress: ${request.projectedMetrics.stress.level}/100 (change: ${metricsChange.stressChange > 0 ? '+' : ''}${metricsChange.stressChange})

Provide a JSON response with exact structure (no markdown):
{
  "projectedRisk": <0-100 estimated risk for ${request.disease} after ${request.timeframeMonths} months>,
  "riskChange": <negative number if improving, positive if worsening>,
  "projectedRisks": {
    "obesity": <0-100 estimated obesity risk>,
    "diabetes": <0-100 estimated diabetes risk>,
    "cardiovascularDisease": <0-100 estimated cardiovascular disease risk>,
    "stressBurnout": <0-100 estimated stress/burnout risk>,
    "sleepDisorder": <0-100 estimated sleep disorder risk>
  },
  "reasoningSteps": [
    "<step 1: how sleep change affects these risks>",
    "<step 2: how activity/exercise change affects these risks>",
    "<step 3: how calorie/diet change affects these risks>",
    "<step 4: how stress change affects mental and physical health>",
    "<step 5: overall health trajectory after ${request.timeframeMonths} months>"
  ],
  "impactSummary": "<1-2 sentence summary of overall health trajectory>",
  "keyFactors": [
    {"factor": "Exercise", "impact": "<specifically how +${metricsChange.exerciseChange} min exercise affects health>"},
    {"factor": "Sleep", "impact": "<specifically how sleep change affects health>"},
    {"factor": "Diet", "impact": "<specifically how diet change affects health>"}
  ]
}

Return only valid JSON. Be specific and analyze all major health risks.`;

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'ViteCredit Health Engine',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from API');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error simulating with AI:', error);
    // Return sensible defaults on error
    return {
      projectedRisk: 50,
      riskChange: 0,
      projectedRisks: {
        obesity: 45,
        diabetes: 50,
        cardiovascularDisease: 48,
        stressBurnout: 52,
        sleepDisorder: 40,
      },
      reasoningSteps: [
        'Unable to complete AI analysis',
        'Showing baseline health projections',
        'Please check your API key and network connection',
        'Try selecting a specific health scenario again',
        'Exercise, sleep, and diet improvements generally reduce all risks',
      ],
      impactSummary: 'Unable to generate AI projection. Showing baseline recommendations.',
      keyFactors: [
        { factor: 'Sleep', impact: 'Affects immune and metabolic function' },
        { factor: 'Activity', impact: 'Improves cardiovascular and metabolic health' },
        { factor: 'Diet', impact: 'Supports stable blood sugar and weight management' },
      ],
    };
  }
}

/**
 * Generate disease-specific bio-twin analysis
 */
export async function generateBioTwinAnalysisWithAI(
  disease: string,
  riskFactors: { obesity: number; diabetes: number; cardiovascular: number; stress: number; sleep: number }
): Promise<{ bodyPartAnalyses: Array<{ name: string; risk: number; explanation: string }> }> {
  try {
    const prompt = `You are a medical AI assistant. Analyze how ${disease} affects different body systems.

Current Risk Factors:
- Obesity: ${riskFactors.obesity}%
- Diabetes: ${riskFactors.diabetes}%
- Cardiovascular: ${riskFactors.cardiovascular}%
- Stress: ${riskFactors.stress}%
- Sleep: ${riskFactors.sleep}%

For ${disease}, analyze these body systems:
1. Brain/Mental Health
2. Heart/Cardiovascular
3. Metabolism/Pancreas
4. Musculoskeletal/Body Composition
5. Sleep/Nervous System

Provide JSON (no markdown):
{
  "bodyPartAnalyses": [
    {"name": "Mental Health", "risk": <0-100 for ${disease}>, "explanation": "<how ${disease} affects mental health>"},
    {"name": "Cardiovascular", "risk": <0-100 for ${disease}>, "explanation": "<how ${disease} affects heart>"},
    {"name": "Metabolism", "risk": <0-100 for ${disease}>, "explanation": "<how ${disease} affects metabolism>"},
    {"name": "Body Composition", "risk": <0-100 for ${disease}>, "explanation": "<how ${disease} affects body>"},
    {"name": "Sleep System", "risk": <0-100 for ${disease}>, "explanation": "<how ${disease} affects sleep>"}
  ]
}

Be specific to ${disease}. Return only valid JSON.`;

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'ViteCredit Health Engine',
      },
      body: JSON.stringify({
        model: 'openrouter/auto',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from API');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Error generating bio-twin analysis:', error);
    return {
      bodyPartAnalyses: [
        { name: 'Mental Health', risk: 30, explanation: 'Monitor stress levels and mental wellbeing' },
        { name: 'Cardiovascular', risk: 35, explanation: 'Regular heart health monitoring recommended' },
        { name: 'Metabolism', risk: 40, explanation: 'Focus on metabolic health through diet and exercise' },
        { name: 'Body Composition', risk: 45, explanation: 'Maintain healthy weight through balanced lifestyle' },
        { name: 'Sleep System', risk: 35, explanation: 'Prioritize consistent sleep schedule' },
      ],
    };
  }
}
