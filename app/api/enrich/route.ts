import { NextRequest, NextResponse } from 'next/server';

// Comprehensive IATA city code (first 3 chars of MARSHA) -> Country
const IATA_COUNTRY: Record<string, string> = {
  // ── AUSTRALIA ──
  SYD:'Australia',MEL:'Australia',BNE:'Australia',PER:'Australia',ADL:'Australia',
  CBR:'Australia',OOL:'Australia',TSV:'Australia',CNS:'Australia',HBA:'Australia',
  MKY:'Australia',HTI:'Australia',DRW:'Australia',NTL:'Australia',AVV:'Australia',
  MQL:'Australia',ABX:'Australia',ARM:'Australia',
  // ── NEW ZEALAND ──
  AKL:'New Zealand',WLG:'New Zealand',CHC:'New Zealand',ZQN:'New Zealand',
  DUD:'New Zealand',NSN:'New Zealand',PMR:'New Zealand',ROT:'New Zealand',
  // ── JAPAN ──
  TYO:'Japan',NRT:'Japan',HND:'Japan',OSA:'Japan',KIX:'Japan',NGO:'Japan',
  FUK:'Japan',SPK:'Japan',CTS:'Japan',OKA:'Japan',HIJ:'Japan',KOJ:'Japan',
  KMJ:'Japan',SDJ:'Japan',TAK:'Japan',TOY:'Japan',KMQ:'Japan',MYJ:'Japan',
  UKB:'Japan',ITM:'Japan',
  // ── SOUTH KOREA ──
  SEL:'South Korea',ICN:'South Korea',GMP:'South Korea',PUS:'South Korea',
  CJU:'South Korea',TAE:'South Korea',CJJ:'South Korea',KWJ:'South Korea',
  // ── CHINA (mainland - kept for reference) ──
  PEK:'China',PKX:'China',SHA:'China',PVG:'China',CAN:'China',SZX:'China',
  CTU:'China',CKG:'China',KMG:'China',XIY:'China',WUH:'China',CSX:'China',
  HGH:'China',NKG:'China',XMN:'China',TAO:'China',HAK:'China',SYX:'China',
  DLC:'China',SHE:'China',TNA:'China',NGB:'China',CGO:'China',TXN:'China',
  LJG:'China',GYS:'China',YIW:'China',JHG:'China',
  // ── HONG KONG ──
  HKG:'Hong Kong',
  // ── MACAO ──
  MFM:'Macao',
  // ── TAIWAN ──
  TPE:'Taiwan',TSA:'Taiwan',KHH:'Taiwan',RMQ:'Taiwan',TNN:'Taiwan',TTT:'Taiwan',
  // ── SINGAPORE ──
  SIN:'Singapore',
  // ── MALAYSIA ──
  KUL:'Malaysia',PEN:'Malaysia',BKI:'Malaysia',KCH:'Malaysia',LGK:'Malaysia',
  JHB:'Malaysia',MYY:'Malaysia',BTU:'Malaysia',SDK:'Malaysia',TWU:'Malaysia',
  // ── THAILAND ──
  BKK:'Thailand',DMK:'Thailand',CNX:'Thailand',HKT:'Thailand',USM:'Thailand',
  CEI:'Thailand',URT:'Thailand',UBP:'Thailand',HDY:'Thailand',NAW:'Thailand',
  KBV:'Thailand',PHS:'Thailand',
  // ── VIETNAM ──
  HAN:'Vietnam',SGN:'Vietnam',DAD:'Vietnam',HPH:'Vietnam',HUI:'Vietnam',
  VCA:'Vietnam',PQC:'Vietnam',CXR:'Vietnam',UIH:'Vietnam',VDH:'Vietnam',
  // ── INDONESIA ──
  JKT:'Indonesia',CGK:'Indonesia',DPS:'Indonesia',SUB:'Indonesia',MES:'Indonesia',
  UPG:'Indonesia',PLM:'Indonesia',BPN:'Indonesia',LOP:'Indonesia',SRG:'Indonesia',
  MDC:'Indonesia',AMQ:'Indonesia',DJJ:'Indonesia',
  // ── PHILIPPINES ──
  MNL:'Philippines',CEB:'Philippines',DVO:'Philippines',ILO:'Philippines',
  KLO:'Philippines',BCD:'Philippines',PPS:'Philippines',
  // ── CAMBODIA ──
  PNH:'Cambodia',REP:'Cambodia',
  // ── LAOS ──
  VTE:'Laos',
  // ── MYANMAR ──
  RGN:'Myanmar',MDL:'Myanmar',
  // ── SRI LANKA ──
  CMB:'Sri Lanka',
  // ── MALDIVES ──
  MLE:'Maldives',
  // ── INDIA ──
  DEL:'India',BOM:'India',MAA:'India',BLR:'India',CCU:'India',HYD:'India',
  COK:'India',AMD:'India',PNQ:'India',GOI:'India',IXC:'India',LKO:'India',
  JAI:'India',PAT:'India',BBI:'India',GAU:'India',STV:'India',IXB:'India',
  ATQ:'India',AGR:'India',UDR:'India',JDH:'India',VNS:'India',IXA:'India',
  IDR:'India',VGA:'India',BHO:'India',NAG:'India',RPR:'India',
  // ── NEPAL ──
  KTM:'Nepal',
  // ── BANGLADESH ──
  DAC:'Bangladesh',
  // ── PAKISTAN ──
  KHI:'Pakistan',LHE:'Pakistan',ISB:'Pakistan',PEW:'Pakistan',
  // ── UAE ──
  DXB:'United Arab Emirates',AUH:'United Arab Emirates',SHJ:'United Arab Emirates',
  AAN:'United Arab Emirates',FJR:'United Arab Emirates',RKT:'United Arab Emirates',
  // ── SAUDI ARABIA ──
  RUH:'Saudi Arabia',JED:'Saudi Arabia',DMM:'Saudi Arabia',MED:'Saudi Arabia',
  TIF:'Saudi Arabia',ABT:'Saudi Arabia',ELQ:'Saudi Arabia',TUU:'Saudi Arabia',
  // ── QATAR ──
  DOH:'Qatar',
  // ── KUWAIT ──
  KWI:'Kuwait',
  // ── BAHRAIN ──
  BAH:'Bahrain',
  // ── OMAN ──
  MCT:'Oman',SLL:'Oman',MSH:'Oman',SUR:'Oman',
  // ── JORDAN ──
  AMM:'Jordan',AQJ:'Jordan',
  // ── LEBANON ──
  BEY:'Lebanon',
  // ── ISRAEL ──
  TLV:'Israel',
  // ── TURKEY ──
  IST:'Turkey',ESB:'Turkey',ADB:'Turkey',ADA:'Turkey',SAW:'Turkey',
  AYT:'Turkey',BJV:'Turkey',DLM:'Turkey',TZX:'Turkey',GZT:'Turkey',
  KYA:'Turkey',SZF:'Turkey',MLX:'Turkey',VAS:'Turkey',ERZ:'Turkey',
  // ── EGYPT ──
  CAI:'Egypt',HRG:'Egypt',SSH:'Egypt',LXR:'Egypt',HBE:'Egypt',
  // ── MOROCCO ──
  CMN:'Morocco',RAK:'Morocco',AGA:'Morocco',FEZ:'Morocco',TNG:'Morocco',
  // ── SOUTH AFRICA ──
  JNB:'South Africa',CPT:'South Africa',DUR:'South Africa',PLZ:'South Africa',
  // ── KENYA ──
  NBO:'Kenya',MBA:'Kenya',
  // ── TANZANIA ──
  DAR:'Tanzania',ZNZ:'Tanzania',
  // ── NIGERIA ──
  LOS:'Nigeria',ABV:'Nigeria',
  // ── ETHIOPIA ──
  ADD:'Ethiopia',
  // ── GHANA ──
  ACC:'Ghana',
  // ── SEYCHELLES ──
  SEZ:'Seychelles',
  // ── MAURITIUS ──
  MRU:'Mauritius',
  // ── MONGOLIA ──
  ULN:'Mongolia',AAT:'Mongolia',
  // ── KAZAKHSTAN ──
  ALA:'Kazakhstan',TSE:'Kazakhstan',
  // ── UZBEKISTAN ──
  TAS:'Uzbekistan',
  // ── AZERBAIJAN ──
  GYD:'Azerbaijan',BAK:'Azerbaijan',
  // ── GEORGIA (country) ──
  TBS:'Georgia',
  // ── ARMENIA ──
  EVN:'Armenia',
  // ── GERMANY ──
  FRA:'Germany',MUC:'Germany',BER:'Germany',DUS:'Germany',HAM:'Germany',
  STR:'Germany',CGN:'Germany',LEJ:'Germany',NUE:'Germany',
  // ── UK ──
  LON:'United Kingdom',LHR:'United Kingdom',LGW:'United Kingdom',MAN:'United Kingdom',
  EDI:'United Kingdom',BHX:'United Kingdom',LBA:'United Kingdom',GLA:'United Kingdom',
  // ── FRANCE ──
  PAR:'France',CDG:'France',ORY:'France',NCE:'France',LYS:'France',MRS:'France',
  TLS:'France',BOD:'France',NTE:'France',
  // ── ITALY ──
  ROM:'Italy',FCO:'Italy',MXP:'Italy',VCE:'Italy',NAP:'Italy',FLR:'Italy',
  BLQ:'Italy',PSA:'Italy',CTA:'Italy',PMO:'Italy',
  // ── SPAIN ──
  MAD:'Spain',BCN:'Spain',AGP:'Spain',PMI:'Spain',IBZ:'Spain',SVQ:'Spain',
  // ── NETHERLANDS ──
  AMS:'Netherlands',
  // ── BELGIUM ──
  BRU:'Belgium',
  // ── SWITZERLAND ──
  ZRH:'Switzerland',GVA:'Switzerland',BSL:'Switzerland',
  // ── AUSTRIA ──
  VIE:'Austria',SZG:'Austria',INN:'Austria',
  // ── PORTUGAL ──
  LIS:'Portugal',OPO:'Portugal',FAO:'Portugal',
  // ── GREECE ──
  ATH:'Greece',HER:'Greece',RHO:'Greece',JMK:'Greece',CFU:'Greece',
  // ── CZECH REPUBLIC ──
  PRG:'Czech Republic',
  // ── POLAND ──
  WAW:'Poland',KRK:'Poland',
  // ── HUNGARY ──
  BUD:'Hungary',
  // ── ROMANIA ──
  OTP:'Romania',
  // ── CROATIA ──
  ZAG:'Croatia',DBV:'Croatia',SPU:'Croatia',
  // ── RUSSIA ──
  MOW:'Russia',SVO:'Russia',LED:'Russia',SVX:'Russia',OVB:'Russia',
  // ── USA ──
  NYC:'United States',JFK:'United States',LGA:'United States',EWR:'United States',
  LAX:'United States',CHI:'United States',ORD:'United States',MIA:'United States',
  SFO:'United States',ATL:'United States',DFW:'United States',DEN:'United States',
  SEA:'United States',BOS:'United States',LAS:'United States',PHX:'United States',
  MSY:'United States',SAN:'United States',PDX:'United States',AUS:'United States',
  HNL:'United States',OGG:'United States',KOA:'United States',LIH:'United States',
  IAD:'United States',IAH:'United States',CLT:'United States',DTW:'United States',
  MSP:'United States',BWI:'United States',SLC:'United States',TPA:'United States',
  MCO:'United States',PHL:'United States',STL:'United States',MCI:'United States',
  RDU:'United States',PIT:'United States',SJC:'United States',OAK:'United States',
  SMF:'United States',BNA:'United States',MKE:'United States',RSW:'United States',
  CHS:'United States',SAV:'United States',
  // ── CANADA ──
  YTO:'Canada',YYZ:'Canada',YVR:'Canada',YUL:'Canada',YYC:'Canada',
  YEG:'Canada',YOW:'Canada',YHZ:'Canada',YWG:'Canada',
  // ── MEXICO ──
  MEX:'Mexico',CUN:'Mexico',GDL:'Mexico',MTY:'Mexico',SJD:'Mexico',
  PVR:'Mexico',ZIH:'Mexico',OAX:'Mexico',
  // ── BRAZIL ──
  GRU:'Brazil',GIG:'Brazil',BSB:'Brazil',SSA:'Brazil',FOR:'Brazil',
  REC:'Brazil',POA:'Brazil',BEL:'Brazil',CWB:'Brazil',BHZ:'Brazil',
  // ── ARGENTINA ──
  BUE:'Argentina',EZE:'Argentina',COR:'Argentina',MDZ:'Argentina',
  // ── CHILE ──
  SCL:'Chile',
  // ── COLOMBIA ──
  BOG:'Colombia',MDE:'Colombia',CLO:'Colombia',CTG:'Colombia',
  // ── PERU ──
  LIM:'Peru',
  // ── PANAMA ──
  PTY:'Panama',
  // ── COSTA RICA ──
  SJO:'Costa Rica',
  // ── DOMINICAN REPUBLIC ──
  SDQ:'Dominican Republic',PUJ:'Dominican Republic',
  // ── BAHAMAS ──
  NAS:'Bahamas',
  // ── JAMAICA ──
  KIN:'Jamaica',MBJ:'Jamaica',
  // ── TRINIDAD & TOBAGO ──
  POS:'Trinidad and Tobago',
};

