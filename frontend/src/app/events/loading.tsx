export default function Loading() {
  return (
    <div className="flex-1 p-5 overflow-y-auto space-y-6 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed bg-[#0a0a0a]">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4 animate-pulse mb-6">
        <div className="w-12 h-12 rounded-xl bg-white/10" />
        <div>
          <div className="h-6 w-32 bg-white/10 rounded-md mb-2" />
          <div className="h-4 w-48 bg-white/10 rounded-md" />
        </div>
      </div>

      {/* Events List Skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse">
            <div className="flex items-start gap-4">
              {/* Date Box */}
              <div className="w-14 h-16 rounded-xl bg-white/10 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 bg-white/10 rounded-md" />
                <div className="h-4 w-1/2 bg-white/10 rounded-md" />
                
                {/* Meta info */}
                <div className="flex items-center gap-3 pt-2">
                  <div className="h-3 w-20 bg-white/10 rounded-md" />
                  <div className="h-3 w-24 bg-white/10 rounded-md" />
                </div>
              </div>
            </div>
            
            {/* Attendees & Button */}
            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#111]" />
                ))}
              </div>
              <div className="w-24 h-9 bg-white/10 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
