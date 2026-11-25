export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#E4EFFB] ${className}`}
      aria-hidden="true"
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#DCE8F7] bg-white p-4 space-y-3"
          >
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-7 w-20" />
            <SkeletonBlock className="h-3 w-28" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-[#DCE8F7] bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-6 w-56" />
          <SkeletonBlock className="h-8 w-72" />
        </div>
        <SkeletonBlock className="h-[320px] w-full" />
      </div>
    </div>
  );
}
