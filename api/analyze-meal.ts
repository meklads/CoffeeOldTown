
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '10mb', // High limit for base64 images
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
  // Enable basic CORS for internal requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: API_KEY is missing from environment variables.");
    return res.status(500).json({ error: 'System configuration error: API_KEY missing.' });
  }

  if (!image) {
    return res.status(400).json({ error: 'Image data is required.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Ensure we handle various base64 formats
    const cleanBase64 = image.includes('base64,') ? image.split('base64,')[1] : image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite-latest', // Fast and reliable for vision tasks
      contents: {
        parts: [
          { inlineData: { data: cleanBase64, mimeType: 'image/jpeg' } },
          { text: "Act as a precision metabolic nutritionist. Identify ingredients, calculate calories, and provide a health score (0-100). Return ONLY the specified JSON format." }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.2
      }
    });

    if (!response || !response.text) {
      throw new Error("The AI model returned an empty response.");
    }

    const result = JSON.parse(response.text.trim());
    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Vercel Gemini Error:", error);
    return res.status(500).json({ 
      error: 'Analysis failed', 
      details: error.message,
      code: error.status || 500
    });
  }
}
