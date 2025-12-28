
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

// تعريف المخطط (Schema) للرد لضمان الحصول على بيانات مهيكلة دائماً
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
  try {
    // الاتصال المباشر بجوجل من المتصفح لتخطي Vercel Timeout
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const persona = profile?.persona || 'GENERAL';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `DIAGNOSTIC MISSION: Analyze this meal as a senior metabolic scientist. 
            Protocol: ${persona}. 
            Constraints: Focus heavily on ${persona === 'ATHLETE' ? 'protein and amino acid profile' : persona === 'DIABETIC' ? 'glycemic index and carb control' : persona === 'PREGNANCY' ? 'safety and micronutrients' : 'overall balance'}. 
            Language: ${lang === 'ar' ? 'Arabic' : 'English'}.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 } // تعطيل التفكير لضمان السرعة القصوى
      }
    });

    const result = JSON.parse(response.text.trim());
    return {
       ...result,
       imageUrl: base64Image,
       timestamp: new Date().toLocaleString()
    };
  } catch (error: any) {
    console.error("Direct API Error:", error.message);
    if (error.message?.includes("429")) throw new Error("QUOTA_EXCEEDED");
    throw new Error("NEURAL_LINK_FAILURE");
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  // للخطط المعقدة، يمكننا الاستمرار في استخدام السيرفر أو التحويل للمتصفح أيضاً
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, lang, feedback })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) throw new Error("QUOTA_EXCEEDED");
      throw new Error(errorData.details || "PLAN_ERROR");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Plan Service Error:", error.message);
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

export const isSystemKeyAvailable = async (): Promise<boolean> => {
  return !!process.env.API_KEY; 
};
