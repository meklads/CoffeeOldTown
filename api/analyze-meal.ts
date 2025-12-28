
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 10, // Vercel Hobby limit
  api: {
    bodyParser: {
      sizeLimit: '2mb', // تقليل حجم البيانات المرسلة
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

    // استخدام gemini-3-flash-preview ولكن مع إعدادات تجعله "فائق السرعة"
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `ULTRA-FAST MISSION: Analyze this meal for a ${persona} protocol. 
            Focus: ${persona === 'ATHLETE' ? 'Protein/Recovery' : persona === 'DIABETIC' ? 'Carbs/Sugar' : persona === 'PREGNANCY' ? 'Safety/Folic' : 'Balance'}. 
            Be extremely concise. Use ${lang === 'ar' ? 'Arabic' : 'English'}.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1, // لزيادة سرعة التوليد
        topP: 0.8,
        thinkingConfig: { thinkingBudget: 0 } // إيقاف التفكير لضمان عدم تجاوز الـ 10 ثوانٍ
      }
    });

    return res.status(200).json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    console.error("Critical API Failure:", error);
    const status = error.status || 500;
    // إرسال نوع الخطأ بوضوح للواجهة لتتمكن من إعادة المحاولة
    return res.status(status).json({ 
      error: status === 429 ? 'QUOTA_EXCEEDED' : 'PROCESSING_ERROR',
      message: error.message 
    });
  }
}
