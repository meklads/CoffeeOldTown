
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 60, // رفع الحد الأقصى للمدة
};

const mealAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    ingredients: { 
      type: Type.ARRAY, 
      items: { 
        type: Type.OBJECT, 
        properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } }, 
        required: ["name", "calories"] 
      } 
    },
    totalCalories: { type: Type.NUMBER },
    healthScore: { type: Type.NUMBER },
    macros: { 
      type: Type.OBJECT, 
      properties: { protein: { type: Type.NUMBER }, carbs: { type: Type.NUMBER }, fat: { type: Type.NUMBER } }, 
      required: ["protein", "carbs", "fat"] 
    },
    summary: { type: Type.STRING },
    personalizedAdvice: { type: Type.STRING }
  },
  required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice"]
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).end();
  const { image, profile, lang } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Quick bio-scan of this meal for a ${profile?.persona || 'General'} user. Return JSON only. Language: ${lang === 'ar' ? 'Arabic' : 'English'}.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1, // أسرع استجابة ممكنة
        thinkingConfig: { thinkingBudget: 0 } // منع التأخير في التفكير
      }
    });

    const resultText = response.text?.trim();
    if (!resultText) throw new Error("Empty AI Response");
    
    return res.status(200).json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Critical Scanner Error:", error);
    return res.status(500).json({ error: 'ANALYSIS_FAILED', details: error.message });
  }
}
