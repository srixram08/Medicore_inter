import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowDownUp,
  ArrowUpRight,
  BedDouble,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  Clock,
  IndianRupee,
  RefreshCw,
  Search,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { CountUp } from '../../components/ui/CountUp';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/StateViews';
import { Modal } from '../../components/ui/Modal';
import { PaymentTimelineChart } from '../../features/dashboard/PaymentTimelineChart';
import { PaymentMethodsChart } from '../../features/dashboard/PaymentMethodsChart';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { formatINR, formatINRCompact } from '../../lib/formatters';
import { PaymentStatus, TransactionRecord } from '../../data/mockHospitalData';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type SortField = 'id' | 'patientName' | 'date' | 'amount' | 'status';
type SortOrder = 'asc' | 'desc';

const STATUS_FILTERS: Array<'All' | PaymentStatus> = [
  'All',
  'Paid',
  'Pending',
  'Partially Paid',
  'Refunded',
];

export default function OverviewPage() {
  const { transactions, departments, appointments, patients, doctors } = useHospitalStore();
  const reducedMotion = useReducedMotion();

  const [loadingView, setLoadingView] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Transaction table controls
  const [txnSearch, setTxnSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PaymentStatus>('All');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [selectedTxn, setSelectedTxn] = useState<TransactionRecord | null>(null);
  const pageSize = 6;

  const availableBeds = useMemo(
    () => departments.reduce((acc, d) => acc + (d.totalBeds - d.occupiedBeds), 0),
    [departments]
  );
  const totalPatientsCount = 1248 + (patients.length - 10);
  const todaysAppointmentsCount = 36 + (appointments.length - 9);
  const totalDoctorsCount = 42 + (doctors.length - 8);
  const hospitalRevenue = 245000;
  const pendingPayments = 38400;

  const kpis = [
    {
      label: 'Total Patients',
      value: totalPatientsCount,
      formatter: (v: number) => Math.round(v).toLocaleString('en-IN'),
      change: '+8.4%',
      positive: true,
      sub: 'vs last month',
      icon: Users,
      accent: 'text-[#0070F3]',
      iconBg: 'bg-[#EFF6FF] border-[#BFDBFE]',
    },
    {
      label: "Today's Appointments",
      value: todaysAppointmentsCount,
      formatter: (v: number) => Math.round(v).toLocaleString('en-IN'),
      change: '+12.5%',
      positive: true,
      sub: 'vs yesterday',
      icon: CalendarCheck2,
      accent: 'text-[#0D9F6E]',
      iconBg: 'bg-[#ECFDF5] border-[#A7F3D0]',
    },
    {
      label: 'Total Doctors',
      value: totalDoctorsCount,
      formatter: (v: number) => Math.round(v).toLocaleString('en-IN'),
      change: '+2 active',
      positive: true,
      sub: 'across 8 depts',
      icon: Stethoscope,
      accent: 'text-[#0284C7]',
      iconBg: 'bg-[#F0F9FF] border-[#BAE6FD]',
    },
    {
      label: 'Available Beds',
      value: availableBeds,
      formatter: (v: number) => `${Math.round(v)}`,
      change: '70.9% occ.',
      positive: true,
      sub: 'of 220 total',
      icon: BedDouble,
      accent: 'text-[#0070F3]',
      iconBg: 'bg-[#EFF6FF] border-[#BFDBFE]',
    },
    {
      label: 'Hospital Revenue',
      value: hospitalRevenue,
      formatter: (v: number) => formatINRCompact(Math.round(v)),
      change: '+14.2%',
      positive: true,
      sub: 'vs prior 7d',
      icon: IndianRupee,
      accent: 'text-[#0D9F6E]',
      iconBg: 'bg-[#ECFDF5] border-[#A7F3D0]',
    },
    {
      label: 'Pending Payments',
      value: pendingPayments,
      formatter: (v: number) => formatINRCompact(Math.round(v)),
      change: '-6.1%',
      positive: false,
      sub: 'insurance & OPD',
      icon: Clock,
      accent: 'text-[#D97706]',
      iconBg: 'bg-[#FFFBEB] border-[#FDE68A]',
    },
  ];

  const filteredTransactions = useMemo(() => {
    const q = txnSearch.trim().toLowerCase();
    const list = transactions.filter((t) => {
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesQuery =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.patientName.toLowerCase().includes(q) ||
        t.invoiceNo.toLowerCase().includes(q) ||
        t.method.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'amount') {
        cmp = a.amount - b.amount;
      } else {
        cmp = String(a[sortField]).localeCompare(String(b[sortField]));
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [transactions, txnSearch, statusFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedTransactions = filteredTransactions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRefresh = () => {
    setHasError(false);
    setLoadingView(true);
    window.setTimeout(() => {
      setLoadingView(false);
    }, 450);
  };

  if (hasError) {
    return <ErrorState onRetry={handleRefresh} />;
  }

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      {/* Greeting & Quick Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#05080F] sm:text-3xl">
            Good Morning, Administrator
          </h1>
          <p className="mt-1 text-sm font-medium text-[#334155]">
            Here&apos;s what&apos;s happening at your hospital today.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8F7] bg-white px-3.5 py-2 text-xs font-medium text-[#05080F] transition-colors hover:border-[#0070F3] hover:text-[#0070F3] whitespace-nowrap"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingView ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <Link
            to="/dashboard/billing"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0070F3]/20 transition-colors hover:bg-[#005DD1] whitespace-nowrap"
          >
            <span>New Invoice</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {loadingView ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <motion.div
                  key={kpi.label}
                  initial={reducedMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: reducedMotion ? 0 : idx * 0.04 }}
                  whileHover={reducedMotion ? undefined : { y: -2 }}
                  className="rounded-xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-4 shadow-sm shadow-[#0070F3]/5 transition-colors hover:border-[#93C5FD]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#334155]">{kpi.label}</span>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${kpi.iconBg} ${kpi.accent}`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                  </div>
                  <div className="mt-3 font-mono text-2xl font-extrabold tracking-tight text-[#05080F]">
                    <CountUp value={kpi.value} formatter={kpi.formatter} />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                    <span
                      className={`inline-flex items-center gap-0.5 font-semibold ${
                        kpi.positive ? 'text-[#0D9F6E]' : 'text-[#D97706]'
                      }`}
                    >
                      {kpi.positive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {kpi.change}
                    </span>
                    <span className="text-[#334155]">{kpi.sub}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Hero Hospital Payment Timeline Chart */}
          <PaymentTimelineChart />

          {/* Payment Methods Breakdown + Recent Transactions Card */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <PaymentMethodsChart />
            </div>

            <section
              aria-labelledby="recent-txns-heading"
              className="flex flex-col justify-between rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 sm:p-6 shadow-sm shadow-[#0070F3]/5 lg:col-span-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2
                    id="recent-txns-heading"
                    className="font-display text-base font-bold text-[#05080F]"
                  >
                    Recent Transactions
                  </h2>
                  <p className="mt-0.5 text-xs text-[#334155]">
                    Latest billing &amp; patient settlements
                  </p>
                </div>
                <Link
                  to="/dashboard/billing"
                  className="text-xs font-semibold text-[#0070F3] hover:underline whitespace-nowrap"
                >
                  Open Billing
                </Link>
              </div>

              <div className="mt-4 divide-y divide-[#E6EFFA]">
                {transactions.slice(0, 5).map((txn) => (
                  <button
                    key={txn.id}
                    type="button"
                    onClick={() => setSelectedTxn(txn)}
                    className="flex w-full items-center justify-between gap-3 py-3 text-left transition-colors hover:bg-[#F4F8FF] px-2 -mx-2 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#05080F]">
                        {txn.patientName}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#334155]">
                        <span className="font-mono">{txn.invoiceNo}</span> · {txn.method}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="font-mono text-sm font-semibold text-[#05080F] tabular-nums">
                        {formatINR(txn.amount)}
                      </span>
                      <StatusBadge status={txn.status} />
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Full Transaction History Table */}
          <section
            aria-labelledby="txn-history-heading"
            className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 sm:p-6 shadow-sm shadow-[#0070F3]/5"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2
                  id="txn-history-heading"
                  className="font-display text-lg font-semibold text-[#05080F]"
                >
                  Transaction History
                </h2>
                <p className="mt-0.5 text-xs text-[#334155]">
                  Showing {filteredTransactions.length} hospital payment records
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#334155]" />
                  <input
                    type="search"
                    value={txnSearch}
                    onChange={(e) => {
                      setTxnSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Filter by ID, patient, invoice..."
                    className="w-full sm:w-60 rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] py-1.5 pr-3 pl-8 text-xs text-[#05080F] placeholder-[#334155]/75 focus:border-[#0070F3] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-1">
                  {STATUS_FILTERS.map((st) => {
                    const active = statusFilter === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setStatusFilter(st);
                          setPage(1);
                        }}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                          active
                            ? 'bg-[#0070F3] text-white font-semibold'
                            : 'text-[#334155] hover:text-[#0070F3]'
                        }`}
                      >
                        {st}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              {paginatedTransactions.length === 0 ? (
                <EmptyState
                  title="No matching transactions"
                  description="No payment records match your current search query or status filter."
                  actionLabel="Clear Filters"
                  onAction={() => {
                    setTxnSearch('');
                    setStatusFilter('All');
                    setPage(1);
                  }}
                />
              ) : (
                <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#DCE8F7] text-xs text-[#334155]">
                      <th className="py-3 pr-4 font-medium">
                        <button
                          type="button"
                          onClick={() => toggleSort('id')}
                          className="inline-flex items-center gap-1 hover:text-[#0070F3]"
                        >
                          <span>Transaction ID</span>
                          <ArrowDownUp className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="py-3 px-4 font-medium">
                        <button
                          type="button"
                          onClick={() => toggleSort('patientName')}
                          className="inline-flex items-center gap-1 hover:text-[#0070F3]"
                        >
                          <span>Patient Name</span>
                          <ArrowDownUp className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="py-3 px-4 font-medium">Invoice No.</th>
                      <th className="py-3 px-4 font-medium">
                        <button
                          type="button"
                          onClick={() => toggleSort('date')}
                          className="inline-flex items-center gap-1 hover:text-[#0070F3]"
                        >
                          <span>Date</span>
                          <ArrowDownUp className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="py-3 px-4 font-medium">Method</th>
                      <th className="py-3 px-4 font-medium text-right">
                        <button
                          type="button"
                          onClick={() => toggleSort('amount')}
                          className="inline-flex items-center justify-end gap-1 hover:text-[#0070F3]"
                        >
                          <span>Amount</span>
                          <ArrowDownUp className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="py-3 pl-4 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E6EFFA] text-xs sm:text-sm">
                    {paginatedTransactions.map((txn) => (
                      <tr
                        key={txn.id}
                        onClick={() => setSelectedTxn(txn)}
                        className="cursor-pointer transition-colors hover:bg-[#F4F8FF]"
                      >
                        <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#0070F3] whitespace-nowrap">
                          {txn.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#05080F] whitespace-nowrap">
                          {txn.patientName}
                          <span className="ml-2 text-[11px] font-normal text-[#334155]">
                            {txn.department}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-[#334155] whitespace-nowrap">
                          {txn.invoiceNo}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#334155] whitespace-nowrap">
                          {txn.date} · {txn.time}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#05080F] whitespace-nowrap">
                          {txn.method}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-[#05080F] tabular-nums whitespace-nowrap">
                          {formatINR(txn.amount)}
                        </td>
                        <td className="py-3 pl-4 text-right whitespace-nowrap">
                          <StatusBadge status={txn.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Footer */}
            {filteredTransactions.length > 0 && (
              <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-[#E6EFFA] pt-4 text-xs text-[#334155] sm:flex-row">
                <p className="tabular-nums">
                  Page {safePage} of {totalPages} · {filteredTransactions.length} total transactions
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#DCE8F7] bg-[#F4F8FF] px-3 py-1.5 text-xs font-medium text-[#05080F] transition-colors hover:border-[#0070F3] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#DCE8F7] bg-[#F4F8FF] px-3 py-1.5 text-xs font-medium text-[#05080F] transition-colors hover:border-[#0070F3] disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* Transaction Detail Inspection Modal */}
      <Modal
        open={Boolean(selectedTxn)}
        onClose={() => setSelectedTxn(null)}
        title={selectedTxn ? `Transaction ${selectedTxn.id}` : 'Transaction Details'}
        subtitle={selectedTxn ? `${selectedTxn.invoiceNo} · ${selectedTxn.department}` : undefined}
      >
        {selectedTxn && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-4">
              <div>
                <p className="text-xs text-[#334155]">Settlement Amount</p>
                <p className="mt-1 font-mono text-2xl font-bold text-[#05080F] tabular-nums">
                  {formatINR(selectedTxn.amount)}
                </p>
              </div>
              <StatusBadge status={selectedTxn.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-3">
                <p className="text-[#334155]">Patient</p>
                <p className="mt-1 font-semibold text-[#05080F]">{selectedTxn.patientName}</p>
                <p className="font-mono text-[11px] text-[#0070F3]">{selectedTxn.patientId}</p>
              </div>
              <div className="rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-3">
                <p className="text-[#334155]">Payment Method</p>
                <p className="mt-1 font-semibold text-[#05080F]">{selectedTxn.method}</p>
                <p className="text-[11px] text-[#334155]">
                  {selectedTxn.date} · {selectedTxn.time}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTxn(null)}
                className="rounded-lg border border-[#DCE8F7] px-4 py-2 text-xs font-medium text-[#334155] hover:text-[#05080F]"
              >
                Close
              </button>
              <Link
                to="/dashboard/billing"
                onClick={() => setSelectedTxn(null)}
                className="rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005DD1]"
              >
                View in Billing
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
