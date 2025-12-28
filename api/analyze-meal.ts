
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 10, // الحد الأقصى لفيرسال
};

const mealAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } }, required: ["name", "calories"] } },
    totalCalories: { type: Type.NUMBER },
    healthScore: { type: Type.NUMBER },
    macros: { type: Type.OBJECT, properties: { protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER } }, required: ["protein", "carbs", "fat"] },
    summary: { type: Type.STRING },
    personalizedAdvice: { type: Type.STRING }
  },
  required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice"]
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();

  const { image, profile, lang } = req.body;
  const apiKey = process.env.API_KEY;

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey! });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    
    // برومبت فائق السرعة ومختصر جداً لتقليل وقت المعالجة
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Quick Bio-Scan. Persona: ${profile?.persona}. Lang: ${lang}. JSON ONLY.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0, // أسرع رد ممكن
        thinkingConfig: { thinkingBudget: 0 } // إلغاء التفكير لضمان السرعة
      }
    });

    return res.status(200).json(JSON.parse(response.text.trim()));
  } catch (error: any) {
    return res.status(500).json({ error: 'TIMEOUT_RISK' });
  }
}
