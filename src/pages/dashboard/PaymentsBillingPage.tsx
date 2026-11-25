import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { IndianRupee, Plus, Printer, Trash2 } from 'lucide-react';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { useToast } from '../../hooks/useToast';
import { InvoiceLineItem, InvoiceRecord, PaymentMethod } from '../../data/mockHospitalData';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { formatINR } from '../../lib/formatters';
import { useReducedMotion } from '../../hooks/useReducedMotion';

function calcInvoiceTotal(inv: Pick<InvoiceRecord, 'lineItems' | 'discountPct' | 'taxPct'>) {
  const subtotal = inv.lineItems.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
  const discounted = subtotal * (1 - inv.discountPct / 100);
  const total = Math.round(discounted * (1 + inv.taxPct / 100));
  return { subtotal, total };
}

export default function PaymentsBillingPage() {
  const { invoices, patients, createInvoice, recordInvoicePayment, settings } =
    useHospitalStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();

  const [createOpen, setCreateOpen] = useState(false);
  const [payTarget, setPayTarget] = useState<InvoiceRecord | null>(null);
  const [printTarget, setPrintTarget] = useState<InvoiceRecord | null>(null);

  const [patientId, setPatientId] = useState(patients[0]?.id || 'PT-1041');
  const [department, setDepartment] = useState('Cardiology');
  const [discountPct, setDiscountPct] = useState('0');
  const [taxPct, setTaxPct] = useState(String(settings.defaultTaxPct));
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [initialPaid, setInitialPaid] = useState('0');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: '1', description: 'Specialist Consultation', qty: 1, unitPrice: 1200 },
  ]);

  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');

  const draftTotals = useMemo(() => {
    return calcInvoiceTotal({
      lineItems,
      discountPct: Math.max(0, Math.min(50, Number(discountPct) || 0)),
      taxPct: Math.max(0, Math.min(28, Number(taxPct) || 0)),
    });
  }, [lineItems, discountPct, taxPct]);

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      { id: String(Date.now()), description: 'Diagnostic Lab Panel', qty: 1, unitPrice: 1500 },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === patientId) || patients[0];
    const paid = Math.max(0, Math.min(draftTotals.total, Number(initialPaid) || 0));
    const status =
      paid >= draftTotals.total ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending';

    const created = createInvoice({
      patientName: patient.name,
      patientId: patient.id,
      dueDate: '30 Nov 2026',
      department,
      lineItems,
      discountPct: Number(discountPct) || 0,
      taxPct: Number(taxPct) || 0,
      paidAmount: paid,
      status,
      method,
    });

    showToast({
      type: 'success',
      title: `Invoice ${created.invoiceNo} Created`,
      message: `Total ${formatINR(draftTotals.total)} billed to ${patient.name}.`,
    });
    setCreateOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payTarget) return;
    const amt = Number(payAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid amount',
        message: 'Enter a positive INR payment amount.',
      });
      return;
    }

    recordInvoicePayment(payTarget.id, amt, payMethod);
    showToast({
      type: 'success',
      title: 'Payment Recorded',
      message: `${formatINR(amt)} applied to ${payTarget.invoiceNo} via ${payMethod}.`,
    });
    setPayTarget(null);
  };

  const inputClass =
    'w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] px-3 py-2 text-sm text-[#05080F] focus:border-[#0070F3] focus:bg-white focus:outline-none';

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#05080F]">
            Payments &amp; Billing
          </h1>
          <p className="mt-1 text-sm text-[#334155]">
            Itemized hospital invoices, partial settlements, GST calculation, and printable receipts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setInitialPaid('0');
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0070F3] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0070F3]/20 transition-colors hover:bg-[#005DD1] whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 shadow-sm shadow-[#0070F3]/5 overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#DCE8F7] text-xs text-[#334155]">
              <th className="py-3 pr-4 font-medium">Invoice No.</th>
              <th className="py-3 px-4 font-medium">Patient</th>
              <th className="py-3 px-4 font-medium">Department</th>
              <th className="py-3 px-4 font-medium text-right">Total</th>
              <th className="py-3 px-4 font-medium text-right">Paid</th>
              <th className="py-3 px-4 font-medium text-right">Balance</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 pl-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6EFFA] text-xs sm:text-sm">
            {invoices.map((inv) => {
              const { total } = calcInvoiceTotal(inv);
              const balance = Math.max(0, total - inv.paidAmount);
              return (
                <tr key={inv.id} className="hover:bg-[#F4F8FF]">
                  <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#0070F3] whitespace-nowrap">
                    {inv.invoiceNo}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#05080F] whitespace-nowrap">
                    {inv.patientName}
                    <span className="ml-2 font-mono text-[11px] text-[#334155]">
                      {inv.patientId}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#334155] whitespace-nowrap">
                    {inv.department}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#05080F] tabular-nums whitespace-nowrap">
                    {formatINR(total)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#0D9F6E] tabular-nums whitespace-nowrap">
                    {formatINR(inv.paidAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-[#D97706] tabular-nums whitespace-nowrap">
                    {formatINR(balance)}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-3 pl-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {balance > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setPayTarget(inv);
                            setPayAmount(String(balance));
                            setPayMethod(inv.method);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] px-2.5 py-1 text-[11px] font-semibold text-[#047857] hover:bg-[#D1FAE5]"
                        >
                          <IndianRupee className="h-3 w-3" />
                          Record Payment
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setPrintTarget(inv)}
                        aria-label={`Print invoice ${inv.invoiceNo}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#DCE8F7] bg-[#F4F8FF] px-2.5 py-1 text-[11px] font-medium text-[#05080F] hover:border-[#0070F3] hover:text-[#0070F3]"
                      >
                        <Printer className="h-3 w-3" />
                        Print
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Itemized Hospital Invoice"
        subtitle="Configure billable procedures, discount, GST, and initial payment."
        maxWidthClass="max-w-2xl"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Patient</label>
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className={inputClass}
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClass}
              >
                {['Cardiology', 'Orthopedics', 'Neurology', 'Oncology', 'Diagnostics', 'General Medicine'].map(
                  (d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#05080F]">Line Items</span>
              <button
                type="button"
                onClick={addLineItem}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0070F3] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>

            {lineItems.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    setLineItems((prev) =>
                      prev.map((li, i) => (i === idx ? { ...li, description: e.target.value } : li))
                    )
                  }
                  placeholder="Service description"
                  className="col-span-6 rounded-lg border border-[#CFE0F5] bg-[#F4F8FF] px-2.5 py-1.5 text-xs text-[#05080F] focus:border-[#0070F3] focus:bg-white focus:outline-none"
                />
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) =>
                    setLineItems((prev) =>
                      prev.map((li, i) =>
                        i === idx ? { ...li, qty: Math.max(1, Number(e.target.value) || 1) } : li
                      )
                    )
                  }
                  className="col-span-2 rounded-lg border border-[#CFE0F5] bg-[#F4F8FF] px-2.5 py-1.5 text-xs text-[#05080F] focus:border-[#0070F3] focus:bg-white focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  value={item.unitPrice}
                  onChange={(e) =>
                    setLineItems((prev) =>
                      prev.map((li, i) =>
                        i === idx
                          ? { ...li, unitPrice: Math.max(0, Number(e.target.value) || 0) }
                          : li
                      )
                    )
                  }
                  className="col-span-3 rounded-lg border border-[#CFE0F5] bg-[#F4F8FF] px-2.5 py-1.5 text-xs font-mono text-[#05080F] focus:border-[#0070F3] focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => removeLineItem(item.id)}
                  aria-label="Remove line item"
                  className="col-span-1 flex justify-center text-[#334155] hover:text-[#E11D48]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Discount (%)</label>
              <input
                type="number"
                min={0}
                max={50}
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                className="w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] px-3 py-1.5 text-xs text-[#05080F]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">GST (%)</label>
              <input
                type="number"
                min={0}
                max={28}
                value={taxPct}
                onChange={(e) => setTaxPct(e.target.value)}
                className="w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] px-3 py-1.5 text-xs text-[#05080F]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">
                Initial Paid (₹)
              </label>
              <input
                type="number"
                min={0}
                value={initialPaid}
                onChange={(e) => setInitialPaid(e.target.value)}
                className="w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] px-3 py-1.5 text-xs font-mono text-[#05080F]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Method</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] px-2.5 py-1.5 text-xs text-[#05080F]"
              >
                {['UPI', 'Card', 'Insurance', 'Bank Transfer', 'Cash'].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-4 text-xs">
            <span className="text-[#334155]">Subtotal {formatINR(draftTotals.subtotal)}</span>
            <span className="font-mono text-base font-bold text-[#0070F3] tabular-nums">
              Grand Total: {formatINR(draftTotals.total)}
            </span>
          </div>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-[#DCE8F7] px-4 py-2 text-xs font-medium text-[#334155] hover:text-[#05080F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005DD1]"
            >
              Generate Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        open={Boolean(payTarget)}
        onClose={() => setPayTarget(null)}
        title={payTarget ? `Record Payment · ${payTarget.invoiceNo}` : 'Record Payment'}
        subtitle={payTarget ? `Patient: ${payTarget.patientName}` : undefined}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#05080F]">
              Payment Amount (₹)
            </label>
            <input
              type="number"
              min={1}
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[#05080F]">Payment Method</label>
            <select
              value={payMethod}
              onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
              className={inputClass}
            >
              {['UPI', 'Card', 'Insurance', 'Bank Transfer', 'Cash'].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setPayTarget(null)}
              className="rounded-lg border border-[#DCE8F7] px-4 py-2 text-xs font-medium text-[#334155] hover:text-[#05080F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#0D9F6E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#059669]"
            >
              Confirm Settlement
            </button>
          </div>
        </form>
      </Modal>

      {/* Print Preview Modal */}
      <Modal
        open={Boolean(printTarget)}
        onClose={() => setPrintTarget(null)}
        title="Printable Invoice Preview"
        maxWidthClass="max-w-xl"
      >
        {printTarget && (
          <div className="space-y-5">
            <div className="rounded-xl border border-[#DCE8F7] bg-white p-6 text-[#05080F]">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#05080F]">
                    {settings.hospitalName}
                  </h3>
                  <p className="text-xs text-[#334155]">{settings.address}</p>
                  <p className="font-mono text-[11px] text-[#334155]">
                    GSTIN: {settings.gstNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-[#0070F3]">
                    {printTarget.invoiceNo}
                  </p>
                  <p className="text-xs text-[#334155]">Date: {printTarget.date}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-between text-xs">
                <div>
                  <p className="text-[#334155]">Billed To</p>
                  <p className="font-semibold text-[#05080F]">{printTarget.patientName}</p>
                  <p className="font-mono text-[#334155]">{printTarget.patientId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#334155]">Department</p>
                  <p className="font-semibold text-[#05080F]">{printTarget.department}</p>
                  <p className="text-[#334155]">Method: {printTarget.method}</p>
                </div>
              </div>

              <table className="mt-5 w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[#334155]">
                    <th className="py-2 text-left">Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {printTarget.lineItems.map((li) => (
                    <tr key={li.id}>
                      <td className="py-2 font-medium text-[#05080F]">{li.description}</td>
                      <td className="py-2 text-right font-mono">{li.qty}</td>
                      <td className="py-2 text-right font-mono">
                        {formatINR(li.qty * li.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 border-t border-slate-200 pt-3 text-right text-xs space-y-1">
                <p className="text-[#334155]">
                  Discount ({printTarget.discountPct}%) · GST ({printTarget.taxPct}%)
                </p>
                <p className="font-mono text-base font-bold text-[#05080F]">
                  Total: {formatINR(calcInvoiceTotal(printTarget).total)}
                </p>
                <p className="font-mono font-semibold text-[#0D9F6E]">
                  Paid: {formatINR(printTarget.paidAmount)}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 no-print">
              <button
                type="button"
                onClick={() => setPrintTarget(null)}
                className="rounded-lg border border-[#DCE8F7] px-4 py-2 text-xs font-medium text-[#334155] hover:text-[#05080F]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005DD1]"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
