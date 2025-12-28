
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: {
      sizeLimit: '10mb',
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

  const { image, profile, lang } = req.body;

  // فحص حاسم لوجود المفتاح في إعدادات فيرسال
  if (!process.env.API_KEY) {
    return res.status(500).json({ 
      error: 'API_KEY_MISSING', 
      details: 'Critical: API_KEY is not set in Vercel Environment Variables. Please check your project settings.' 
    });
  }

  if (!image) return res.status(400).json({ error: 'NO_IMAGE', details: 'No image specimen received.' });

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const persona = profile?.persona || 'GENERAL';

    const prompt = lang === 'ar' 
      ? `حلل هذه الوجبة بدقة لمستخدم بروتوكول ${persona}. ركز على السعرات والماكروز بدقة جراحية. الرد JSON فقط.`
      : `Analyze this meal for a ${persona} profile. Focus on surgical calorie and macro precision. Return JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: prompt }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1
      }
    });

    if (!response.text) throw new Error("EMPTY_AI_RESPONSE");
    return res.status(200).json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("Vercel Function Failure:", error);
    
    const errMsg = (error.message || "").toLowerCase();
    const isQuota = error.status === 429 || errMsg.includes("quota") || errMsg.includes("limit");

    if (isQuota) {
      return res.status(429).json({ 
        error: 'QUOTA_EXCEEDED', 
        details: 'The lab reached its capacity. Use a personal API key or try in 60 seconds.' 
      });
    }

    return res.status(500).json({ 
      error: 'ANALYSIS_FAILED', 
      details: error.message 
    });
  }
}
