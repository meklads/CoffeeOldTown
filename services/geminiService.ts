
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

// هذه الوظيفة الآن تستخدم الـ API Route الخاص بنا لتجنب مشاكل المفاتيح في المتصفح
export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  try {
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, profile, lang })
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (response.status === 429) throw new Error("QUOTA_EXCEEDED");
      throw new Error(errorData.error || "ANALYSIS_FAILED");
    }

    const result = await response.json();
    return {
       ...result,
       imageUrl: base64Image,
       timestamp: new Date().toLocaleString()
    };
  } catch (error: any) {
    console.error("Neural Analysis Failure:", error.message);
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
    if (!response.ok) throw new Error("PLAN_SERVICE_FAILURE");
    return await response.json();
  } catch (error: any) {
    throw error;
  }
};

// إضافة الوظيفة المفقودة لإصلاح خطأ MascotIcon
export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/generate-mascot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.imageUrl || null;
  } catch (error) {
    console.error("Mascot generation failed:", error);
    return null;
  }
};
