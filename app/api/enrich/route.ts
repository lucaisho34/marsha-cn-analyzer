import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BV_URL = 'https://api.bazaarvoice.com/data/products.json';
const BV_PASSKEY = 'canCX9lvC812oa4Y6HYf4gmWK5uszkZCKThrdtYkZqcYE';
const BV_DISPLAY = '14883-en_us';

async function fetchHotelFromBV(marsha: string): Promise<{ name: string; url: string }> {
  try {
    const url = `${BV_URL}?passkey=${BV_PASSKEY}&apiversion=5.5&displaycode=${BV_DISPLAY}&filter=id%3Aeq%3A${marsha.toLowerCase()}&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    const result = data?.Results?.[0];
    if (result?.Name && result.Name !== marsha) {
      return {
        name: result.Name,
        url: `https://www.marriott.com/${marsha.toLowerCase()}`,
      };
    }
  } catch { /* fall through */ }
  return { name: marsha, url: `https://www.marriott.com/${marsha.toLowerCase()}` };
}

export async function POST(req: NextRequest) {
  const { hotels } = await req.json();

  // Step 1: Fetch names from BazaarVoice in parallel
  const withNames = await Promise.all(
    hotels.map(async (h: { marsha: string; level: string }) => {
      const bv = await fetchHotelFromBV(h.marsha);
      return { ...h, name: bv.name, url: bv.url };
    })
  );

  // Step 2: Use Claude AI ONLY to determine country from hotel name (fast, accurate)
  const needsCountry = withNames.filter(h => h.name !== h.marsha);
  
  let countryMap: Record<string, string> = {};
  if (needsCountry.length > 0) {
    const list = needsCountry.map(h => `${h.marsha}: ${h.name}`).join('\n');
    const prompt = `For each Marriott hotel below, return ONLY the country name in English where the hotel is located.
Return a JSON object mapping MARSHA code to country name. Example: {"AANFP": "United Arab Emirates"}
Return ONLY valid JSON, no markdown.

Hotels:
${list}`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = (message.content[0] as { type: string; text: string }).text;
      const clean = text.replace(/```json|```/g, '').trim();
      countryMap = JSON.parse(clean);
    } catch { /* fall through */ }
  }

  const results = withNames.map(h => ({
    marsha: h.marsha,
    name: h.name,
    country: countryMap[h.marsha] || 'Unknown',
    url: h.url,
    level: h.level,
  }));

  return NextResponse.json({ results });
}
