
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
      description: "A mention of a general scientific guideline."
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

  // Accessing the key inside the handler to ensure Vercel environment sync
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: API_KEY is missing from environment variables.");
    return res.status(500).json({ error: 'SYSTEM_FAULT: Diagnostic node authorization failed (Key Missing).' });
  }

  const { image, profile } = req.body;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const base64Data = image.includes(',') ? image.split(',')[1] : image;
    const persona = profile.persona || 'GENERAL';

    let personaContext = "";
    if (persona === 'PREGNANCY') {
      personaContext = "User: PREGNANT. Focus: Folic Acid, Iron, Vitamin D. Warning markers: Unpasteurized dairy, high mercury, caffeine limits.";
    } else if (persona === 'DIABETIC') {
      personaContext = "User: DIABETIC. Focus: Glycemic Load, fiber balance. Warning markers: Hidden sugars, refined carbs.";
    } else if (persona === 'ATHLETE') {
      personaContext = "User: ATHLETE. Focus: Protein synthesis, electrolytes, glycogen replenishment.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `Scientific metabolic analysis for ${persona} protocol. ${personaContext} Return precise JSON based on schema.` }
        ]
      },
      config: { 
        responseMimeType: "application/json", 
        responseSchema: mealAnalysisSchema,
        temperature: 0.1
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from AI engine.");
    
    return res.status(200).json(JSON.parse(resultText.trim()));
  } catch (error: any) {
    console.error("Gemini Analysis Failure:", error);
    return res.status(500).json({ 
      error: 'Analysis Node Offline', 
      details: error.message,
      suggestion: "Check API Key billing or Vercel Environment Variables."
    });
  }
}
