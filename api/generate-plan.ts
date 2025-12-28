
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60,
};

const dayPlanSchema = {
  type: Type.OBJECT,
  properties: {
    breakfast: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "calories", "description"] },
    lunch: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "calories", "description"] },
    dinner: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "calories", "description"] },
    snack: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["name", "calories", "description"] },
    totalCalories: { type: Type.STRING },
    advice: { type: Type.STRING }
  },
  required: ["breakfast", "lunch", "dinner", "snack", "totalCalories", "advice"]
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  const { request, lang, feedback } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 1-day meal plan for goal: ${request.goal}, persona: ${request.persona || 'General'}. Language: ${lang === 'ar' ? 'Arabic' : 'English'}. JSON ONLY.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: dayPlanSchema,
        temperature: 0.2
      }
    });

    return res.status(200).json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("Synthesis API Error:", error);
    return res.status(500).json({ error: 'SYNTHESIS_FAILED' });
  }
}
