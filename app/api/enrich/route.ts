import { NextRequest, NextResponse } from 'next/server';

const IATA_COUNTRY: Record<string, string> = {
  AAM:'South Africa',AAN:'United Arab Emirates',AAT:'Mongolia',ABT:'Saudi Arabia',
  ABV:'Nigeria',ACC:'Ghana',ADA:'Turkey',ADB:'Turkey',ADD:'Ethiopia',ADL:'Australia',
  AGA:'Morocco',AGP:'Spain',AGR:'India',AHB:'Saudi Arabia',AKL:'New Zealand',
  ALA:'Kazakhstan',ALC:'Spain',AMB:'Madagascar',AMD:'India',AMM:'Jordan',
  AMS:'Netherlands',AMY:'Madagascar',ANC:'United States',ANR:'Belgium',
  AQJ:'Jordan',ARN:'Sweden',ATH:'Greece',ATL:'United States',ATQ:'India',
  AUH:'United Arab Emirates',AUS:'United States',AVV:'Australia',AYT:'Turkey',
  AZA:'United States',BAH:'Bahrain',BAK:'Azerbaijan',BAN:'Indonesia',
  BAV:'China',BBI:'India',BCN:'Spain',BDJ:'Indonesia',BDO:'Indonesia',
  BDQ:'India',BEG:'Serbia',BEL:'Brazil',BER:'Germany',BEY:'Lebanon',
  BHB:'United States',BHO:'India',BHX:'United Kingdom',BIS:'United States',
  BJL:'Gambia',BJM:'Burundi',BJR:'Ethiopia',BJS:'China',BJV:'Turkey',
  BKI:'Malaysia',BKK:'Thailand',BKO:'Mali',BLQ:'Italy',BLR:'India',
  BME:'Australia',BNA:'United States',BNE:'Australia',BOD:'France',
  BOG:'Colombia',BOM:'India',BOS:'United States',BPN:'Indonesia',
  BRU:'Belgium',BSB:'Brazil',BSL:'Switzerland',BTJ:'Indonesia',
  BTU:'Malaysia',BUE:'Argentina',BUD:'Hungary',BWI:'United States',
  CAI:'Egypt',CAN:'China',CBR:'Australia',CCU:'India',CDG:'France',
  CEB:'Philippines',CEI:'Thailand',CFU:'Greece',CGK:'Indonesia',
  CGN:'Germany',CGO:'China',CHC:'New Zealand',CHI:'United States',
  CJJ:'South Korea',CJU:'South Korea',CKG:'China',CLO:'Colombia',
  CLT:'United States',CMB:'Sri Lanka',CMN:'Morocco',CNS:'Australia',
  CNX:'Thailand',COK:'India',COR:'Argentina',CPH:'Denmark',CPT:'South Africa',
  CRK:'Philippines',CTG:'Colombia',CTS:'Japan',CTU:'China',CUN:'Mexico',
  CWB:'Brazil',CXR:'Vietnam',DAC:'Bangladesh',DAD:'Vietnam',DAM:'Syria',
  DAR:'Tanzania',DBV:'Croatia',DCA:'United States',DCF:'Dominica',
  DEL:'India',DEN:'United States',DFW:'United States',DGT:'Philippines',
  DJE:'Tunisia',DJJ:'Indonesia',DKR:'Senegal',DLC:'China',DLM:'Turkey',
  DMD:'Australia',DMK:'Thailand',DMM:'Saudi Arabia',DOH:'Qatar',
  DPS:'Indonesia',DRW:'Australia',DTM:'Germany',DTW:'United States',
  DUB:'Ireland',DUD:'New Zealand',DUR:'South Africa',DUS:'Germany',
  DVO:'Philippines',DXB:'United Arab Emirates',EAP:'Switzerland',
  EBB:'Uganda',EDI:'United Kingdom',ELQ:'Saudi Arabia',ERZ:'Turkey',
  ESB:'Turkey',EVN:'Armenia',EWR:'United States',EZE:'Argentina',
  FAO:'Portugal',FEZ:'Morocco',FJR:'United Arab Emirates',FKS:'Japan',
  FLR:'Italy',FOR:'Brazil',FRA:'Germany',FRU:'Kyrgyzstan',FSZ:'Japan',
  FUK:'Japan',GAU:'India',GBE:'Botswana',GIG:'Brazil',GLA:'United Kingdom',
  GME:'Ukraine',GMP:'South Korea',GOA:'Italy',GOI:'India',GOJ:'Russia',
  GRU:'Brazil',GUA:'Guatemala',GVA:'Switzerland',GYD:'Azerbaijan',
  GZT:'Turkey',HAJ:'Germany',HAK:'China',HAM:'Germany',HAN:'Vietnam',
  HAV:'Cuba',HBA:'Australia',HBE:'Egypt',HDY:'Thailand',HER:'Greece',
  HGH:'China',HIJ:'Japan',HKG:'Hong Kong',HKT:'Thailand',HLD:'China',
  HND:'Japan',HNL:'United States',HRB:'China',HRE:'Zimbabwe',HRG:'Egypt',
  HTI:'Australia',HUI:'Vietnam',HYD:'India',IAD:'United States',
  IAH:'United States',ICN:'South Korea',IDR:'India',IKA:'Iran',ILO:'Philippines',
  INN:'Austria',ISB:'Pakistan',IST:'Turkey',ITM:'Japan',IXA:'India',
  IXB:'India',IXC:'India',IXR:'India',IXZ:'India',JAI:'India',
  JDH:'India',JED:'Saudi Arabia',JFK:'United States',JHB:'Malaysia',
  JIL:'China',JJN:'China',JMK:'Greece',JNB:'South Africa',JNU:'United States',
  KBV:'Thailand',KCH:'Malaysia',KHH:'Taiwan',KHI:'Pakistan',KIJ:'Japan',
  KIN:'Jamaica',KIX:'Japan',KJA:'Russia',KLO:'Philippines',KMG:'China',
  KMJ:'Japan',KMQ:'Japan',KNH:'Taiwan',KOA:'United States',KOJ:'Japan',
  KRK:'Poland',KTM:'Nepal',KUL:'Malaysia',KUV:'South Korea',KWI:'Kuwait',
  KWJ:'South Korea',KYA:'Turkey',LAS:'United States',LAX:'United States',
  LBA:'United Kingdom',LEJ:'Germany',LGA:'United States',LGK:'Malaysia',
  LGW:'United Kingdom',LHE:'Pakistan',LHR:'United Kingdom',LIH:'United States',
  LIM:'Peru',LIS:'Portugal',LJG:'China',LJU:'Slovenia',LKO:'India',
  LLW:'Malawi',LOP:'Indonesia',LOS:'Nigeria',LON:'United Kingdom',
  LED:'Russia',LUN:'Zambia',LUX:'Luxembourg',LXR:'Egypt',LYS:'France',
  MAA:'India',MAD:'Spain',MAN:'United Kingdom',MBJ:'Jamaica',MBA:'Kenya',
  MCO:'United States',MCT:'Oman',MDC:'Indonesia',MDL:'Myanmar',
  MDZ:'Argentina',MED:'Saudi Arabia',MEL:'Australia',MEX:'Mexico',
  MES:'Indonesia',MFM:'Macao',MIA:'United States',MKY:'Australia',
  MLE:'Maldives',MLX:'Turkey',MNL:'Philippines',MOW:'Russia',MPM:'Mozambique',
  MQL:'Australia',MRS:'France',MRU:'Mauritius',MSH:'Oman',MSP:'United States',
  MSY:'United States',MUC:'Germany',MXP:'Italy',MYJ:'Japan',MYY:'Malaysia',
  NAG:'India',NAP:'Italy',NAW:'Thailand',NAS:'Bahamas',NBO:'Kenya',
  NGO:'Japan',NKG:'China',NNB:'Solomon Islands',NSN:'New Zealand',
  NRT:'Japan',NTE:'France',NTL:'Australia',NUE:'Germany',NYC:'United States',
  OAK:'United States',OAX:'Mexico',OGG:'United States',OKA:'Japan',
  OPO:'Portugal',ORD:'United States',ORY:'France',OSA:'Japan',OTP:'Romania',
  OVB:'Russia',PAR:'France',PAT:'India',PDX:'United States',PEK:'China',
  PEW:'Pakistan',PEN:'Malaysia',PER:'Australia',PGV:'United States',
  PHX:'United States',PHL:'United States',PIK:'United Kingdom',PIT:'United States',
  PKX:'China',PLM:'Indonesia',PLZ:'South Africa',PMI:'Spain',PMO:'Italy',
  PMR:'New Zealand',PNH:'Cambodia',PNQ:'India',POS:'Trinidad and Tobago',
  POA:'Brazil',PPS:'Philippines',PQC:'Vietnam',PRG:'Czech Republic',
  PSA:'Italy',PTY:'Panama',PUJ:'Dominican Republic',PUS:'South Korea',
  PVG:'China',PVR:'Mexico',QDU:'Germany',RDU:'United States',REC:'Brazil',
  REP:'Cambodia',RGN:'Myanmar',RHO:'Greece',RKT:'United Arab Emirates',
  RMQ:'Taiwan',ROM:'Italy',ROT:'New Zealand',RPR:'India',RSW:'United States',
  RUH:'Saudi Arabia',SAH:'Yemen',SAL:'El Salvador',SAV:'United States',
  SAW:'Turkey',SCL:'Chile',SDK:'Malaysia',SDJ:'Japan',SDQ:'Dominican Republic',
  SEL:'South Korea',SEA:'United States',SEZ:'Seychelles',SFO:'United States',
  SGN:'Vietnam',SHA:'China',SHJ:'United Arab Emirates',SIN:'Singapore',
  SJC:'United States',SJD:'Mexico',SJO:'Costa Rica',SKD:'Uzbekistan',
  SLC:'United States',SLL:'Oman',SMF:'United States',SPK:'Japan',SPU:'Croatia',
  SSH:'Egypt',STR:'Germany',STV:'India',SUB:'Indonesia',SUR:'Oman',
  SVQ:'Spain',SVX:'Russia',SVO:'Russia',SYD:'Australia',SYX:'China',
  SZF:'Turkey',SZG:'Austria',SZX:'China',TAD:'United States',TAE:'South Korea',
  TAK:'Japan',TAO:'China',TAS:'Uzbekistan',TBB:'Turkey',TBS:'Georgia',
  TIF:'Saudi Arabia',TLV:'Israel',TNA:'China',TNG:'Morocco',TNN:'Taiwan',
  TOY:'Japan',TPE:'Taiwan',TQD:'Iraq',TRV:'India',TSA:'Taiwan',
  TSE:'Kazakhstan',TSV:'Australia',TTT:'Taiwan',TUU:'Saudi Arabia',
  TUL:'United States',TWU:'Malaysia',TXN:'China',TYO:'Japan',TZX:'Turkey',
  UAK:'Greenland',UBP:'Thailand',UDR:'India',UIH:'Vietnam',UKB:'Japan',
  ULN:'Mongolia',UPG:'Indonesia',URT:'Thailand',USM:'Thailand',
  VAS:'Turkey',VCA:'Vietnam',VCE:'Italy',VDH:'Vietnam',VGA:'India',
  VIE:'Austria',VNS:'India',VTE:'Laos',WAW:'Poland',WLG:'New Zealand',
  WUH:'China',XIY:'China',XMN:'China',YEG:'Canada',YHZ:'Canada',
  YMQ:'Canada',YOW:'Canada',YTO:'Canada',YUL:'Canada',YVR:'Canada',
  YWG:'Canada',YYC:'Canada',YYZ:'Canada',ZAG:'Croatia',ZIH:'Mexico',
  ZNZ:'Tanzania',ZQN:'New Zealand',ZRH:'Switzerland',
};

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

