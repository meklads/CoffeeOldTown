
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

/**
 * الحصول على نسخة من AI مع التأكد من وجود المفتاح
 */
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("KEY_MISSING");
  return new GoogleGenAI({ apiKey });
};

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  try {
    const ai = getAI();
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const persona = profile?.persona || 'GENERAL';

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `SYSTEM: Analyze for ${persona} protocol. Language: ${lang}. Return JSON.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return { ...JSON.parse(text.trim()), imageUrl: base64Image, timestamp: new Date().toLocaleString() };
  } catch (error: any) {
    if (error.message?.includes("not found")) throw new Error("KEY_INVALID");
    throw error;
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  try {
    const ai = getAI();
    const persona = request.persona || 'GENERAL';
    const language = lang === 'ar' ? 'Arabic' : 'English';
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Synthesize 1-day ${persona} plan for ${request.goal} in ${language}. JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            breakfast: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "calories", "protein", "description"] },
            lunch: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "calories", "protein", "description"] },
            dinner: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "calories", "protein", "description"] },
            snack: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING }, protein: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "calories", "protein", "description"] },
            totalCalories: { type: Type.STRING },
            advice: { type: Type.STRING }
          },
          required: ["breakfast", "lunch", "dinner", "snack", "totalCalories", "advice"]
        },
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text.trim());
  } catch (error: any) {
    if (error.message?.includes("not found")) throw new Error("KEY_INVALID");
    throw error;
  }
};

/**
 * توليد تميمة (Mascot) باستخدام موديل توليد الصور
 * Fix: Exporting generateMascot to fix the missing member error in MascotIcon.tsx
 */
export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality, professional, minimalist mascot icon for: ${prompt}. Vector style, sharp edges, isolated on a clean white background.` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    // البحث عن جزء الصورة في الرد (Iterate through all parts as per guidelines)
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString: string = part.inlineData.data;
          return `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
        }
      }
    }
    return null;
  } catch (error: any) {
    console.error("Mascot generation failed:", error);
    if (error.message?.includes("not found")) throw new Error("KEY_INVALID");
    return null;
  }
};
