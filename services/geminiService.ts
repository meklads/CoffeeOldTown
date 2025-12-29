
import { GoogleGenAI, Type } from "@google/genai";
import { UserHealthProfile, MealAnalysisResult, MealPlanRequest, DayPlan, FeedbackEntry } from '../types.ts';

const mealAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { 
          name: { type: Type.STRING, description: "Name of the food item" }, 
          calories: { type: Type.NUMBER, description: "Estimated calories" } 
        }, 
        required: ["name", "calories"] 
      } 
    },
    totalCalories: { type: Type.NUMBER, description: "Sum of all ingredient calories" },
    healthScore: { type: Type.NUMBER, description: "Vitality score from 0-100" },
    macros: { 
      type: Type.OBJECT, 
      properties: { 
        protein: { type: Type.NUMBER, description: "Grams of protein" }, 
        carbs: { type: Type.NUMBER, description: "Grams of carbohydrates" }, 
        fat: { type: Type.NUMBER, description: "Grams of fat" } 
      }, 
      required: ["protein", "carbs", "fat"] 
    },
    summary: { type: Type.STRING, description: "A concise 2-3 word name for the meal" },
    personalizedAdvice: { type: Type.STRING, description: "Medical-grade advice based on the user's specific persona" }
  },
  required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice"]
};

export const analyzeMealImage = async (base64Image: string, profile: UserHealthProfile, lang: string = 'en'): Promise<MealAnalysisResult | null> => {
  if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");

  // Always create new instance to ensure up-to-date key from global state
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const personaInstructions = {
    ATHLETE: "Act as a Performance Nutritionist. Focus on protein density, leucine content for muscle synthesis, and glycogen replenishment. Use terms like 'Anabolic potential' and 'Hypertrophy support'.",
    DIABETIC: "Act as an Endocrinologist/Dietitian. Strictly analyze Glycemic Index and Load. Warn about sugar spikes. Suggest fiber or vinegar additions to flatten the glucose curve. Prioritize low GI ingredients.",
    PREGNANCY: "Act as an Obstetric Nutritionist. Prioritize food safety (no raw sprouts, unpasteurized cheese, undercooked meat). Focus on Folic Acid, Iron, DHA, and Calcium. Mention fetal development benefits.",
    GENERAL: "Act as a Holistic Longevity Coach. Focus on micronutrient density, anti-inflammatory properties, and general metabolic health."
  };

  const persona = profile?.persona || 'GENERAL';
  const instruction = personaInstructions[persona as keyof typeof personaInstructions];

  try {
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `SYSTEM PROTOCOL: ${instruction}
                   INPUT: Visual meal specimen.
                   TASK: Perform deep metabolic analysis.
                   LANGUAGE: ${lang === 'ar' ? 'Arabic' : 'English'}.
                   OUTPUT: JSON according to schema.` }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: mealAnalysisSchema,
        temperature: 0,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("EMPTY_AI_RESPONSE");
    
    const parsed = JSON.parse(text.trim());
    return {
      ...parsed,
      imageUrl: base64Image,
      timestamp: new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')
    };
  } catch (e: any) {
    console.error("Analysis node failure:", e);
    if (e.message?.includes("entity was not found") || e.message?.includes("API key") || e.message?.includes("403")) {
      throw new Error("KEY_REBIND_REQUIRED");
    }
    throw e;
  }
};

export const generateMealPlan = async (request: MealPlanRequest, lang: string, feedback: FeedbackEntry[] = []): Promise<DayPlan | null> => {
  if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const persona = request.persona || 'GENERAL';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Synthesize a 24-hour metabolic blueprint for a ${persona} profile. Goal: ${request.goal}. 
                 Consider feedback history length: ${feedback.length}. 
                 Return JSON with breakfast, lunch, dinner, snack (each with 'name', 'calories', 'description'), 'totalCalories', and 'advice'.
                 Language: ${lang === 'ar' ? 'Arabic' : 'English'}.`,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Synthesis node failure:", e);
    return null;
  }
};

export const generateMascot = async (prompt: string): Promise<string | null> => {
  if (!process.env.API_KEY) return null;
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: `High-end laboratory icon: ${prompt}. Minimalist gold and white vector, luxury feel.` }] },
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
