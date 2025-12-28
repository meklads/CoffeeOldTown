
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

// المخطط البياني لتحليل الوجبات
const mealAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } }, required: ["name", "calories"] } },
    totalCalories: { type: Type.NUMBER },
    healthScore: { type: Type.NUMBER },
    macros: { type: Type.OBJECT, properties: { protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER } }, required: ["protein", "carbs", "fat"] },
    summary: { type: Type.STRING },
    personalizedAdvice: { type: Type.STRING }
  },
  required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice"]
};

// المخطط البياني لتوليد الخطط
const dayPlanSchema = {
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
 * وظيفة التحليل: تدعم المسار المباشر (Direct) أو الوسيط (Relay)
 */
export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  // 1. محاولة الاتصال المباشر إذا كان المفتاح متاحاً في المتصفح (تجاوز الـ Timeout)
  if (process.env.API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: `Analyze this meal for a ${profile?.persona || 'General'} user. JSON only. Lang: ${lang === 'ar' ? 'Arabic' : 'English'}.` }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: mealAnalysisSchema,
          temperature: 0.1
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      return { ...data, imageUrl: base64Image, timestamp: new Date().toLocaleString() };
    } catch (e) {
      console.error("Direct Analysis Failed, falling back to Relay:", e);
    }
  }

  // 2. الاتصال عبر السيرفر (Relay) - معرض للـ Timeout
  const response = await fetch('/api/analyze-meal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: base64Image, profile, lang })
  });

  if (!response.ok) throw new Error("SCAN_TIMEOUT");
  const data = await response.json();
  return { ...data, imageUrl: base64Image, timestamp: new Date().toLocaleString() };
};

/**
 * وظيفة توليد الخطط: تدعم المسار المباشر
 */
export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  if (process.env.API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Plan for ${request.goal}, persona: ${request.persona || 'General'}. Lang: ${lang === 'ar' ? 'Arabic' : 'English'}. JSON ONLY.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: dayPlanSchema,
          temperature: 0.1
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Direct Plan Generation Failed:", e);
    }
  }

  const response = await fetch('/api/generate-plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request, lang, feedback })
  });
  if (!response.ok) return null;
  return await response.json();
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
