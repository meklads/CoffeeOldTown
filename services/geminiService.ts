
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

const mealAnalysisSchema = {
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
    personalizedAdvice: { type: Type.STRING }
  },
  required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice"]
};

// HELPER: Safeguard API Key access for client-side environments like Vercel
const getAIClient = () => {
  // Try to get key from environment
  const key = process.env.API_KEY;
  if (!key) {
    const err = new Error("API_KEY_MISSING");
    (err as any).code = 'AUTH_REQUIRED';
    throw err;
  }
  return new GoogleGenAI({ apiKey: key });
};

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  try {
    const ai = getAIClient();
    const persona = profile?.persona || 'GENERAL';
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `TASK: Metabolic analysis for ${persona}. LANG: ${lang}. JSON ONLY.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: mealAnalysisSchema,
        temperature: 0
      }
    });
    
    const parsed = JSON.parse(response.text || '{}');
    return {
      ...parsed,
      imageUrl: base64Image,
      timestamp: new Date().toLocaleString()
    };
  } catch (e: any) {
    if (e.code === 'AUTH_REQUIRED' || e.message?.includes('key') || e.message?.includes('403')) {
      throw new Error("KEY_AUTH_FAILED");
    }
    throw e;
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string): Promise<DayPlan | null> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Plan for ${request.goal}. Persona: ${request.persona}. Lang: ${lang}. JSON.`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (e: any) {
    if (e.code === 'AUTH_REQUIRED' || e.message?.includes('key') || e.message?.includes('403')) {
      throw new Error("KEY_AUTH_FAILED");
    }
    throw e;
  }
};

export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] }
    });
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const p of parts) if (p.inlineData) return `data:image/png;base64,${p.inlineData.data}`;
    }
    return null;
  } catch { return null; }
};
