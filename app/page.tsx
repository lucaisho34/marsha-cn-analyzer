'use client';

import { useState, useCallback } from 'react';
import UploadZone from '@/components/UploadZone';
import ProcessingView from '@/components/ProcessingView';
import ResultsView from '@/components/ResultsView';

export type TranslationLevel = 'Full' | 'No Translation';

export interface HotelRaw {
  marsha: string;
  level: TranslationLevel;
}

export interface HotelEnriched {
  marsha: string;
  name: string;
  country: string;
  url: string;
  level: TranslationLevel;
}

type AppState = 'upload' | 'processing' | 'results';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [rawHotels, setRawHotels] = useState<HotelRaw[]>([]);
  const [enriched, setEnriched] = useState<HotelEnriched[]>([]);
  const [cancelled, setCancelled] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, batch: 0, totalBatches: 0 });

  const handleFile = useCallback((hotels: HotelRaw[]) => setRawHotels(hotels), []);

  const handleStart = useCallback(async () => {
    setCancelled(false);
    setEnriched([]);
    setAppState('processing');
    const BATCH = 20;
    const total = rawHotels.length;
    const totalBatches = Math.ceil(total / BATCH);
    setProgress({ done: 0, total, batch: 0, totalBatches });
    const results: HotelEnriched[] = [];
    for (let i = 0; i < total; i += BATCH) {
      if (cancelled) break;
      const batch = rawHotels.slice(i, i + BATCH);
      const batchNum = Math.floor(i / BATCH) + 1;
      try {
        const res = await fetch('/api/enrich', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hotels: batch }) });
        const data = await res.json();
        results.push(...(data.results || []));
      } catch {
        batch.forEach(h => results.push({ marsha: h.marsha, name: h.marsha, country: 'Unknown', url: '', level: h.level }));
      }
      const done = Math.min(i + BATCH, total);
      setProgress({ done, total, batch: batchNum, totalBatches });
      setEnriched([...results]);
    }
    setAppState('results');
  }, [rawHotels, cancelled]);

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex items-center gap-3 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
          <div className="w-9 h-9 rounded-lg bg-[#C8102E] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg" style={{fontFamily:'Georgia,serif'}}>M</span>
          </div>
          <div>
            <h1 className="text-[17px] font-medium text-neutral-900 dark:text-neutral-100 tracking-tight">MARSHA CN Translation Analyzer</h1>
            <p className="text-xs text-neutral-500 mt-0.5">APEC outbound travel · Direct channel analysis · M.com & MBV App</p>
          </div>
          <span className="ml-auto text-[11px] font-mono px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-200 dark:border-neutral-700">APEC · CN Outbound</span>
        </header>
        {appState === 'upload' && <UploadZone onFile={handleFile} onStart={handleStart} hasFile={rawHotels.length > 0} fileCount={rawHotels.length} />}
        {appState === 'processing' && <ProcessingView progress={progress} onCancel={() => { setCancelled(true); setAppState('results'); }} />}
        {appState === 'results' && <ResultsView enriched={enriched} onReset={() => { setAppState('upload'); setRawHotels([]); setEnriched([]); }} />}
      </div>
    </main>
  );
}
