
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
  maxDuration: 30,
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
    personalizedAdvice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of concise, bullet-point advice based on the analysis."
    },
    warnings: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          riskLevel: { 
            type: Type.STRING, 
            description: "One of: 'low', 'medium', 'high'" 
          },
          type: {
            type: Type.STRING,
            description: "Category: 'sugar', 'sodium', 'pregnancy', 'allergy', 'general'"
          }
        },
        required: ["text", "riskLevel", "type"]
      },
      description: "Critical warnings specific to the user persona."
    },
    scientificSource: {
      type: Type.STRING,
      description: "A mention of a general scientific guideline (e.g., 'Based on WHO guidelines' or 'AHA standards')."
    }
  },
  required: ["ingredients", "totalCalories", "healthScore", "macros", "summary", "personalizedAdvice", "warnings"]
};

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { image, profile } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'SYSTEM_FAULT: API key missing.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const persona = profile.persona || 'GENERAL';

    let personaContext = "";
    if (persona === 'PREGNANCY') {
      personaContext = "The user is PREGNANT. Prioritize Folic Acid, Iron, Vitamin D. Explicitly warn about: Unpasteurized cheese, high mercury fish, raw sprouts, undercooked meat, high caffeine.";
    } else if (persona === 'DIABETIC') {
      personaContext = "The user has DIABETES. Focus on Glycemic Load, complex carbs, and fiber. Warn about hidden sugars and high-GI ingredients.";
    } else if (persona === 'ATHLETE') {
      personaContext = "The user is an ATHLETE. Focus on Protein synthesis, electrolyte balance, and glycogen replenishment.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Deep clinical analysis. User Path: ${persona}. ${personaContext}
                  Return JSON conforming to schema. Provide 'personalizedAdvice' as an array of short strings.
                  Categorize each warning and assign a 'riskLevel' (low, medium, high).` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1
      }
    });

    const resultText = response.text;
    return res.status(200).json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return res.status(500).json({ error: 'Analysis Failed', details: error.message });
  }
}
