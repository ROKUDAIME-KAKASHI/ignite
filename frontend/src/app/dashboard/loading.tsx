export default function DashboardLoading() {
  return (
    <div className="flex-1 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] bg-fixed bg-[#0a0a0a] animate-pulse">
      
      {/* ── Hero Skeleton ── */}
      <div className="relative overflow-hidden px-5 pt-8 pb-12 bg-[#111]/80 backdrop-blur-xl border-b border-white/10">
        <div className="relative z-10 space-y-4">
          <div className="h-3 w-32 bg-white/20 rounded-full" />
          <div className="h-10 w-64 bg-white/20 rounded-full" />
          <div className="h-4 w-48 bg-white/20 rounded-full" />
          <div className="flex items-center gap-2 mt-4">
            <div className="h-8 w-24 bg-white/20 rounded-full" />
            <div className="h-8 w-24 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Grace Points Card Skeleton ── */}
      <div className="relative z-20 px-4 -mt-6 mb-5">
        <div className="bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl">
          <div className="flex justify-between items-center mb-3">
            <div className="space-y-2">
              <div className="h-3 w-32 bg-white/20 rounded-full" />
              <div className="h-8 w-40 bg-white/20 rounded-full" />
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-2 flex-1 bg-white/20 rounded-full" />
            <div className="h-3 w-20 bg-white/20 rounded-full" />
          </div>
        </div>
      </div>

      {/* ── Content Skeleton ── */}
      <div className="px-4 space-y-6">
        
        {/* Notices */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20" />
            <div className="h-4 w-32 bg-white/20 rounded-full" />
          </div>
          <div className="h-24 w-full bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl" />
          <div className="h-24 w-full bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl" />
        </div>

        {/* Daily Journey */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-white/20" />
              <div className="h-4 w-40 bg-white/20 rounded-full" />
            </div>
          </div>
          <div className="h-40 w-full bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl" />
        </div>

      </div>
      
    </div>
  );
}
