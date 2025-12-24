
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 10, // Hard limit for Vercel Hobby
  api: {
    bodyParser: {
      sizeLimit: '1mb', // Extremely tight limit for speed
    },
  },
};

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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'System key missing.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Use gemini-3-flash-preview for the fastest possible turn-around
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: "Brief meal analysis. Output JSON." }
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
    if (!text) {
      throw new Error("Empty response from AI engine.");
    }

    return res.status(200).json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ 
      error: 'Analysis Failed', 
      details: error.message 
    });
  }
}
