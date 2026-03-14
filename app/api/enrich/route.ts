import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { hotels } = await req.json();
  const marshaList = hotels.map((h: { marsha: string }) => h.marsha).join(', ');
  const prompt = `You are a Marriott hotel database expert. For each MARSHA code below, return a JSON array with objects having exactly these keys: "marsha", "name", "country", "url".

Rules:
- "name": official Marriott hotel name
- "country": country name in English
- "url": hotel page URL on marriott.com
- Return ONLY a valid JSON array, no markdown, no explanation.

MARSHA codes: ${marshaList}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = (message.content[0] as { type: string; text: string }).text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    const results = parsed.map((p: { marsha: string; name: string; country: string; url: string }) => {
      const orig = hotels.find((h: { marsha: string; level: string }) => h.marsha === p.marsha) || {};
      return { marsha: p.marsha || orig.marsha, name: p.name || orig.marsha, country: p.country || 'Unknown', url: p.url || '', level: orig.level || 'Unknown' };
    });
    return NextResponse.json({ results });
  } catch {
    const results = hotels.map((h: { marsha: string; level: string }) => ({ marsha: h.marsha, name: h.marsha, country: 'Unknown', url: '', level: h.level }));
    return NextResponse.json({ results });
  }
}
