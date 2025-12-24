
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

/**
 * Bio-Bridge Central Communication Service
 * Routes all traffic through Vercel API nodes.
 */

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile): Promise<MealAnalysisResult | null> => {
  try {
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, profile }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Communication Fault' }));
      throw new Error(errorData.details || errorData.error || 'Diagnostic server unreachable');
    }

    return await response.json();
  } catch (error: any) {
    console.error("analyzeMealImage Error:", error);
    throw error; 
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, feedback, lang }),
    });

    if (!response.ok) throw new Error('Failed to synthesize plan');
    return await response.json();
  } catch (error) {
    console.error("generateMealPlan Error:", error);
    return null;
  }
};

export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const response = await fetch('/api/generate-mascot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data.imageUrl;
  } catch {
    return null;
  }
};

export const isSystemKeyAvailable = async (): Promise<boolean> => {
  return true; // Managed server-side
};
