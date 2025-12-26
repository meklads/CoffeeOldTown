
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { request, feedback } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'SERVER_KEY_MISSING' });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Generate an optimized metabolic nutrition plan for goal: ${request.goal}. 
    Diet preference: ${request.diet}. 
    User history context: ${JSON.stringify(feedback.slice(0, 3))}. 
    Return a structured JSON following the DayPlan interface (breakfast, lunch, dinner, snack, totalCalories, advice).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return res.status(200).json(JSON.parse(response.text || '{}'));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate plan' });
  }
}
