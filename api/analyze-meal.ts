
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 30, // Increased timeout for deep analysis
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Increased for high-quality food photography
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
  // CORS configuration for Vercel
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, profile } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'SYSTEM_FAULT: API key missing in environment nodes.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;

    // Use Gemini 3 Flash for the best speed/quality ratio on Vercel
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Perform a deep clinical analysis of this meal. 
                  User Context: ${JSON.stringify(profile)}. 
                  Identify all visible and hidden ingredients. 
                  Calculate precise metabolic values. 
                  Return JSON conforming to the defined schema.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("EMPTY_DIAGNOSTIC_SIGNAL");

    return res.status(200).json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Metabolic Analysis Error:", error);
    return res.status(500).json({ 
      error: 'Analysis Sequence Failed', 
      details: error.message 
    });
  }
}
