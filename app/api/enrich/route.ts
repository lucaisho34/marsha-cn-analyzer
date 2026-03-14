import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { hotels } = await req.json();

  const results = await Promise.all(
    hotels.map(async (h: { marsha: string; level: string }) => {
      try {
        const marshaLower = h.marsha.toLowerCase();
        const res = await fetch(`https://www.marriott.com/${marshaLower}`, {
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; MarshaCNAnalyzer/1.0)',
            'Accept': 'text/html,application/xhtml+xml',
          },
          signal: AbortSignal.timeout(8000),
        });

        const html = await res.text();
        const finalUrl = res.url;

        // Extract from JSON-LD structured data
        const ldMatch = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
        let name = h.marsha;
        let country = 'Unknown';

        if (ldMatch) {
          const nameMatch = ldMatch[1].match(/"name"\s*:\s*"([^"]+)"/);
          const countryMatch = ldMatch[1].match(/"addressCountry"\s*:\s*"([^"]+)"/);
          if (nameMatch) name = nameMatch[1];
          if (countryMatch) country = countryMatch[1];
        }

        // Fallback: extract from page title
        if (name === h.marsha) {
          const titleMatch = html.match(/<title>([^<|]+)/i);
          if (titleMatch) name = titleMatch[1].trim();
        }

        return {
          marsha: h.marsha,
          name,
          country,
          url: finalUrl || `https://www.marriott.com/${marshaLower}`,
          level: h.level,
        };
      } catch {
        return {
          marsha: h.marsha,
          name: h.marsha,
          country: 'Unknown',
          url: `https://www.marriott.com/${h.marsha.toLowerCase()}`,
          level: h.level,
        };
      }
    })
  );

  return NextResponse.json({ results });
}