// Parse hotel name + country from Marriott's direct hotel page URL
async function getMarriottData(marsha: string): Promise<{ name: string | null; country: string | null }> {
  try {
    const directUrl = `https://www.marriott.com/en-us/hotels/${marsha.toLowerCase()}/overview/`;
    const res = await fetch(directUrl, {
      signal: AbortSignal.timeout(7000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept': 'text/html' }
    });
    if (!res.ok) return { name: null, country: null };

    const finalUrl = res.url;
    // Extract name from slug: /en-us/hotels/XXXXX-name-parts/overview/
    const slugMatch = finalUrl.match(/\/hotels\/[a-z0-9]+-(.+?)\/overview/);
    let name: string | null = null;
    if (slugMatch) {
      name = slugMatch[1]
        .split('-')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
        // Fix common abbreviations
        .replace(/\bJw\b/g,'JW').replace(/\bAc\b/g,'AC').replace(/\bLc\b/g,'LC')
        .replace(/\bW \b/g,'W ').replace(/\bA \b/g,'a ')
        .replace(/\bAnd\b/g,'&').replace(/\bBy\b/g,'by')
        .replace(/\bOf\b/g,'of').replace(/\bThe\b/g,'the').replace(/\bAt\b/g,'at')
        .replace(/^(a |by |of |the |at )/i, (m: string) => m.charAt(0).toUpperCase() + m.slice(1));
    }

    // Get country from JSON-LD
    const html = await res.text();
    const countryMatch = html.match(/"addressCountry"\s*:\s*"([^"]{2,50})"/);
    const country = countryMatch?.[1] || null;

    return { name, country };
  } catch { return { name: null, country: null }; }
}

function getCountryFromIATA(marsha: string): string {
  const iata = marsha.substring(0, 3).toUpperCase();
  return IATA_COUNTRY[iata] || 'Unknown';
}

export async function POST(req: NextRequest) {
  const { hotels } = await req.json();

  const results = await Promise.all(
    hotels.map(async (h: { marsha: string; level: string }) => {
      const bvName = await getBVName(h.marsha);
      const iataCountry = getCountryFromIATA(h.marsha);

      // Only call Marriott if we're missing name OR country
      let finalName = bvName;
      let country = iataCountry;

      if (!finalName || country === 'Unknown') {
        const { name: mName, country: mCountry } = await getMarriottData(h.marsha);
        if (!finalName && mName) finalName = mName;
        if (country === 'Unknown' && mCountry) country = mCountry;
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
