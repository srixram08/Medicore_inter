import { useReducedMotion } from '../../hooks/useReducedMotion';

export function DashboardHospitalBackdrop() {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="no-print pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#EAF2FF]"
    >
      {/* Luminous Clinical Sky Depth Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 15%, rgba(255, 255, 255, 0.96) 0%, rgba(219, 234, 254, 0.72) 44%, rgba(234, 243, 255, 0.98) 100%)',
        }}
      />

      {/* Precision Hospital Calibration Grid */}
      <div
        className="absolute inset-0 opacity-55"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0, 112, 243, 0.085) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 112, 243, 0.085) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Top-Right Orbital Robotics Telemetry Ring */}
      <div className="absolute -top-28 -right-24 h-[460px] w-[460px] opacity-65 sm:h-[560px] sm:w-[560px]">
        <svg viewBox="0 0 400 400" className="h-full w-full">
          <g className={reducedMotion ? undefined : 'animate-orbit-slow'}>
            <circle
              cx="200"
              cy="200"
              r="182"
              fill="none"
              stroke="#0070F3"
              strokeOpacity="0.34"
              strokeWidth="1.8"
              strokeDasharray="14 10"
            />
            <rect x="195" y="12" width="10" height="10" rx="2" fill="#0070F3" fillOpacity="0.6" />
            <rect x="195" y="378" width="10" height="10" rx="2" fill="#0070F3" fillOpacity="0.6" />
            <rect x="12" y="195" width="10" height="10" rx="2" fill="#0EA5E9" fillOpacity="0.6" />
            <rect x="378" y="195" width="10" height="10" rx="2" fill="#0EA5E9" fillOpacity="0.6" />
          </g>
          <g className={reducedMotion ? undefined : 'animate-orbit-reverse'}>
            <circle
              cx="200"
              cy="200"
              r="138"
              fill="none"
              stroke="#0EA5E9"
              strokeOpacity="0.3"
              strokeWidth="1.5"
              strokeDasharray="24 12"
            />
            <circle cx="200" cy="62" r="4.5" fill="#0EA5E9" fillOpacity="0.65" />
            <circle cx="200" cy="338" r="4.5" fill="#0070F3" fillOpacity="0.65" />
          </g>
          {/* Centered Crisp Medical Cross */}
          <g transform="translate(178, 178)" opacity="0.28">
            <rect x="16" y="4" width="12" height="36" rx="3" fill="#0070F3" />
            <rect x="4" y="16" width="36" height="12" rx="3" fill="#0070F3" />
          </g>
        </svg>
      </div>

      {/* Bottom-Left Hospital Robotics Calibration Ring & Cardiac Silhouette */}
      <div className="absolute -bottom-32 -left-20 h-[420px] w-[420px] opacity-60 lg:left-40">
        <svg viewBox="0 0 400 400" className="h-full w-full">
          <g className={reducedMotion ? undefined : 'animate-orbit-reverse'}>
            <circle
              cx="200"
              cy="200"
              r="176"
              fill="none"
              stroke="#0070F3"
              strokeOpacity="0.28"
              strokeWidth="1.6"
              strokeDasharray="10 10"
            />
            <circle cx="200" cy="24" r="4" fill="#0070F3" fillOpacity="0.55" />
            <circle cx="200" cy="376" r="4" fill="#0EA5E9" fillOpacity="0.55" />
          </g>
          <g className={reducedMotion ? undefined : 'animate-heart-pulse'} opacity="0.35">
            <path
              d="M192 146 C192 132, 208 128, 215 138 C219 146, 214 156, 214 156 C234 158, 246 174, 244 196 C241 220, 217 244, 200 256 C183 244, 159 220, 156 196 C154 174, 166 156, 185 156 L185 140 L192 140 Z"
              fill="#93C5FD"
              fillOpacity="0.4"
              stroke="#0070F3"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      {/* Live Hospital ECG Monitor Waveforms Sweeping Across Viewport */}
      <div className="absolute inset-x-0 top-[22%] opacity-45">
        <svg viewBox="0 0 1440 90" className="h-20 w-full overflow-visible">
          <path
            d="M0 48 L200 48 L220 48 L234 32 L248 48 L278 48 L292 60 L310 10 L330 80 L348 38 L368 48 L640 48 L660 48 L674 32 L688 48 L718 48 L732 60 L750 10 L770 80 L788 38 L808 48 L1080 48 L1100 48 L1114 32 L1128 48 L1158 48 L1172 60 L1190 10 L1210 80 L1228 38 L1248 48 L1440 48"
            fill="none"
            stroke="#0070F3"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={reducedMotion ? undefined : 'animate-ecg-dash'}
          />
        </svg>
      </div>

      <div className="absolute inset-x-0 bottom-[14%] opacity-40">
        <svg viewBox="0 0 1440 90" className="h-20 w-full overflow-visible">
          <path
            d="M0 48 L140 48 L160 48 L174 34 L188 48 L218 48 L232 58 L250 14 L270 76 L288 39 L308 48 L560 48 L580 48 L594 34 L608 48 L638 48 L652 58 L670 14 L690 76 L708 39 L728 48 L1000 48 L1020 48 L1034 34 L1048 48 L1078 48 L1092 58 L1110 14 L1130 76 L1148 39 L1168 48 L1440 48"
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={reducedMotion ? undefined : 'animate-ecg-dash'}
          />
        </svg>
      </div>

      {/* Floating Hospital Robotics Motifs (Crosses, DNA Helix, Capsule, Pulse Shield) */}
      <div
        className={`absolute top-[14%] left-[24%] hidden opacity-40 md:block ${
          reducedMotion ? '' : 'animate-float-drift'
        }`}
      >
        <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
          <rect x="16" y="4" width="10" height="34" rx="3" fill="#0070F3" fillOpacity="0.45" />
          <rect x="4" y="16" width="34" height="10" rx="3" fill="#0070F3" fillOpacity="0.45" />
        </svg>
      </div>

      <div
        className={`absolute right-[8%] bottom-[22%] hidden opacity-45 md:block ${
          reducedMotion ? '' : 'animate-float-drift'
        }`}
        style={reducedMotion ? undefined : { animationDelay: '1.8s' }}
      >
        <svg width="46" height="72" viewBox="0 0 46 72" fill="none">
          <path
            d="M12 6 C34 18, 34 26, 12 36 C-10 46, 34 54, 12 66"
            stroke="#0070F3"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M34 6 C12 18, 12 26, 34 36 C56 46, 12 54, 34 66"
            stroke="#0EA5E9"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <line x1="14" y1="14" x2="32" y2="14" stroke="#0070F3" strokeOpacity="0.5" strokeWidth="1.8" />
          <line x1="14" y1="36" x2="32" y2="36" stroke="#0070F3" strokeOpacity="0.5" strokeWidth="1.8" />
          <line x1="14" y1="58" x2="32" y2="58" stroke="#0070F3" strokeOpacity="0.5" strokeWidth="1.8" />
        </svg>
      </div>

      <div
        className={`absolute top-[52%] right-[4%] hidden opacity-40 lg:block ${
          reducedMotion ? '' : 'animate-float-drift'
        }`}
        style={reducedMotion ? undefined : { animationDelay: '3.1s' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect
            x="10"
            y="4"
            width="20"
            height="32"
            rx="10"
            transform="rotate(32 20 20)"
            stroke="#0070F3"
            strokeWidth="2.2"
            fill="#FFFFFF"
            fillOpacity="0.6"
          />
          <line
            x1="12"
            y1="15"
            x2="28"
            y2="25"
            stroke="#0EA5E9"
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}
