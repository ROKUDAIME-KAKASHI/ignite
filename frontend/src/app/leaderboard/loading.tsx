export default function Loading() {
  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed bg-[#0a0a0a]">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-xl bg-white/10" />
        <div>
          <div className="h-6 w-32 bg-white/10 rounded-md mb-2" />
          <div className="h-4 w-48 bg-white/10 rounded-md" />
        </div>
      </div>

      {/* Top 3 Podium Skeleton */}
      <div className="flex justify-center items-end gap-2 sm:gap-4 mt-8 h-48 animate-pulse">
        {/* Rank 2 */}
        <div className="w-24 h-32 bg-white/5 rounded-t-xl border-t border-x border-white/10" />
        {/* Rank 1 */}
        <div className="w-28 h-40 bg-white/10 rounded-t-xl border-t border-x border-amber-500/20" />
        {/* Rank 3 */}
        <div className="w-24 h-24 bg-white/5 rounded-t-xl border-t border-x border-white/10" />
      </div>

      {/* List Skeleton */}
      <div className="space-y-3 mt-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl animate-pulse">
            <div className="w-8 h-8 rounded-full bg-white/10 shrink-0" />
            <div className="w-12 h-12 rounded-full bg-white/10 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-white/10 rounded-md" />
              <div className="h-3 w-20 bg-white/10 rounded-md" />
            </div>
            <div className="w-16 h-6 bg-white/10 rounded-md shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
