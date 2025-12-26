
import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const { prompt } = req.body;
  const apiKey = process.env.API_KEY;

  if (!apiKey) return res.status(500).json({ error: 'SERVER_KEY_MISSING' });

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-quality, professional, minimalist mascot icon for: ${prompt}. Vector style, sharp edges, isolated on a clean white background.` }]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });

    let imageUrl = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    return res.status(200).json({ imageUrl });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate mascot' });
  }
}
