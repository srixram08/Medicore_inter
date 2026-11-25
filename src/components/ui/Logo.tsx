export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#0070F3]/25 bg-[#0070F3] shadow-sm shadow-[#0070F3]/25">
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="text-white"
        >
          <path
            d="M12 2.5L20 7V17L12 21.5L4 17V7L12 2.5Z"
            stroke="currentColor"
            strokeOpacity="0.85"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M12 7.5V16.5M7.5 12H16.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {!collapsed && (
        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="font-display text-lg font-extrabold tracking-tight text-[#000000]">
            MediCore
          </span>
          <span className="font-mono text-xs font-bold text-[#0070F3]">3D</span>
        </div>
      )}
    </div>
  );
}
