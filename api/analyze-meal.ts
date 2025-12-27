
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60, // زيادة مدة التشغيل للصور الكبيرة
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
    personalizedAdvice: { type: Type.STRING }, // تعديل ليكون نصاً واحداً بدلاً من مصفوفة لتجنب مشاكل العرض
    warnings: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          riskLevel: { type: Type.STRING, description: "low, medium, or high" },
          type: { type: Type.STRING, description: "sugar, sodium, pregnancy, allergy, or general" }
        },
        required: ["text", "riskLevel", "type"]
      }
    }
  },
  required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice", "warnings"]
};

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, profile, lang } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'SYSTEM_FAULT: API key missing.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const persona = profile?.persona || 'GENERAL';

    const languageInstruction = lang === 'ar' 
      ? "Response must be entirely in Arabic (العربية)." 
      : "Response must be entirely in English.";

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Scientific clinical analysis for a user with profile: ${persona}. Analyze the meal in the image and return a precise JSON response. ${languageInstruction}` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("AI returned an empty response.");
    
    return res.status(200).json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Analysis API Error:", error);
    return res.status(500).json({ error: 'Analysis Failed', details: error.message });
  }
}
