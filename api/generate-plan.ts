
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60,
};

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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { request, lang, feedback } = req.body;

  if (!process.env.API_KEY) return res.status(500).json({ error: 'API_KEY_MISSING' });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const persona = request.persona || 'GENERAL';
    const goal = request.goal;
    const language = lang === 'ar' ? 'Arabic (العربية)' : 'English';

    const systemInstruction = `You are a World-Class Metabolic Scientist at "Coffee Old Town Lab".
    Your task is to synthesize a high-precision 1-day meal plan optimized for the user's bio-persona and goal.
    Bio-Persona: ${persona}
    Target Goal: ${goal}
    User Historical Data: ${JSON.stringify(feedback || [])}
    All text output must be in ${language}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate the metabolic blueprint for today. Strictly follow the JSON schema.",
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: dayPlanSchema,
        temperature: 0.2,
        thinkingConfig: { thinkingBudget: 0 } // Flash-preview is fast and reliable without deep thinking for this task
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    
    return res.status(200).json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Plan Generation Error:", error);
    return res.status(500).json({ error: 'PLAN_FAILED', message: error.message });
  }
}
