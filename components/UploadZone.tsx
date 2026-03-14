'use client';
import { useCallback, useState } from 'react';
import * as XLSX from 'xlsx';
import { HotelRaw } from '@/app/page';
interface Props { onFile: (hotels: HotelRaw[]) => void; onStart: () => void; hasFile: boolean; fileCount: number; }
export default function UploadZone({ onFile, onStart, hasFile, fileCount }: Props) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const parseFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wb = XLSX.read(e.target?.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws) as Record<string, string>[];
      const hotels: HotelRaw[] = data.map((row) => {
        let marsha = ''; let level: 'Full' | 'No Translation' = 'No Translation';
        for (const k of Object.keys(row)) {
          if (/marsha/i.test(k)) marsha = String(row[k]).trim().toUpperCase();
          if (/translation/i.test(k)) level = String(row[k]).trim() === 'Full' ? 'Full' : 'No Translation';
        }
        return { marsha, level };
      }).filter(h => h.marsha);
      setFileName(file.name); onFile(hotels);
    };
    reader.readAsArrayBuffer(file);
  }, [onFile]);
  const handleDrop = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) parseFile(f); }, [parseFile]);
  return (
    <div className="space-y-6">
      <div onDrop={handleDrop} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${dragging ? 'border-[#C8102E] bg-red-50' : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'}`}>
        <input type="file" accept=".xlsx,.xls,.csv" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => { if (e.target.files?.[0]) parseFile(e.target.files[0]); }} />
        <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white border border-neutral-200 flex items-center justify-center">
          <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75z" /></svg>
        </div>
        {hasFile ? (<><div className="flex items-center justify-center gap-2 mb-2"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="text-sm font-medium text-neutral-800">{fileName}</span></div><p className="text-xs text-neutral-500">{fileCount.toLocaleString()} hotels loaded · Ready to enrich</p></>) : (<><h3 className="text-sm font-medium text-neutral-800 mb-1">Drop your MARSHA spreadsheet here</h3><p className="text-xs text-neutral-500">XLSX or CSV · Columns: MARSHA Code, CN Translation Level</p></>)}
      </div>
      <div className="flex justify-end">
        <button disabled={!hasFile} onClick={onStart} className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${hasFile ? 'bg-[#C8102E] text-white hover:bg-[#a50d25] cursor-pointer' : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'}`}>Enrich &amp; Analyze →</button>
      </div>
      <div className="bg-red-50 border border-red-100 rounded-xl p-4">
        <p className="text-[11px] font-medium text-[#C8102E] uppercase tracking-wide mb-1">How it works</p>
        <p className="text-sm text-neutral-600 leading-relaxed">Upload your MARSHA spreadsheet. The app calls Claude AI to look up each hotel's <strong>name</strong>, <strong>country</strong>, and <strong>website URL</strong>, then generates a full CN translation coverage analysis by country — ready to export as XLSX.</p>
      </div>
    </div>
  );
}
