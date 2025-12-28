
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

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

// Fix: Added mealPlanSchema for the generateMealPlan function
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
 * وظيفة التحليل: تعتمد الآن بشكل أساسي على المفتاح المباشر لتجاوز قيود Vercel
 */
export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  const isAr = lang === 'ar';
  
  // 1. استخدام المفتاح المباشر (الحل المضمون)
  if (process.env.API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
            { text: `Analyze meal for ${profile?.persona || 'General'}. JSON only. Lang: ${isAr ? 'Arabic' : 'English'}.` }
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
      console.error("Direct Path Failed:", e);
      // إذا كان الخطأ متعلق بالمفتاح، نعيد المحاولة عبر الخادم
      if (e.message?.includes("entity was not found")) {
        // نطلب إعادة ربط المفتاح من الواجهة
        throw new Error("KEY_REBIND_NEEDED");
      }
    }
  }

  // 2. المحاولة الأخيرة عبر الخادم (قد تفشل بسبب الـ Timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9500); // إحباط مبكر لتجنب خطأ Vercel القبيح

    const response = await fetch('/api/analyze-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, profile, lang }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("SCAN_TIMEOUT");
    const data = await response.json();
    return { ...data, imageUrl: base64Image, timestamp: new Date().toLocaleString() };
  } catch (err: any) {
    throw new Error(err.name === 'AbortError' ? "SCAN_TIMEOUT" : "CONNECTION_ERROR");
  }
};

// Fix: Export generateMealPlan to resolve missing member error
export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[]): Promise<DayPlan | null> => {
  const isAr = lang === 'ar';
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short and concise meal plan for a ${request.persona || 'General'} user with the goal: ${request.goal}. 
      Diet type: ${request.diet}. Language: ${isAr ? 'Arabic' : 'English'}. 
      Consider this feedback history: ${JSON.stringify(feedback.slice(-5))}. JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: mealPlanSchema,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim());
  } catch (error) {
    console.error("Meal Plan Generation Error:", error);
    return null;
  }
};

// Fix: Export generateMascot to resolve missing member error
export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality, professional, minimalist mascot icon for: ${prompt}. Vector style, sharp edges, isolated on a clean white background.` }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Mascot Generation Error:", error);
    return null;
  }
};
