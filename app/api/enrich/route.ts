import { NextRequest, NextResponse } from 'next/server';

// IATA city code (first 3 chars of MARSHA) -> Country
// Comprehensive map covering APEC + Middle East + common markets
const IATA_COUNTRY: Record<string, string> = {
  // Australia
  SYD:'Australia',MEL:'Australia',BNE:'Australia',PER:'Australia',ADL:'Australia',
  CBR:'Australia',OOL:'Australia',TSV:'Australia',CNS:'Australia',HBA:'Australia',
  // New Zealand
  AKL:'New Zealand',WLG:'New Zealand',CHC:'New Zealand',ZQN:'New Zealand',
  // Japan
  TYO:'Japan',NRT:'Japan',HND:'Japan',OSA:'Japan',KIX:'Japan',NGO:'Japan',
  FUK:'Japan',SPK:'Japan',CTS:'Japan',OKA:'Japan',
  // South Korea
  SEL:'South Korea',ICN:'South Korea',GMP:'South Korea',PUS:'South Korea',
  // Singapore
  SIN:'Singapore',
  // Malaysia
  KUL:'Malaysia',PEN:'Malaysia',BKI:'Malaysia',
  // Thailand
  BKK:'Thailand',DMK:'Thailand',CNX:'Thailand',HKT:'Thailand',USM:'Thailand',
  // Indonesia
  JKT:'Indonesia',CGK:'Indonesia',DPS:'Indonesia',SUB:'Indonesia',
  // Philippines
  MNL:'Philippines',CEB:'Philippines',
  // Vietnam
  HAN:'Vietnam',SGN:'Vietnam',DAD:'Vietnam',
  // Taiwan
  TPE:'Taiwan',TSA:'Taiwan',KHH:'Taiwan',
  // Hong Kong
  HKG:'Hong Kong',
  // Macau
  MFM:'Macao',
  // India
  DEL:'India',BOM:'India',MAA:'India',BLR:'India',CCU:'India',HYD:'India',
  COK:'India',AMD:'India',PNQ:'India',GOI:'India',
  // Sri Lanka
  CMB:'Sri Lanka',
  // Bangladesh
  DAC:'Bangladesh',
  // Nepal
  KTM:'Nepal',
  // Maldives
  MLE:'Maldives',
  // Pakistan
  KHI:'Pakistan',LHE:'Pakistan',ISB:'Pakistan',
  // UAE
  DXB:'United Arab Emirates',AUH:'United Arab Emirates',SHJ:'United Arab Emirates',
  AAN:'United Arab Emirates',
  // Saudi Arabia
  RUH:'Saudi Arabia',JED:'Saudi Arabia',DMM:'Saudi Arabia',
  // Qatar
  DOH:'Qatar',
  // Kuwait
  KWI:'Kuwait',
  // Bahrain
  BAH:'Bahrain',
  // Oman
  MCT:'Oman',
  // Jordan
  AMM:'Jordan',
  // Turkey
  IST:'Turkey',ESB:'Turkey',ADB:'Turkey',ADA:'Turkey',SAW:'Turkey',
  // Egypt
  CAI:'Egypt',HRG:'Egypt',SSH:'Egypt',
  // Morocco
  CMN:'Morocco',RAK:'Morocco',
  // South Africa
  JNB:'South Africa',CPT:'South Africa',DUR:'South Africa',
  // Kenya
  NBO:'Kenya',
  // Tanzania
  DAR:'Tanzania',
  // Nigeria
  LOS:'Nigeria',
  // Ethiopia
  ADD:'Ethiopia',
  // Germany
  FRA:'Germany',MUC:'Germany',BER:'Germany',DUS:'Germany',HAM:'Germany',
  // UK
  LON:'United Kingdom',LHR:'United Kingdom',LGW:'United Kingdom',MAN:'United Kingdom',
  EDI:'United Kingdom',
  // France
  PAR:'France',CDG:'France',ORY:'France',NCE:'France',LYS:'France',
  // Italy
  ROM:'Italy',FCO:'Italy',MXP:'Italy',VCE:'Italy',NAP:'Italy',
  // Spain
  MAD:'Spain',BCN:'Spain',AGP:'Spain',
  // Netherlands
  AMS:'Netherlands',
  // Belgium
  BRU:'Belgium',
  // Switzerland
  ZRH:'Switzerland',GVA:'Switzerland',
  // Austria
  VIE:'Austria',
  // Portugal
  LIS:'Portugal',OPO:'Portugal',
  // Greece
  ATH:'Greece',HER:'Greece',
  // Czech Republic
  PRG:'Czech Republic',
  // Poland
  WAW:'Poland',KRK:'Poland',
  // Russia
  MOW:'Russia',SVO:'Russia',LED:'Russia',
  // USA
  NYC:'United States',JFK:'United States',LGA:'United States',EWR:'United States',
  LAX:'United States',CHI:'United States',ORD:'United States',MIA:'United States',
  SFO:'United States',ATL:'United States',DFW:'United States',DEN:'United States',
  SEA:'United States',BOS:'United States',LAS:'United States',PHX:'United States',
  MSY:'United States',SAN:'United States',PDX:'United States',AUS:'United States',
  HNL:'United States',OGG:'United States',KOA:'United States',LIH:'United States',
  // Canada
  YTO:'Canada',YYZ:'Canada',YVR:'Canada',YUL:'Canada',YYC:'Canada',
  // Mexico
  MEX:'Mexico',CUN:'Mexico',GDL:'Mexico',MTY:'Mexico',
  // Brazil
  GRU:'Brazil',GIG:'Brazil',BSB:'Brazil',SSA:'Brazil',
  // Argentina
  BUE:'Argentina',EZE:'Argentina',
  // Chile
  SCL:'Chile',
  // Colombia
  BOG:'Colombia',MDE:'Colombia',
  // Peru
  LIM:'Peru',
  // Panama
  PTY:'Panama',
  // Costa Rica
  SJO:'Costa Rica',
};

const BV_PASSKEY = 'canCX9lvC812oa4Y6HYf4gmWK5uszkZCKThrdtYkZqcYE';
const BV_DISPLAY = '14883-en_us';

async function getBVData(marsha: string): Promise<{ name: string | null }> {
  try {
    const url = `https://api.bazaarvoice.com/data/products.json?passkey=${BV_PASSKEY}&apiversion=5.5&displaycode=${BV_DISPLAY}&filter=id%3Aeq%3A${marsha.toLowerCase()}&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    const name = data?.Results?.[0]?.Name;
    return { name: (name && name.toUpperCase() !== marsha.toUpperCase()) ? name : null };
  } catch {
    return { name: null };
  }
}

function getCountryFromMarsha(marsha: string): string {
  const iata = marsha.substring(0, 3).toUpperCase();
  return IATA_COUNTRY[iata] || 'Unknown';
}

export async function POST(req: NextRequest) {
  const { hotels } = await req.json();

  const results = await Promise.all(
    hotels.map(async (h: { marsha: string; level: string }) => {
      // Get hotel name from BazaarVoice
      const { name: bvName } = await getBVData(h.marsha);
      
      // Get country from IATA map (instant, no API call)
      const country = getCountryFromMarsha(h.marsha);

      return {
        marsha: h.marsha,
        name: bvName || h.marsha,
        country,
        url: `https://www.marriott.com/${h.marsha.toLowerCase()}`,
        level: h.level,
      };
    })
  );

  return NextResponse.json({ results });
}
