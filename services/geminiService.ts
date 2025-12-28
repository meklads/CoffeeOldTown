
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  try {
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, profile, lang })
    });

    if (!response.ok) throw new Error("API_ERROR");
    
    const data = await response.json();
    return { ...data, imageUrl: base64Image, timestamp: new Date().toLocaleString() };
  } catch (error: any) {
    console.error("Analysis Error:", error);
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
    return await response.json();
  } catch (error: any) {
    console.error("Plan Error:", error);
    return null;
  }
};

export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/generate-mascot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.imageUrl || null;
  } catch (error) { return null; }
};
