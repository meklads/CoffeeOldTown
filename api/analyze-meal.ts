// /pages/api/analyze-meal.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI, Type } from '@google/genai';
import { UserHealthProfile, MealAnalysisResult } from '../../types.ts';

// تهيئة Google AI على Server-side فقط
const getAI = () => {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error('MISSING_KEY');
  }
  return new GoogleGenAI({ apiKey: key });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Image, profile, lang } = req.body as { base64Image: string; profile?: UserHealthProfile; lang?: string };

    if (!base64Image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const ai = getAI();
    const base64Data = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const persona = profile?.persona || 'GENERAL';
    const languageInstruction = lang === 'ar'
      ? 'يجب أن تكون الاستجابة باللغة العربية الفصحى فقط.'
      : 'Response must be entirely in English.';

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
            required: ['name', 'calories']
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
          required: ['protein', 'carbs', 'fat']
        },
        summary: { type: Type.STRING },
        personalizedAdvice: { type: Type.STRING }
      },
      required: ['ingredients', 'totalCalories', 'healthScore', 'macros', 'summary', 'personalizedAdvice']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: 'image/jpeg' } },
          { text: `تحليل دقيق لهذا الطبق وفق بروتوكول: ${persona}. ${languageInstruction} أعد النتيجة بتنسيق JSON فقط.` }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: mealAnalysisSchema,
        temperature: 0.1
      }
    });

    const resultText = response.text;
    if (!resultText) return res.status(500).json({ error: 'Failed to analyze meal' });

    const result: MealAnalysisResult = JSON.parse(resultText.trim());
    res.status(200).json(result);

  } catch (error: any) {
    console.error('Analyze Meal Error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze meal' });
  }
}
