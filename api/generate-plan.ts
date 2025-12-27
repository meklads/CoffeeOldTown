
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
  const apiKey = process.env.API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'SYSTEM_FAULT: API key missing.' });

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const persona = request.persona || 'GENERAL';
    const goal = request.goal;
    const language = lang === 'ar' ? 'Arabic (العربية)' : 'English';

    const prompt = `Act as a World-Class Metabolic Scientist and Clinical Nutritionist.
    Goal: ${goal}
    User Bio-Persona: ${persona}
    User Feedback History: ${JSON.stringify(feedback || [])}
    Language: ${language}

    TASK: Synthesize a 1-day precision metabolic blueprint. 
    Instructions:
    1. Provide exact calorie/protein estimates.
    2. Description must explain the biological "Why" for this specific user persona.
    3. Return strictly valid JSON following the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        responseSchema: dayPlanSchema,
        temperature: 0.2,
        // تفعيل ميزه التفكير العميق لزيادة جودة الخطة
        thinkingConfig: { thinkingBudget: 8000 }
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_AI_RESPONSE");
    
    return res.status(200).json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Plan Generation API Error:", error);
    return res.status(500).json({ error: 'Failed to generate plan', details: error.message });
  }
}
