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
  } catch { return null; }
}

export async function POST(req: NextRequest) {
  const { hotels } = await req.json();

  // Step 1: BazaarVoice names in parallel
  const withBV = await Promise.all(
    hotels.map(async (h: { marsha: string; level: string }) => {
      const bvName = await getBVName(h.marsha);
      return { ...h, bvName };
    })
  );

  // Step 2: Claude for ALL hotels - name fallback + country in one call
  // Return format: array with marsha, name, country
  const hotelLines = withBV.map((h: { marsha: string; bvName: string | null }) =>
    h.bvName ? `${h.marsha}: ${h.bvName}` : h.marsha
  ).join('\n');

  const prompt = `For each Marriott MARSHA code below, provide hotel name and country.
MARSHA codes where the name is already known are shown as "CODE: Name".
For unknown ones, derive name from the IATA city code (first 3 chars).

Return a JSON array ONLY, each object: { "marsha": "XXXXX", "name": "Full Hotel Name", "country": "Country Name" }
Use UPPERCASE for marsha values matching exactly the input codes.
No markdown, no explanation.

Hotels:
${hotelLines}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = (message.content[0] as { type: string; text: string }).text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed: Array<{ marsha: string; name: string; country: string }> = JSON.parse(clean);

    // Build lookup by uppercase marsha
    const lookup: Record<string, { name: string; country: string }> = {};
    for (const p of parsed) {
      lookup[p.marsha.toUpperCase()] = { name: p.name, country: p.country };
    }

    const results = withBV.map((h: { marsha: string; level: string; bvName: string | null }) => {
      const key = h.marsha.toUpperCase();
      const ai = lookup[key];
      return {
        marsha: h.marsha,
        name: h.bvName || ai?.name || h.marsha,
        country: ai?.country || 'Unknown',
        url: `https://www.marriott.com/${h.marsha.toLowerCase()}`,
        level: h.level,
      };
    });

    return NextResponse.json({ results });
  } catch (e) {
    const err = e instanceof Error ? e.message : String(e);
    console.error('Anthropic error:', err);
    const results = withBV.map((h: { marsha: string; level: string; bvName: string | null }) => ({
      marsha: h.marsha,
      name: h.bvName || h.marsha,
      country: 'Unknown',
      url: `https://www.marriott.com/${h.marsha.toLowerCase()}`,
      level: h.level,
    }));
    return NextResponse.json({ results, error: err });
  }
}
