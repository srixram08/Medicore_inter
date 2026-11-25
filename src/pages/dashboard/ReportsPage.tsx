import { useState } from 'react';
import { motion } from 'motion/react';
import { Download, Eye, FileBarChart2 } from 'lucide-react';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { useToast } from '../../hooks/useToast';
import { exportToCSV, formatINR } from '../../lib/formatters';
import { Modal } from '../../components/ui/Modal';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  cadence: string;
  rowsCount: number;
  buildRows: () => Record<string, string | number>[];
}

export default function ReportsPage() {
  const { transactions, patients, departments, pharmacy } = useHospitalStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();

  const [period, setPeriod] = useState('Nov 2026 (Current Cycle)');
  const [previewReport, setPreviewReport] = useState<{
    title: string;
    rows: Record<string, string | number>[];
  } | null>(null);

  const reports: ReportDefinition[] = [
    {
      id: 'rep-fin',
      title: 'Hospital Payment & Settlement Ledger',
      description:
        'Complete itemized log of UPI, Card, Insurance, Bank Transfer, and Cash settlements.',
      cadence: 'Daily / Monthly',
      rowsCount: transactions.length,
      buildRows: () =>
        transactions.map((t) => ({
          TransactionID: t.id,
          Patient: t.patientName,
          Invoice: t.invoiceNo,
          Date: t.date,
          Method: t.method,
          AmountINR: t.amount,
          Status: t.status,
          Department: t.department,
        })),
    },
    {
      id: 'rep-pat',
      title: 'Patient Admissions & Outpatient Census',
      description:
        'Active inpatient admissions, discharges, critical flags, and attending physician roster.',
      cadence: 'Weekly Census',
      rowsCount: patients.length,
      buildRows: () =>
        patients.map((p) => ({
          PatientID: p.id,
          Name: p.name,
          Age: p.age,
          Gender: p.gender,
          Department: p.department,
          Doctor: p.doctor,
          Status: p.status,
          Registered: p.regDate,
        })),
    },
    {
      id: 'rep-dept',
      title: 'Ward Occupancy & Departmental Revenue',
      description:
        'Licensed bed capacity, active occupancy percentages, and monthly revenue per clinical unit.',
      cadence: 'Monthly Executive',
      rowsCount: departments.length,
      buildRows: () =>
        departments.map((d) => ({
          Department: d.name,
          Head: d.headDoctor,
          OccupiedBeds: d.occupiedBeds,
          TotalBeds: d.totalBeds,
          OccupancyPct: `${Math.round((d.occupiedBeds / d.totalBeds) * 100)}%`,
          MonthlyRevenueINR: d.monthlyRevenue,
        })),
    },
    {
      id: 'rep-pharm',
      title: 'Pharmacy Formulary & Reorder Audit',
      description:
        'Current unit stock counts, reorder thresholds, unit pricing, and batch expiration dates.',
      cadence: 'Inventory Audit',
      rowsCount: pharmacy.length,
      buildRows: () =>
        pharmacy.map((m) => ({
          Medicine: m.name,
          Category: m.category,
          Batch: m.batchNo,
          Stock: m.stock,
          ReorderLevel: m.reorderLevel,
          UnitPriceINR: m.unitPrice,
          Expiry: m.expiryDate,
        })),
    },
  ];

  const handleDownload = (rep: ReportDefinition) => {
    const rows = rep.buildRows();
    exportToCSV(`${rep.id}-medicore-nov-2026.csv`, rows);
    showToast({
      type: 'success',
      title: 'CSV Report Downloaded',
      message: `${rep.title} (${rows.length} rows) exported.`,
    });
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#05080F]">Reports</h1>
          <p className="mt-1 text-sm text-[#334155]">
            Preview and export clinical, census, and financial ledger datasets as CSV.
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="Report period"
          className="rounded-xl border border-[#CFE0F5] bg-white px-3.5 py-2 text-xs text-[#05080F] focus:border-[#0070F3] focus:outline-none"
        >
          <option>Nov 2026 (Current Cycle)</option>
          <option>Oct 2026 (Closed)</option>
          <option>Q3 2026 Consolidated</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="flex flex-col justify-between rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-6 shadow-sm shadow-[#0070F3]/5"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] text-[#0070F3]">
                  <FileBarChart2 className="h-5 w-5" />
                </div>
                <span className="font-mono text-[11px] text-[#334155]">
                  {rep.cadence} · {rep.rowsCount} rows
                </span>
              </div>

              <h2 className="mt-4 font-display text-base font-semibold text-[#05080F]">
                {rep.title}
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#334155]">{rep.description}</p>
            </div>

            <div className="mt-5 flex items-center gap-2.5 border-t border-[#E6EFFA] pt-4">
              <button
                type="button"
                onClick={() =>
                  setPreviewReport({ title: rep.title, rows: rep.buildRows().slice(0, 5) })
                }
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] px-3.5 py-2 text-xs font-medium text-[#05080F] transition-colors hover:border-[#0070F3] hover:text-[#0070F3]"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => handleDownload(rep)}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0070F3] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#005DD1]"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      <Modal
        open={Boolean(previewReport)}
        onClose={() => setPreviewReport(null)}
        title={previewReport?.title || 'Report Preview'}
        subtitle={`Period: ${period} · Sample of first 5 rows`}
        maxWidthClass="max-w-3xl"
      >
        {previewReport && previewReport.rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[#DCE8F7] text-[#334155]">
                  {Object.keys(previewReport.rows[0]).map((col) => (
                    <th key={col} className="py-2 pr-4 font-medium whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EFFA]">
                {previewReport.rows.map((row, idx) => (
                  <tr key={idx}>
                    {Object.entries(row).map(([k, val]) => (
                      <td key={k} className="py-2.5 pr-4 font-mono text-[#05080F] whitespace-nowrap">
                        {k.includes('INR') ? formatINR(Number(val)) : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
