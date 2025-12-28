
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

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  // استخدام مفتاح النظام الافتراضي مع التحقق من وجوده
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("CONFIG_ERROR");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const persona = profile?.persona || 'GENERAL';

    // طلب تحليل فائق السرعة لضمان عدم تجاوز حدود Vercel أو المتصفح
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `FAST DIAGNOSIS: Analyze this specimen for ${persona} protocol. 
            Output JSON in ${lang === 'ar' ? 'Arabic' : 'English'}. 
            Focus: ${persona}. 
            Be concise.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    const result = JSON.parse(response.text.trim());
    return {
       ...result,
       imageUrl: base64Image,
       timestamp: new Date().toLocaleString()
    };
  } catch (error: any) {
    console.error("Gemini Direct Error:", error.message);
    if (error.message?.includes("429")) throw new Error("QUOTA_EXCEEDED");
    if (error.message?.includes("fetch")) throw new Error("NETWORK_DISRUPTION");
    throw new Error("NEURAL_LINK_FAILURE");
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, lang, feedback })
    });
    if (!response.ok) throw new Error("PLAN_SERVICE_FAILURE");
    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/generate-mascot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    return null;
  }
};
