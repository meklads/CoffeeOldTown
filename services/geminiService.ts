
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

const mealAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } }, 
        required: ["name", "calories"] 
      } 
    },
    totalCalories: { type: Type.NUMBER },
    healthScore: { type: Type.NUMBER },
    macros: { 
      type: Type.OBJECT, 
      properties: { protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER } }, 
      required: ["protein", "carbs", "fat"] 
    },
    summary: { type: Type.STRING },
    personalizedAdvice: { type: Type.STRING }
  },
  required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice"]
};

const mealPlanSchema = {
  type: Type.OBJECT,
  properties: {
    breakfast: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING } }, required: ["name", "calories"] },
    lunch: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING } }, required: ["name", "calories"] },
    dinner: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING } }, required: ["name", "calories"] },
    snack: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING } }, required: ["name", "calories"] },
    totalCalories: { type: Type.STRING },
    advice: { type: Type.STRING }
  },
  required: ["breakfast", "lunch", "dinner", "snack", "totalCalories", "advice"]
};

/**
 * Analyzes meal image using client-side Gemini 3 model.
 * Creates a fresh GoogleGenAI instance on every call.
 */
export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Systematic Bio-Scan Protocol. 
          User Bio-Profile: ${profile?.persona || 'General'}.
          Analyze: Ingredients, Caloric density, Health viability.
          Output Format: JSON.
          Language: ${lang === 'ar' ? 'Arabic' : 'English'}.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: mealAnalysisSchema,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    if (!response.text) throw new Error("EMPTY_RESPONSE");
    const data = JSON.parse(response.text.trim());
    return { ...data, imageUrl: base64Image, timestamp: new Date().toLocaleString() };
  } catch (e: any) {
    console.error("Analysis Failed:", e);
    if (e.message?.includes("entity was not found") || e.message?.includes("API key")) {
      throw new Error("KEY_REBIND_REQUIRED");
    }
    throw e;
  }
};

/**
 * Generates meal plans using Gemini 3 model.
 * Creates a fresh GoogleGenAI instance on every call.
 */
export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_MISSING");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Synthesize metabolic meal plan. Goal: ${request.goal}. Persona: ${request.persona}. Lang: ${lang === 'ar' ? 'Arabic' : 'English'}. User Feedback Loop: ${JSON.stringify(feedback.slice(-3))}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: mealPlanSchema,
        temperature: 0.2
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Planning Failed:", e);
    return null;
  }
};

export const generateMascot = async (prompt: string): Promise<string | null> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Clinical minimalist brand icon: ${prompt}. Pure white background, high-end laboratory aesthetics.` }] },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const p of parts) {
        if (p.inlineData) return `data:image/png;base64,${p.inlineData.data}`;
      }
    }
    return null;
  } catch (error) { return null; }
};
