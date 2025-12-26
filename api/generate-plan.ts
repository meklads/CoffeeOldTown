
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const apiKey = process.env.API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'SERVER_KEY_MISSING' });

  const { request, feedback, lang } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Synthesize a metabolic plan for goal: ${request.goal}. Language: ${lang}. 
    History: ${JSON.stringify(feedback.slice(0, 3))}. 
    Return JSON: {breakfast: Meal, lunch: Meal, dinner: Meal, snack: Meal, totalCalories: string, advice: string}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    return res.status(500).json({ error: 'Synthesis node failure' });
  }
}
