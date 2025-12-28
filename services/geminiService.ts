
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

// تهيئة كائن الـ AI مباشرة. 
// ملاحظة: يتم استخدام المفتاح من process.env.API_KEY الموفر من البيئة.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * تحليل الوجبات - يعمل مباشرة في المتصفح
 */
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
          { text: `SYSTEM_TASK: Dissect meal for ${persona} protocol. Lang: ${lang}. Provide JSON matching schema.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });

    const result = JSON.parse(response.text.trim());
    return {
      ...result,
      imageUrl: base64Image,
      timestamp: new Date().toLocaleString()
    };
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

/**
 * تخليق الخطط الغذائية (Bio Synthesis) - تم إصلاحه ليعمل مباشرة
 */
export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  try {
    const ai = getAI();
    const persona = request.persona || 'GENERAL';
    const language = lang === 'ar' ? 'Arabic' : 'English';
    
    const prompt = `Act as a Metabolic Scientist. 
    Task: Synthesize a 1-day nutrition plan for goal: ${request.goal}.
    Target Persona: ${persona}.
    History context: ${JSON.stringify(feedback.slice(-3))}.
    Response must be in ${language}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        },
        thinkingConfig: { thinkingBudget: 2000 }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    console.error("Synthesis Error:", error);
    throw error;
  }
};

/**
 * توليد الأيقونات (Mascot) - يعمل مباشرة
 */
export const generateMascot = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Minimalist mascot icon for: ${prompt}. White background.` }]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    return null;
  }
};
