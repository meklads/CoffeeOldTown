
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '4mb',
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
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const { image, profile, lang } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'CONFIG_ERROR' });
  if (!image) return res.status(400).json({ error: 'IMAGE_MISSING' });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const persona = profile?.persona || 'GENERAL';

    // طلب تحليل فائق السرعة لتجنب Timeout
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `FAST ANALYSIS: Meal for ${persona} user. If ATHLETE focus on protein/recovery. If DIABETIC focus on carbs/glycemic. If PREGNANCY focus on safety/folic. Output JSON in ${lang === 'ar' ? 'Arabic' : 'English'}.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1, // تقليل العشوائية لسرعة الرد
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    const resultText = response.text;
    return res.status(200).json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Vercel API Error:", error);
    const status = error.status || 500;
    return res.status(status).json({ 
      error: status === 429 ? 'QUOTA_EXCEEDED' : 'PROCESSING_ERROR', 
      details: error.message 
    });
  }
}
