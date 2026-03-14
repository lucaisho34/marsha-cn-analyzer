import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BV_PASSKEY = 'canCX9lvC812oa4Y6HYf4gmWK5uszkZCKThrdtYkZqcYE';
const BV_DISPLAY = '14883-en_us';

async function getBVName(marsha: string): Promise<string | null> {
  try {
    const url = `https://api.bazaarvoice.com/data/products.json?passkey=${BV_PASSKEY}&apiversion=5.5&displaycode=${BV_DISPLAY}&filter=id%3Aeq%3A${marsha.toLowerCase()}&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    const name = data?.Results?.[0]?.Name;
    return (name && name.toUpperCase() !== marsha.toUpperCase()) ? name : null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const { hotels } = await req.json();

  // Step 1: Try BazaarVoice for hotel names (fast, accurate)
  const withBV = await Promise.all(
    hotels.map(async (h: { marsha: string; level: string }) => {
      const bvName = await getBVName(h.marsha);
      return { ...h, bvName };
    })
  );

  // Step 2: Single Claude call for ALL hotels - name (fallback) + country
  const marshaList = withBV.map((h: { marsha: string; bvName: string | null }) =>
    h.bvName
      ? `${h.marsha} (known name: "${h.bvName}")`
      : h.marsha
  ).join(', ');

  const prompt = `You are a Marriott hotel database. For each MARSHA code, return a JSON array with objects: "marsha", "name", "country".

Rules:
- "name": Use the provided known name if given. Otherwise derive from MARSHA code (first 3 chars = IATA city code).
- "country": Country in English where the hotel is located. Use the hotel name and city to determine this accurately.
- "url": https://www.marriott.com/ + lowercase MARSHA code
- APEC region only (Asia Pacific excluding mainland China). Non-APEC hotels should still get correct country.
- Return ONLY a valid JSON array, no markdown.

Hotels: ${marshaList}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (message.content[0] as { type: string; text: string }).text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed: Array<{ marsha: string; name: string; country: string }> = JSON.parse(clean);

    const results = parsed.map(p => {
      const orig = hotels.find((h: { marsha: string; level: string }) => h.marsha === p.marsha) || {};
      const bvEntry = withBV.find((h: { marsha: string; bvName: string | null }) => h.marsha === p.marsha);
      return {
        marsha: p.marsha || orig.marsha,
        name: bvEntry?.bvName || p.name || orig.marsha,
        country: p.country || 'Unknown',
        url: `https://www.marriott.com/${(p.marsha || orig.marsha).toLowerCase()}`,
        level: orig.level || 'Unknown',
      };
    });

    return NextResponse.json({ results });
  } catch (e) {
    // Full fallback
    const results = withBV.map((h: { marsha: string; level: string; bvName: string | null }) => ({
      marsha: h.marsha,
      name: h.bvName || h.marsha,
      country: 'Unknown',
      url: `https://www.marriott.com/${h.marsha.toLowerCase()}`,
      level: h.level,
    }));
    return NextResponse.json({ results });
  }
}
