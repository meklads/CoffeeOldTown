
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MEAL_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER }
        },
        required: ["name", "calories"]
      }
    },
    totalCalories: { type: Type.NUMBER },
    healthScore: { type: Type.NUMBER },
    macros: {
      type: Type.OBJECT,
      properties: {
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fat: { type: Type.NUMBER }
      },
      required: ["protein", "carbs", "fat"]
    },
    summary: { type: Type.STRING },
    personalizedAdvice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    warnings: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          riskLevel: { type: Type.STRING },
          type: { type: Type.STRING }
        },
        required: ["text", "riskLevel", "type"]
      },
    }
  },
  required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice", "warnings"]
};

const DAY_PLAN_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    breakfast: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "calories", "protein", "description"]
    },
    lunch: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "calories", "protein", "description"]
    },
    dinner: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "calories", "protein", "description"]
    },
    snack: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "calories", "protein", "description"]
    },
    totalCalories: { type: Type.STRING },
    advice: { type: Type.STRING }
  },
  required: ["breakfast", "lunch", "dinner", "snack", "totalCalories", "advice"]
};

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  try {
    const ai = getAI();
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const persona = profile.persona || 'GENERAL';

    const languageInstruction = lang === 'ar' 
      ? "Response must be entirely in Arabic (العربية)." 
      : "Response must be entirely in English.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Clinical analysis for ${persona}. Analyze meal and return JSON. ${languageInstruction}` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: MEAL_ANALYSIS_SCHEMA,
        temperature: 0.1
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error: any) {
    if (error.message?.includes('429')) throw new Error("QUOTA_EXCEEDED");
    throw error;
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  try {
    const ai = getAI();
    const persona = request.persona || 'GENERAL';
    const goal = request.goal;
    
    const prompt = `Act as a Metabolic Scientist. Synthesize a 1-day precision meal plan.
    Target Goal: ${goal}
    User Bio-Persona: ${persona}
    History Feedback: ${JSON.stringify(feedback.slice(0, 3))}
    Language: ${lang === 'ar' ? 'Arabic (العربية)' : 'English'}
    
    Rules: 
    1. Meals must be scientifically effective for the goal (e.g., if Immunity, use antioxidants/zinc-rich foods).
    2. Description must explain 'Why' this meal helps this specific goal.
    3. Return strictly valid JSON following the provided schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: DAY_PLAN_SCHEMA,
        temperature: 0.2
      }
    });

    return response.text ? JSON.parse(response.text.trim()) : null;
  } catch (error) {
    console.error("Plan Gen Error:", error);
    return null;
  }
};

export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Professional medical icon: ${prompt}` }] }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch {
    return null;
  }
};

export const isSystemKeyAvailable = async (): Promise<boolean> => !!process.env.API_KEY;
