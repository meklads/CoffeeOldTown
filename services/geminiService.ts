
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

// تهيئة العميل مباشرة باستخدام المفتاح من بيئة التشغيل
const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("MISSING_KEY");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  try {
    const ai = getAI();
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const persona = profile?.persona || 'GENERAL';

    const languageInstruction = lang === 'ar' 
      ? "يجب أن تكون الاستجابة باللغة العربية الفصحى فقط." 
      : "Response must be entirely in English.";

    const mealAnalysisSchema = {
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
        personalizedAdvice: { type: Type.STRING }
      },
      required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `تحليل جزيئي دقيق لهذا الطبق بناءً على بروتوكول: ${persona}. ${languageInstruction} قدم النتيجة بتنسيق JSON حصراً. ركز على نصائح تخص الـ ${persona} تحديداً.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1
      }
    });

    const resultText = response.text;
    if (!resultText) return null;
    
    return JSON.parse(resultText.trim());
  } catch (error: any) {
    console.error("Analysis Error:", error);
    if (error.message === "MISSING_KEY") throw new Error("MISSING_KEY");
    throw error;
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  try {
    const ai = getAI();
    const persona = request.persona || 'GENERAL';
    const goal = request.goal;
    const language = lang === 'ar' ? 'العربية' : 'English';

    const dayPlanSchema = {
      type: Type.OBJECT,
      properties: {
        breakfast: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.STRING },
            protein: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "calories", "protein", "description"]
        },
        lunch: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.STRING },
            protein: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "calories", "protein", "description"]
        },
        dinner: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.STRING },
            protein: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "calories", "protein", "description"]
        },
        snack: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.STRING },
            protein: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["name", "calories", "protein", "description"]
        },
        totalCalories: { type: Type.STRING },
        advice: { type: Type.STRING }
      },
      required: ["breakfast", "lunch", "dinner", "snack", "totalCalories", "advice"]
    };

    const prompt = `بصفتك عالم تغذية ومختص أيضي، صمم خطة وجبات ليوم واحد.
    الهدف: ${goal}
    البروتوكول الحيوي: ${persona}
    اللغة المطلوبة: ${language}
    تاريخ الملاحظات السابقة: ${JSON.stringify(feedback || [])}
    يجب أن تشرح الفقرات التأثير البيولوجي لكل وجبة بناءً على بروتوكول ${persona}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: dayPlanSchema,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text.trim());
  } catch (error: any) {
    console.error("Plan Generation Error:", error);
    throw error;
  }
};

export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Professional minimalist vector logo for: ${prompt}. High contrast, isolated on white background.` }]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Mascot Error:", error);
    return null;
  }
};

export const isSystemKeyAvailable = async (): Promise<boolean> => {
  return !!process.env.API_KEY;
};
