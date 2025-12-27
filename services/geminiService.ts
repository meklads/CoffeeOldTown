
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

/**
 * هذا الملف الآن يعمل كوسيط (Proxy) بين الواجهة الأمامية ووظائف Vercel الخلفية.
 * هذا يضمن أن مفتاح API يبقى سرياً ويعمل دائماً على Vercel.
 */

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  try {
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, profile, lang })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error === 'SYSTEM_FAULT: API key missing.') throw new Error("MISSING_KEY");
      throw new Error(errorData.details || "API_ERROR");
    }

    return await response.json();
  } catch (error: any) {
    console.error("Client Analysis Error:", error);
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

    if (!response.ok) throw new Error("PLAN_GENERATION_FAILED");

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
    console.error("Client Mascot Error:", error);
    return null;
  }
};

export const isSystemKeyAvailable = async (): Promise<boolean> => {
  // بما أننا نستخدم API Routes، المفتاح دائماً متاح على السيرفر
  return true;
};
