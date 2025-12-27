// /pages/api/analyze-meal.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp'; // مكتبة لمعالجة الصور

interface AnalyzeMealRequest {
  base64Image: string;
  profile?: any;
  lang?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { base64Image, profile, lang }: AnalyzeMealRequest = req.body;

    if (!base64Image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // تحويل Base64 إلى Buffer
    const matches = base64Image.match(/^data:image\/\w+;base64,(.+)$/);
    const data = matches ? matches[1] : base64Image;
    const imageBuffer = Buffer.from(data, 'base64');

    // استخدام sharp لمعرفة أبعاد الصورة
    const metadata = await sharp(imageBuffer).metadata();

    // التحقق من وضوح الصورة / الحجم
    if (!metadata.width || !metadata.height || metadata.width < 200 || metadata.height < 200) {
      return res.status(400).json({
        error: 'Image too small or unclear. Please provide a clearer photo of the meal.'
      });
    }

    // TODO: إرسال الصورة إلى خدمة التحليل (مثلاً Google AI أو أي backend آخر)
    // هذا مثال وهمي للرد
    const fakeResponse = {
      ingredients: [{ name: 'Chicken', calories: 250 }],
      totalCalories: 250,
      healthScore: 80,
      macros: { protein: 30, carbs: 10, fat: 15 },
      summary: 'Healthy meal',
      personalizedAdvice: 'Add more veggies'
    };

    res.status(200).json(fakeResponse);

  } catch (error: any) {
    console.error('Analyze Meal Error:', error);
    res.status(500).json({ error: 'Failed to analyze the meal' });
  }
}
