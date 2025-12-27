
import { GoogleGenAI, Type } from "@google/genai";

const dayPlanSchema = {
  type: Type.OBJECT,
  properties: {
    breakfast: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "calories", "protein", "description"]
    },
    lunch: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "calories", "protein", "description"]
    },
    dinner: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "calories", "protein", "description"]
    },
    snack: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        calories: { type: Type.STRING },
        protein: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ["name", "calories", "protein", "description"]
    },
    totalCalories: { type: Type.STRING },
    advice: { type: Type.STRING }
  },
  required: ["breakfast", "lunch", "dinner", "snack", "totalCalories", "advice"]
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { request, lang, feedback } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'SERVER_KEY_MISSING' });

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const persona = request.persona || 'GENERAL';
    const goal = request.goal;
    const language = lang === 'ar' ? 'Arabic (العربية)' : 'English';

    const prompt = `Act as a World-Class Metabolic Scientist and Clinical Nutritionist.
    Goal: ${goal}
    User Bio-Persona: ${persona}
    User Feedback History: ${JSON.stringify(feedback || [])}
    Language: ${language}

    TASK: Synthesize a 1-day precision metabolic blueprint. 
    The meals must be scientifically selected for the specific goal:
    - If Focus: High Omega-3s, Choline, and stable glucose.
    - If Immunity: High Vitamin C, Zinc, Quercetin.
    - If Recovery: High Branched-Chain Amino Acids (BCAAs) and anti-inflammatory substrates.

    Instructions:
    1. Provide exact calorie/protein estimates based on scientific averages.
    2. Description must explain the biological "Why" for this specific user persona.
    3. Return strictly valid JSON following the schema.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // استخدام نسخة Pro لأعلى دقة في التخطيط المعقد
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: dayPlanSchema,
        temperature: 0.2 // درجة حرارة منخفضة لضمان الثبات العلمي
      }
    });

    const text = response.text;
    if (!text) throw new Error("EMPTY_AI_RESPONSE");
    
    return res.status(200).json(JSON.parse(text.trim()));
  } catch (error: any) {
    console.error("Plan Generation Error:", error);
    return res.status(500).json({ error: 'Failed to generate plan', details: error.message });
  }
}
