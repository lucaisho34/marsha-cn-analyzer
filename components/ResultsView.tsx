'use client';
import { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { HotelEnriched } from '@/app/page';
interface Props { enriched: HotelEnriched[]; onReset: () => void; }
const PAGE_SIZE = 25;
export default function ResultsView({ enriched, onReset }: Props) {
  const [activeTab, setActiveTab] = useState<'data' | 'analytics'>('data');
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [transFilter, setTransFilter] = useState('');
  const [page, setPage] = useState(1);
  const countries = useMemo(() => [...new Set(enriched.map(h => h.country))].sort(), [enriched]);
  const filtered = useMemo(() => enriched.filter(h => {
    const s = search.toLowerCase();
    return (!s || h.name.toLowerCase().includes(s) || h.country.toLowerCase().includes(s) || h.marsha.toLowerCase().includes(s)) && (!countryFilter || h.country === countryFilter) && (!transFilter || h.level === transFilter);
  }), [enriched, search, countryFilter, transFilter]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const byCountry = useMemo(() => {
    const map: Record<string, { full: number; none: number }> = {};
    enriched.forEach(h => { if (!map[h.country]) map[h.country] = { full: 0, none: 0 }; if (h.level === 'Full') map[h.country].full++; else map[h.country].none++; });
    return map;
  }, [enriched]);
  const sortedCountries = useMemo(() => Object.entries(byCountry).sort((a, b) => (b[1].full + b[1].none) - (a[1].full + a[1].none)).slice(0, 20), [byCountry]);
  const topOpps = useMemo(() => Object.entries(byCountry).sort((a, b) => b[1].none - a[1].none).slice(0, 10), [byCountry]);
  const total = enriched.length;
  const fullCount = enriched.filter(h => h.level === 'Full').length;
  const noneCount = total - fullCount;
  const countryCount = Object.keys(byCountry).filter(c => c !== 'Unknown').length;
  const maxTotal = Math.max(...sortedCountries.map(([, v]) => v.full + v.none), 1);
  const maxNone = Math.max(...topOpps.map(([, v]) => v.none), 1);
  const fullyTranslated = Object.values(byCountry).filter(v => v.none === 0).length;
  const zeroTranslated = Object.values(byCountry).filter(v => v.full === 0).length;
  const exportXLSX = () => {
    const data: string[][] = [['MARSHA Code','Hotel Name','Country','Website URL','CN Translation Level']];
    enriched.forEach(h => data.push([h.marsha,h.name,h.country,h.url,h.level]));
    const ws = XLSX.utils.aoa_to_sheet(data); ws['!cols']=[{wch:12},{wch:40},{wch:20},{wch:60},{wch:20}];
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'MARSHA Enriched');
    const a2: string[][] = [['Country','Full CN','No Translation','Total','Coverage %']];
    Object.entries(byCountry).sort((a,b)=>(b[1].full+b[1].none)-(a[1].full+a[1].none)).forEach(([c,v])=>{ const t=v.full+v.none; a2.push([c,String(v.full),String(v.none),String(t),Math.round(v.full/t*100)+'%']); });
    const ws2=XLSX.utils.aoa_to_sheet(a2); ws2['!cols']=[{wch:25},{wch:12},{wch:16},{wch:10},{wch:14}];
    XLSX.utils.book_append_sheet(wb,ws2,'Country Analysis'); XLSX.writeFile(wb,'MARSHA_CN_Analysis.xlsx');
  };
  const exportCSV = () => {
    const hdr='MARSHA Code,Hotel Name,Country,Website URL,CN Translation Level\n';
    const rows=enriched.map(h=>[h.marsha,h.name,h.country,h.url,h.level].map(v=>'"'+String(v||'').replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob=new Blob([hdr+rows],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='MARSHA_CN_Enriched.csv'; a.click();
  };
  return (
    <div>
      <div className="flex border border-neutral-200 rounded-lg overflow-hidden mb-5">
        {(['data','analytics'] as const).map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)} className={"flex-1 py-2.5 text-sm transition-all border-r last:border-r-0 border-neutral-200 "+(activeTab===tab?'bg-white text-neutral-900 font-medium':'bg-neutral-50 text-neutral-500 hover:bg-white')}>
            {tab==='data'?'Hotel Data':'Analytics'}
          </button>
        ))}
      </div>
      {activeTab==='data'&&(
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search hotel, country, MARSHA..." className="flex-1 min-w-48 px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white text-neutral-900 outline-none"/>
            <select value={countryFilter} onChange={e=>{setCountryFilter(e.target.value);setPage(1);}} className="px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white text-neutral-700 outline-none">
              <option value="">All countries</option>{countries.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={transFilter} onChange={e=>{setTransFilter(e.target.value);setPage(1);}} className="px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-white text-neutral-700 outline-none">
              <option value="">All levels</option><option value="Full">Full CN</option><option value="No Translation">No Translation</option>
            </select>
          </div>
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-neutral-50 border-b border-neutral-200">{['MARSHA','Hotel Name','Country','Website URL','CN Translation'].map(h=><th key={h} className="px-4 py-3 text-left text-[11px] font-medium text-neutral-500 uppercase tracking-wide whitespace-nowrap">{h}</th>)}</tr></thead>
                <tbody>{pageData.map((h,i)=>(
                  <tr key={h.marsha+i} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-500">{h.marsha}</td>
                    <td className="px-4 py-3 text-neutral-800">{h.name}</td>
                    <td className="px-4 py-3 text-neutral-600">{h.country}</td>
                    <td className="px-4 py-3">{h.url?<a href={h.url} target="_blank" rel="noopener noreferrer" className="text-[#C8102E] hover:underline text-xs">{h.url.replace('https://','').substring(0,45)}{h.url.length>52?'...':''}</a>:<span className="text-neutral-300 text-xs">-</span>}</td>
                    <td className="px-4 py-3">{h.level==='Full'?<span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-green-50 text-green-700 border border-green-200">Full CN</span>:<span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-orange-50 text-orange-700 border border-orange-200">No Translation</span>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-neutral-500">{filtered.length.toLocaleString()} hotels - Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50">Prev</button>
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages} className="px-3 py-1.5 text-xs rounded-lg border border-neutral-200 disabled:opacity-40 hover:bg-neutral-50">Next</button>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={exportCSV} className="px-4 py-2 text-sm rounded-lg border border-neutral-200 hover:bg-neutral-50">Export CSV</button>
            <button onClick={exportXLSX} className="px-4 py-2 text-sm rounded-lg bg-[#C8102E] text-white hover:bg-[#a50d25]">Export XLSX</button>
          </div>
        </div>
      )}
      {activeTab==='analytics'&&(
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[{label:'Total Hotels',value:total.toLocaleString(),sub:'APEC properties'},{label:'CN Translated',value:fullCount.toLocaleString(),sub:Math.round(fullCount/total*100)+'% of portfolio',color:'text-green-600'},{label:'Not Translated',value:noneCount.toLocaleString(),sub:Math.round(noneCount/total*100)+'% gap to close',color:'text-orange-600'},{label:'Countries',value:countryCount.toLocaleString(),sub:'markets covered'}].map(s=>(
              <div key={s.label} className="bg-neutral-50 rounded-xl p-4 border border-neutral-200">
                <p className="text-[10px] uppercase tracking-wide text-neutral-500 mb-1.5">{s.label}</p>
                <p className={"text-2xl font-medium tracking-tight "+(s.color||'text-neutral-900')}>{s.value}</p>
                <p className="text-[11px] text-neutral-400 mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="text-sm font-medium mb-4 text-neutral-800">CN translation coverage by country</h3>
            <div className="space-y-2.5">
              {sortedCountries.map(([name,v])=>{const tot=v.full+v.none;const fp=Math.round((v.full/maxTotal)*100);const np=Math.round((v.none/maxTotal)*100);const cp=Math.round(v.full/tot*100);return(
                <div key={name} className="flex items-center gap-3 text-sm">
                  <span className="text-neutral-500 text-xs min-w-[130px] truncate">{name}</span>
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden relative">
                    <div className="absolute left-0 top-0 h-full bg-green-500 rounded-full" style={{width:fp+'%'}}/>
                    <div className="absolute top-0 h-full bg-orange-400 rounded-full" style={{left:fp+'%',width:np+'%'}}/>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 min-w-[80px] text-right">{v.full}/{tot} <span className={cp>=75?'text-green-600':cp>=50?'text-yellow-600':'text-orange-600'}>({cp}%)</span></span>
                </div>
              );})}
            </div>
          </div>
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h3 className="text-sm font-medium mb-4 text-neutral-800">Top opportunity markets</h3>
            <div className="space-y-2.5">
              {topOpps.map(([name,v])=>(
                <div key={name} className="flex items-center gap-3 text-sm">
                  <span className="text-neutral-500 text-xs min-w-[130px] truncate">{name}</span>
                  <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full bg-orange-400 rounded-full" style={{width:Math.round((v.none/maxNone)*100)+'%'}}/></div>
                  <span className="text-[11px] font-mono text-orange-600 min-w-[100px] text-right">{v.none} untranslated</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {[{title:'Coverage gap',text:noneCount.toLocaleString()+' of '+total.toLocaleString()+' APEC hotels ('+Math.round(noneCount/total*100)+'%) lack CN translation.'},{title:'Top opportunity market',text:(topOpps[0]?.[0]||'-')+' has the most untranslated properties ('+( topOpps[0]?.[1]?.none||0)+' hotels).'},{title:'Market readiness',text:fullyTranslated+' market'+(fullyTranslated!==1?'s are':' is')+' fully CN-translated. '+zeroTranslated+' market'+(zeroTranslated!==1?'s have':' has')+' zero CN translation.'}].map(ins=>(
              <div key={ins.title} className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-[11px] font-medium text-[#C8102E] uppercase tracking-wide mb-1">{ins.title}</p>
                <p className="text-sm text-neutral-600 leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-2">
            <button onClick={onReset} className="text-xs text-neutral-400 hover:text-neutral-600">Upload new file</button>
            <button onClick={exportXLSX} className="px-4 py-2 text-sm rounded-lg bg-[#C8102E] text-white hover:bg-[#a50d25]">Export Full Report XLSX</button>
          </div>
        </div>
      )}
    </div>
  );
}