import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { PAYMENT_METHODS_BREAKDOWN } from '../../data/mockHospitalData';
import { formatINR, formatINRCompact } from '../../lib/formatters';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export function PaymentMethodsChart() {
  const reducedMotion = useReducedMotion();
  const totalAmount = PAYMENT_METHODS_BREAKDOWN.reduce((acc, item) => acc + item.amount, 0);

  return (
    <section
      aria-labelledby="payment-methods-heading"
      className="flex flex-col justify-between rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 sm:p-6 shadow-sm shadow-[#0070F3]/5"
    >
      <div>
        <h2
          id="payment-methods-heading"
          className="font-display text-base font-semibold text-[#05080F]"
        >
          Payment Methods Breakdown
        </h2>
        <p className="mt-0.5 text-xs text-[#334155]">
          Channel distribution for current revenue cycle
        </p>
      </div>

      <div className="my-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
        <div className="relative h-52 sm:col-span-5">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={PAYMENT_METHODS_BREAKDOWN}
                dataKey="amount"
                nameKey="method"
                innerRadius="62%"
                outerRadius="86%"
                paddingAngle={3}
                stroke="none"
                isAnimationActive={!reducedMotion}
                animationDuration={750}
              >
                {PAYMENT_METHODS_BREAKDOWN.map((entry) => (
                  <Cell key={entry.method} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatINR(Number(value ?? 0))}
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #DCE8F7',
                  borderRadius: '10px',
                  fontSize: '12px',
                  color: '#05080F',
                  boxShadow: '0 10px 25px rgba(0, 112, 243, 0.1)',
                }}
                itemStyle={{ color: '#05080F' }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[11px] text-[#334155]">Total Mix</span>
            <span className="font-mono text-base font-bold text-[#05080F] tabular-nums">
              {formatINRCompact(totalAmount)}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 sm:col-span-7">
          {PAYMENT_METHODS_BREAKDOWN.map((item) => (
            <div
              key={item.method}
              className="flex items-center justify-between gap-3 border-b border-[#E6EFFA] pb-2 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-xs"
                  style={{ backgroundColor: item.color }}
                />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#05080F]">{item.method}</p>
                  <p className="text-[11px] text-[#334155] tabular-nums">{item.count} txns</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-mono text-xs font-semibold text-[#05080F] tabular-nums">
                  {formatINR(item.amount)}
                </p>
                <p className="font-mono text-[11px] text-[#334155] tabular-nums">{item.share}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