const BV_PASSKEY = 'canCX9lvC812oa4Y6HYf4gmWK5uszkZCKThrdtYkZqcYE';
const BV_DISPLAY = '14883-en_us';

// Source 1: BazaarVoice — best hotel names
async function getBVName(marsha: string): Promise<string | null> {
  try {
    const url = `https://api.bazaarvoice.com/data/products.json?passkey=${BV_PASSKEY}&apiversion=5.5&displaycode=${BV_DISPLAY}&filter=id%3Aeq%3A${marsha.toLowerCase()}&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    const name = data?.Results?.[0]?.Name;
    return (name && name.toUpperCase() !== marsha.toUpperCase()) ? name : null;
  } catch { return null; }
}

// Source 2: Marriott URL slug — parse hotel name from redirect slug
// e.g. https://marriott.com/en-us/hotels/akljw-jw-marriott-auckland/overview/
//  -> "Jw Marriott Auckland" -> "JW Marriott Auckland"
async function getMarriottSlugName(marsha: string): Promise<{ name: string | null; slugCountry: string | null }> {
  try {
    const res = await fetch(`https://www.marriott.com/${marsha.toLowerCase()}`, {
      redirect: 'follow',
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MarshaCNAnalyzer/1.0)', 'Accept': 'text/html' }
    });
    if (!res.ok) return { name: null, slugCountry: null };
    
    const finalUrl = res.url;
    // Extract slug: /en-us/hotels/XXXXX-hotel-name-here/overview/
    const slugMatch = finalUrl.match(/\/hotels\/[a-z0-9]+-(.+?)(?:\/|$)/);
    if (!slugMatch) return { name: null, slugCountry: null };
    
    // Convert slug to title: "jw-marriott-auckland" -> "JW Marriott Auckland"
    const name = slugMatch[1]
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/\bJw\b/g, 'JW')
      .replace(/\bAc\b/g, 'AC')
      .replace(/\bW \b/gi, 'W ')
      .replace(/\bAnd\b/g, 'and')
      .replace(/\bOf\b/g, 'of')
      .replace(/\bThe\b/g, 'the')
      .replace(/^the /i, w => w.toUpperCase());
    
    // Also try JSON-LD from the page for country
    const html = await res.text().catch(() => '');
    const countryMatch = html.match(/"addressCountry"\s*:\s*"([^"]+)"/);
    
    return { name: name.trim() || null, slugCountry: countryMatch?.[1] || null };
  } catch { return { name: null, slugCountry: null }; }
}

function getCountryFromIATA(marsha: string): string {
  const iata = marsha.substring(0, 3).toUpperCase();
  return IATA_COUNTRY[iata] || 'Unknown';
}

export async function POST(req: NextRequest) {
  const { hotels } = await req.json();

  const results = await Promise.all(
    hotels.map(async (h: { marsha: string; level: string }) => {
      // Try BazaarVoice first (fastest, most accurate names)
      const bvName = await getBVName(h.marsha);
      
      // Country from IATA map
      let country = getCountryFromIATA(h.marsha);
      let finalName = bvName;
      
      // If BV name missing OR country unknown, try Marriott slug
      if (!finalName || country === 'Unknown') {
        const { name: slugName, slugCountry } = await getMarriottSlugName(h.marsha);
        if (!finalName && slugName) finalName = slugName;
        if (country === 'Unknown' && slugCountry) country = slugCountry;
      }

      return {
        marsha: h.marsha,
        name: finalName || h.marsha,
        country,
        url: `https://www.marriott.com/${h.marsha.toLowerCase()}`,
        level: h.level,
      };
    })
  );

  return NextResponse.json({ results });
}
