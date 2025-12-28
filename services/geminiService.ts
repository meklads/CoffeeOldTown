
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  try {
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, profile, lang })
    });

    if (!response.ok) {
      const errorData = await response.json();
      // إذا كان الخطأ متعلق بالحصة، نرمي خطأ مخصص لتعرفه الواجهة
      if (response.status === 429 || errorData.error === 'QUOTA_EXCEEDED') {
        throw new Error("QUOTA_EXCEEDED");
      }
      throw new Error(errorData.details || "API_ERROR");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Client Service Error:", error);
    throw error;
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, lang, feedback })
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error("QUOTA_EXCEEDED");
      throw new Error("PLAN_GENERATION_FAILED");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Client Plan Error:", error);
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
  return true; // المفتاح موجود في Vercel Env
};
