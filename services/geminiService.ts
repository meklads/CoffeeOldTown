
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

// الممارسة الفضلى: إنشاء مثيل الذكاء الاصطناعي باستخدام المفتاح من البيئة مباشرة
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MEAL_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          calories: { type: Type.NUMBER }
        },
        required: ["name", "calories"]
      }
    },
    totalCalories: { type: Type.NUMBER },
    healthScore: { type: Type.NUMBER },
    macros: {
      type: Type.OBJECT,
      properties: {
        protein: { type: Type.NUMBER },
        carbs: { type: Type.NUMBER },
        fat: { type: Type.NUMBER }
      },
      required: ["protein", "carbs", "fat"]
    },
    summary: { type: Type.STRING },
    personalizedAdvice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    warnings: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          riskLevel: { type: Type.STRING, description: "low, medium, or high" },
          type: { type: Type.STRING, description: "sugar, sodium, pregnancy, allergy, or general" }
        },
        required: ["text", "riskLevel", "type"]
      },
    }
  },
  required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice", "warnings"]
};

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile): Promise<MealAnalysisResult | null> => {
  try {
    const ai = getAI();
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const persona = profile.persona || 'GENERAL';

    let personaContext = "";
    if (persona === 'PREGNANCY') {
      personaContext = "User is PREGNANT. Focus on Folic Acid, Iron. Critical warnings for raw/mercury foods.";
    } else if (persona === 'DIABETIC') {
      personaContext = "User is DIABETIC. Focus on Glycemic Load and hidden sugars.";
    } else if (persona === 'ATHLETE') {
      personaContext = "User is ATHLETE. Focus on Protein & Recovery.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Scientific clinical analysis for ${persona}. ${personaContext} Analyze meal and return JSON. Response must be in Arabic for 'summary' and 'personalizedAdvice'.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: MEAL_ANALYSIS_SCHEMA,
        temperature: 0.1
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    return JSON.parse(text.trim()) as MealAnalysisResult;
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    // تخصيص رسالة الخطأ للمستخدم في حالة استنفاد الحصة
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      throw new Error("QUOTA_EXCEEDED");
    }
    throw error;
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  try {
    const ai = getAI();
    const prompt = `Synthesize metabolic daily meal plan for: ${request.goal}. Language: ${lang}. Return JSON fitting DayPlan structure.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return response.text ? JSON.parse(response.text.trim()) : null;
  } catch (error) {
    return null;
  }
};

export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `Professional medical icon: ${prompt}` }] }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch {
    return null;
  }
};

export const isSystemKeyAvailable = async (): Promise<boolean> => !!process.env.API_KEY;
