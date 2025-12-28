
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60, // ملاحظة: في Vercel Hobby سيبقى 10 ثوانٍ كحد أقصى فعلي
  api: {
    bodyParser: {
      sizeLimit: '4mb', // خفض الحد ليتناسب مع قيود Vercel الصارمة
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
  // تفعيل الـ CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });

  const { image, profile, lang } = req.body;

  // التحقق من وجود المفتاح في بيئة Vercel
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey.length < 10) {
    return res.status(500).json({ 
      error: 'CONFIG_ERROR', 
      details: 'Vercel ENV: API_KEY is missing or invalid. Go to Settings > Environment Variables and ensure it is named API_KEY.' 
    });
  }

  if (!image) return res.status(400).json({ error: 'IMAGE_MISSING' });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const persona = profile?.persona || 'GENERAL';

    // استخدام أسرع إعدادات ممكنة لتجنب الـ Timeout في Vercel
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Analyze meal for ${persona} profile. Arabic output if lang is 'ar'. JSON only.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0, // لزيادة السرعة والدقة
        thinkingConfig: { thinkingBudget: 0 } // إلغاء التفكير لتقليل الوقت
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("EMPTY_AI_RESPONSE");
    
    return res.status(200).json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Vercel AI Error:", error);
    
    // التفرقة بين الخطأ في الحصة والخطأ في الخادم
    const errorStatus = error.status || 500;
    const isQuota = errorStatus === 429 || error.message?.includes('quota');
    
    return res.status(errorStatus).json({ 
      error: isQuota ? 'QUOTA_EXCEEDED' : 'PROCESSING_ERROR', 
      details: error.message 
    });
  }
}
