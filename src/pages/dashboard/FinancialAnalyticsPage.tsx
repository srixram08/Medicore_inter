import { motion } from 'motion/react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { formatAxisINR, formatINR, formatINRCompact } from '../../lib/formatters';
import { PaymentTimelineChart } from '../../features/dashboard/PaymentTimelineChart';
import { PaymentMethodsChart } from '../../features/dashboard/PaymentMethodsChart';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function FinancialAnalyticsPage() {
  const { departments } = useHospitalStore();
  const reducedMotion = useReducedMotion();

  const deptRevenueData = departments.map((d) => ({
    name: d.name.replace(' & Trauma', '').replace('General ', 'Gen. '),
    revenue: d.monthlyRevenue,
    visits: d.todayVisits,
  }));

  const totalMonthly = departments.reduce((acc, d) => acc + d.monthlyRevenue, 0);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-[#05080F]">Financial Analytics</h1>
        <p className="mt-1 text-sm text-[#334155]">
          Departmental revenue attribution, payment mix, and billing settlement efficiency.
        </p>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 shadow-sm shadow-[#0070F3]/5">
          <p className="text-xs text-[#334155]">Monthly Departmental Gross</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#0070F3] tabular-nums">
            {formatINRCompact(totalMonthly)}
          </p>
          <p className="mt-1 text-xs font-medium text-[#0D9F6E]">+11.4% vs prior fiscal month</p>
        </div>
        <div className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 shadow-sm shadow-[#0070F3]/5">
          <p className="text-xs text-[#334155]">Collection Realization Rate</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#0D9F6E] tabular-nums">94.2%</p>
          <p className="mt-1 text-xs text-[#334155]">Average settlement cycle: 1.8 days</p>
        </div>
        <div className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 shadow-sm shadow-[#0070F3]/5">
          <p className="text-xs text-[#334155]">Insurance TPA Approval Rate</p>
          <p className="mt-2 font-mono text-2xl font-bold text-[#0EA5E9] tabular-nums">91.6%</p>
          <p className="mt-1 text-xs text-[#334155]">29 active claims this cycle</p>
        </div>
      </div>

      {/* Department Revenue Bar Chart + Payment Methods */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 sm:p-6 shadow-sm shadow-[#0070F3]/5 lg:col-span-7">
          <h2 className="font-display text-base font-semibold text-[#05080F]">
            Monthly Revenue by Department
          </h2>
          <p className="mt-0.5 text-xs text-[#334155]">
            Sampled departmental billing volume in INR
          </p>

          <div className="mt-5 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptRevenueData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                <CartesianGrid stroke="#E2ECF7" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="name" stroke="#334155" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#334155"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={formatAxisINR}
                />
                <Tooltip
                  formatter={(v) => formatINR(Number(v ?? 0))}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DCE8F7',
                    borderRadius: '10px',
                    fontSize: '12px',
                    color: '#05080F',
                    boxShadow: '0 10px 25px rgba(0, 112, 243, 0.1)',
                  }}
                />
                <Bar
                  dataKey="revenue"
                  name="Monthly Revenue"
                  fill="#0070F3"
                  radius={[6, 6, 0, 0]}
                  isAnimationActive={!reducedMotion}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <div className="lg:col-span-5">
          <PaymentMethodsChart />
        </div>
      </div>

      <PaymentTimelineChart />
    </motion.div>
  );
}
