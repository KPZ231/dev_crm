import { Activity } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="p-8 lg:p-12 space-y-12 min-h-screen bg-[#09090b]">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="h-10 w-64 bg-[#0c0c0f] border border-[#27272a] rounded-xl animate-pulse" />
          <div className="h-4 w-48 bg-[#0c0c0f] border border-[#27272a] rounded-lg animate-pulse" />
        </div>
        <div className="h-12 w-32 bg-[#0c0c0f] border border-[#27272a] rounded-xl animate-pulse" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="h-40 bg-[#0c0c0f] border border-[#27272a] rounded-3xl p-8 space-y-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-[#141416] rounded animate-pulse" />
              <div className="w-10 h-10 bg-[#141416] border border-[#27272a] rounded-xl animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-8 w-32 bg-[#141416] rounded-lg animate-pulse" />
              <div className="h-3 w-24 bg-[#141416] rounded animate-pulse" />
            </div>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#fafafa]/5 to-transparent -translate-x-full animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Table Skeleton */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="h-6 w-40 bg-[#0c0c0f] rounded-lg animate-pulse" />
            <div className="h-4 w-24 bg-[#0c0c0f] rounded-lg animate-pulse" />
          </div>
          <div className="bg-[#0c0c0f] border border-[#27272a] rounded-3xl h-[400px] overflow-hidden">
            <div className="w-full h-12 border-b border-[#27272a] animate-pulse" />
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="w-full h-16 border-b border-[#1a1a1c] p-6 flex items-center gap-8">
                <div className="w-48 h-4 bg-[#141416] rounded animate-pulse" />
                <div className="w-24 h-4 bg-[#141416] rounded animate-pulse" />
                <div className="flex-grow h-4 bg-[#141416] rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="h-6 w-32 bg-[#0c0c0f] mx-2 rounded-lg animate-pulse" />
            <div className="space-y-4">
              {[1, 2, 3].map((ws) => (
                <div key={ws} className="h-24 bg-[#0c0c0f] border border-[#27272a] rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="p-8 bg-[#0c0c0f] border border-[#27272a] border-dashed rounded-3xl flex flex-col items-center justify-center space-y-4 text-center">
             <div className="w-12 h-12 bg-[#141416] border border-[#27272a] rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#a78bfa] animate-spin" />
             </div>
             <div className="space-y-1">
               <div className="text-[#fafafa] text-xs font-bold">Synchronizing...</div>
               <div className="text-[#52525b] text-[10px] font-black uppercase tracking-widest">Optimizing data cache</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
