
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY_NOT_CONFIGURED");
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
          { text: `Analyze for ${persona}. Return JSON only. Lang: ${lang}.` }
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
        },
        temperature: 0.1, // أقصى سرعة
        thinkingConfig: { thinkingBudget: 0 } // لا تفكير، رد فوري
      }
    });

    return { ...JSON.parse(response.text.trim()), imageUrl: base64Image, timestamp: new Date().toLocaleString() };
  } catch (error: any) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  try {
    const ai = getAI();
    const persona = request.persona || 'GENERAL';
    const language = lang === 'ar' ? 'Arabic' : 'English';
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: `Quick 1-day ${persona} meal plan for ${request.goal} in ${language}. Concise JSON.`,
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
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("Plan synthesis failed:", error);
    throw error;
  }
};

export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Minimalist icon: ${prompt}. White background.` }] }
    });
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) { return null; }
};
