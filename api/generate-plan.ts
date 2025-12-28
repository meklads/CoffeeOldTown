
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60,
};

const minimalSchema = {
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  const { request, lang } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Short meal plan for ${request.goal}. Lang: ${lang === 'ar' ? 'Ar' : 'En'}. JSON only.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: minimalSchema,
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return res.status(200).json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    return res.status(500).json({ error: 'FAILED' });
  }
}
