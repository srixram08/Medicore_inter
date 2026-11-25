import { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  PAYMENT_TIMELINE_DATA,
  TimeRangeKey,
  TimelinePoint,
} from '../../data/mockHospitalData';
import { formatAxisINR, formatINR } from '../../lib/formatters';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type SeriesKey = 'incoming' | 'outgoing' | 'totalRevenue' | 'pending' | 'refunds';

const SERIES_CONFIG: { key: SeriesKey; label: string; color: string }[] = [
  { key: 'totalRevenue', label: 'Total Revenue', color: '#0070F3' },
  { key: 'incoming', label: 'Incoming', color: '#0D9F6E' },
  { key: 'outgoing', label: 'Outgoing', color: '#0EA5E9' },
  { key: 'pending', label: 'Pending', color: '#D97706' },
  { key: 'refunds', label: 'Refunds', color: '#E11D48' },
];

const TIME_RANGES: TimeRangeKey[] = [
  'Today',
  '7 Days',
  '30 Days',
  '3 Months',
  '6 Months',
  '1 Year',
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey?: string;
    name?: string;
    value?: number;
    color?: string;
    payload?: TimelinePoint;
  }>;
}

function PaymentTimelineTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length || !payload[0].payload) return null;
  const pt = payload[0].payload;

  return (
    <div className="min-w-[235px] rounded-xl border border-[#DCE8F7] bg-white p-3.5 shadow-xl shadow-[#0070F3]/12">
      <div className="flex items-center justify-between gap-3 border-b border-[#E6EFFA] pb-2">
        <div>
          <p className="font-display text-xs font-semibold text-[#05080F]">{pt.fullDate}</p>
          <p className="font-mono text-[11px] text-[#334155]">{pt.time}</p>
        </div>
        <StatusBadge status={pt.status} />
      </div>

      <div className="mt-2.5 space-y-1.5 text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#334155]">Amount Received</span>
          <span className="font-mono font-semibold text-[#0D9F6E] tabular-nums">
            {formatINR(pt.incoming)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#334155]">Payment Method</span>
          <span className="font-medium text-[#05080F]">{pt.primaryMethod}</span>
        </div>
      </div>

      <div className="mt-2.5 space-y-1 border-t border-[#E6EFFA] pt-2 text-[11px]">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[#334155]">
              <span
                className="inline-block h-2 w-2 rounded-xs"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-mono font-semibold text-[#05080F] tabular-nums">
              {formatINR(Number(entry.value || 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PaymentTimelineChart() {
  const reducedMotion = useReducedMotion();
  const [range, setRange] = useState<TimeRangeKey>('7 Days');
  const [activeSeries, setActiveSeries] = useState<Record<SeriesKey, boolean>>({
    totalRevenue: true,
    incoming: true,
    outgoing: true,
    pending: true,
    refunds: false,
  });

  const data = useMemo(() => PAYMENT_TIMELINE_DATA[range], [range]);

  const toggleSeries = (key: SeriesKey) => {
    setActiveSeries((prev) => {
      const enabledCount = Object.values(prev).filter(Boolean).length;
      if (prev[key] && enabledCount === 1) return prev;
      return { ...prev, [key]: !prev[key] };
    });
  };

  return (
    <section
      aria-labelledby="payment-timeline-heading"
      className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 sm:p-6 shadow-sm shadow-[#0070F3]/5"
    >
      {/* Header + Time Range Filter Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2
            id="payment-timeline-heading"
            className="font-display text-lg font-semibold text-[#05080F] sm:text-xl"
          >
            Hospital Payment Timeline
          </h2>
          <p className="mt-0.5 text-xs text-[#334155]">
            {range === '7 Days'
              ? 'Nov 17 – Nov 23, 2026 · Daily inpatient & outpatient cashflow'
              : `${range} hospital revenue, collections, pending claims, and refunds`}
          </p>
        </div>

        <div
          className="flex flex-wrap items-center gap-1 rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-1"
          role="group"
          aria-label="Timeline range selector"
        >
          {TIME_RANGES.map((item) => {
            const selected = range === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setRange(item)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  selected
                    ? 'bg-[#0070F3] text-white font-semibold shadow-sm shadow-[#0070F3]/25'
                    : 'text-[#334155] hover:text-[#0070F3]'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Toggleable Series Legend Chips */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {SERIES_CONFIG.map((series) => {
          const isOn = activeSeries[series.key];
          return (
            <button
              key={series.key}
              type="button"
              onClick={() => toggleSeries(series.key)}
              aria-pressed={isOn}
              className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                isOn
                  ? 'border-[#CFE0F5] bg-[#F4F8FF] text-[#05080F]'
                  : 'border-[#E6EFFA] bg-white text-[#334155]/55 hover:text-[#334155]'
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-xs transition-opacity"
                style={{
                  backgroundColor: series.color,
                  opacity: isOn ? 1 : 0.35,
                }}
              />
              <span>{series.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Chart Viewport */}
      <div className="mt-5 h-[320px] w-full sm:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
          >
            <defs>
              <linearGradient id="revenueAreaGradLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0070F3" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#0070F3" stopOpacity={0.01} />
              </linearGradient>
              <filter id="glowDotLight" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <CartesianGrid
              stroke="#E2ECF7"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              stroke="#334155"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#DCE8F7' }}
              dy={8}
            />

            <YAxis
              stroke="#334155"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatAxisINR}
              domain={range === '7 Days' ? [0, 60000] : [0, 'auto']}
              width={56}
            />

            <Tooltip
              content={<PaymentTimelineTooltip />}
              cursor={{ stroke: '#0070F3', strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.4 }}
            />

            {activeSeries.totalRevenue && (
              <Area
                type="monotone"
                dataKey="totalRevenue"
                name="Total Revenue"
                stroke="#0070F3"
                strokeWidth={2.75}
                fill="url(#revenueAreaGradLight)"
                isAnimationActive={!reducedMotion}
                animationDuration={750}
                dot={{ r: 3.5, fill: '#0070F3', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                activeDot={{
                  r: 6,
                  fill: '#0070F3',
                  stroke: '#FFFFFF',
                  strokeWidth: 2,
                  filter: 'url(#glowDotLight)',
                }}
              />
            )}

            {activeSeries.incoming && (
              <Line
                type="monotone"
                dataKey="incoming"
                name="Incoming"
                stroke="#0D9F6E"
                strokeWidth={2.2}
                isAnimationActive={!reducedMotion}
                animationDuration={700}
                dot={{ r: 3, fill: '#0D9F6E', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                activeDot={{ r: 5.5, fill: '#0D9F6E', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              />
            )}

            {activeSeries.outgoing && (
              <Line
                type="monotone"
                dataKey="outgoing"
                name="Outgoing"
                stroke="#0EA5E9"
                strokeWidth={2}
                isAnimationActive={!reducedMotion}
                animationDuration={700}
                dot={{ r: 2.5, fill: '#0EA5E9', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: '#0EA5E9', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              />
            )}

            {activeSeries.pending && (
              <Line
                type="monotone"
                dataKey="pending"
                name="Pending"
                stroke="#D97706"
                strokeWidth={2}
                strokeDasharray="5 4"
                isAnimationActive={!reducedMotion}
                animationDuration={700}
                dot={{ r: 2.5, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: '#D97706', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              />
            )}

            {activeSeries.refunds && (
              <Line
                type="monotone"
                dataKey="refunds"
                name="Refunds"
                stroke="#E11D48"
                strokeWidth={2}
                isAnimationActive={!reducedMotion}
                animationDuration={700}
                dot={{ r: 2.5, fill: '#E11D48', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                activeDot={{ r: 5, fill: '#E11D48', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-[11px] text-[#334155]">
        Illustrative sample hospital payments, not actual financial records.
      </p>
    </section>
  );
}
