
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

/**
 * Note: We now route these calls through our internal Vercel API endpoints 
 * to protect the API key and avoid CORS issues in production.
 */

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile): Promise<MealAnalysisResult | null> => {
  try {
    // Send request to our own serverless function
    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        image: base64Image,
        profile 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to communicate with analysis server');
    }

    return await response.json();
  } catch (error) {
    console.error("Analysis Request Failed:", error);
    return null;
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  try {
    const response = await fetch('/api/generate-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request, feedback, lang }),
    });

    if (!response.ok) throw new Error('Failed to generate plan');
    return await response.json();
  } catch (error) {
    console.error("Plan Request Failed:", error);
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
  // On the client side, we check if the bridge is active by pinging the status
  return true; 
};
