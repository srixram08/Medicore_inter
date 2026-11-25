export function SceneFallback({ reason }: { reason?: string }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#E8F2FF]">
      {/* Luminous white-to-bright-blue studio gradient */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.85) 0%, rgba(191, 219, 254, 0.72) 52%, rgba(219, 234, 254, 0.96) 100%)',
        }}
      />

      {/* Precision robotics calibration grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-65"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0, 112, 243, 0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 112, 243, 0.14) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
          maskImage: 'radial-gradient(circle at 50% 50%, black 42%, transparent 88%)',
        }}
      />

      {/* Upper & Lower Sweeping SVG ECG Waves visible on both mobile and desktop */}
      <div className="pointer-events-none absolute inset-x-0 top-[16%] z-0 opacity-75">
        <svg viewBox="0 0 1200 100" className="h-24 w-full overflow-visible" aria-hidden="true">
          <path
            d="M0 54 L140 54 L165 54 L180 34 L195 54 L230 54 L245 68 L265 10 L288 92 L308 42 L330 54 L500 54 L525 54 L540 36 L555 54 L590 54 L605 68 L625 10 L648 92 L668 42 L690 54 L860 54 L885 54 L900 36 L915 54 L950 54 L965 68 L985 10 L1008 92 L1028 42 L1050 54 L1200 54"
            fill="none"
            stroke="#0070F3"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg-dash"
          />
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[14%] z-0 opacity-70">
        <svg viewBox="0 0 1200 100" className="h-24 w-full overflow-visible" aria-hidden="true">
          <path
            d="M0 54 L200 54 L225 54 L240 36 L255 54 L290 54 L305 68 L325 12 L348 90 L368 44 L390 54 L580 54 L605 54 L620 36 L635 54 L670 54 L685 68 L705 12 L728 90 L748 44 L770 54 L960 54 L985 54 L1000 36 L1015 54 L1050 54 L1065 68 L1085 12 L1108 90 L1128 44 L1150 54 L1200 54"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-ecg-dash"
          />
        </svg>
      </div>

      {/* Large orbital robotic calibration assembly behind login card */}
      <div className="pointer-events-none relative z-0 flex h-[480px] w-[480px] items-center justify-center sm:h-[700px] sm:w-[700px]">
        <svg
          viewBox="0 0 400 400"
          className="h-full w-full"
          role="img"
          aria-label="Robotic cardiac telemetry schematic"
        >
          <defs>
            <linearGradient id="heartCoreBlue" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0070F3" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id="heartGradLight" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0070F3" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="ringGradLight" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0070F3" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0070F3" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Outer rotating gimbal ring */}
          <g className="animate-orbit-slow">
            <circle
              cx="200"
              cy="200"
              r="184"
              fill="none"
              stroke="url(#ringGradLight)"
              strokeWidth="2.5"
              strokeDasharray="14 8"
            />
            <rect x="193" y="10" width="14" height="14" rx="3" fill="#0070F3" />
            <rect x="193" y="376" width="14" height="14" rx="3" fill="#0070F3" />
            <rect x="10" y="193" width="14" height="14" rx="3" fill="#0EA5E9" />
            <rect x="376" y="193" width="14" height="14" rx="3" fill="#0EA5E9" />
          </g>

          {/* Counter-rotating telemetry ring */}
          <g className="animate-orbit-reverse">
            <circle
              cx="200"
              cy="200"
              r="148"
              fill="none"
              stroke="#0070F3"
              strokeOpacity="0.52"
              strokeWidth="2"
              strokeDasharray="28 12"
            />
            <circle cx="200" cy="52" r="6" fill="#0EA5E9" />
            <circle cx="200" cy="348" r="6" fill="#0070F3" />
          </g>

          {/* Pulsing robotic cardiac silhouette */}
          <g className="animate-heart-pulse">
            <path
              d="M192 124 C192 104, 214 98, 224 114 C229 124, 222 138, 222 138 C250 140, 268 164, 264 194 C260 228, 226 264, 200 282 C174 264, 140 228, 136 194 C132 164, 152 138, 180 138 L180 116 L192 116 Z"
              fill="url(#heartCoreBlue)"
              stroke="url(#heartGradLight)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              d="M198 120 C198 98, 222 92, 232 110 M208 100 L208 84 M220 102 L224 88"
              fill="none"
              stroke="#0070F3"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </g>
        </svg>
      </div>

      {reason && (
        <div className="pointer-events-none absolute right-6 bottom-5 z-10 hidden text-right sm:block">
          <p className="text-[11px] font-medium text-[#334155]">{reason}</p>
        </div>
      )}
    </div>
  );
}
