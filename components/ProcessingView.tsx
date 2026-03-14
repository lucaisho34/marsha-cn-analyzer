'use client';
interface Props { progress: { done: number; total: number; batch: number; totalBatches: number }; onCancel: () => void; }
export default function ProcessingView({ progress, onCancel }: Props) {
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <div className="space-y-6">
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-neutral-800">Enriching hotels via Claude AI</span>
          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200">Batch {progress.batch} of {progress.totalBatches}</span>
        </div>
        <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden mb-3"><div className="h-full bg-[#C8102E] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} /></div>
        <div className="flex justify-between text-xs text-neutral-500"><span>{progress.done.toLocaleString()} / {progress.total.toLocaleString()} hotels processed</span><span>{pct}%</span></div>
      </div>
      <p className="text-center text-xs text-neutral-400">Processing in batches of 20 · This may take a few minutes for large datasets</p>
      <div className="flex justify-center"><button onClick={onCancel} className="px-5 py-2 rounded-lg text-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition-all">Cancel &amp; View Results</button></div>
    </div>
  );
}
