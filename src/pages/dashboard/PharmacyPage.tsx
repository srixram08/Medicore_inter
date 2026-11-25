import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { PackagePlus, Plus, Search } from 'lucide-react';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { useToast } from '../../hooks/useToast';
import { PharmacyItem } from '../../data/mockHospitalData';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/StateViews';
import { formatINR } from '../../lib/formatters';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function PharmacyPage() {
  const { pharmacy, restockMedicine, addMedicine } = useHospitalStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();

  const [query, setQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [restockTarget, setRestockTarget] = useState<PharmacyItem | null>(null);
  const [restockQty, setRestockQty] = useState('100');

  const [addOpen, setAddOpen] = useState(false);
  const [medName, setMedName] = useState('');
  const [medCategory, setMedCategory] = useState('Cardiovascular');
  const [medBatch, setMedBatch] = useState('BT-9920M');
  const [medStock, setMedStock] = useState('150');
  const [medReorder, setMedReorder] = useState('60');
  const [medUnit, setMedUnit] = useState('Strips');
  const [medPrice, setMedPrice] = useState('220');
  const [medExpiry, setMedExpiry] = useState('Dec 2027');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pharmacy.filter((item) => {
      const isLow = item.stock <= item.reorderLevel;
      if (lowStockOnly && !isLow) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.batchNo.toLowerCase().includes(q)
      );
    });
  }, [pharmacy, query, lowStockOnly]);

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockTarget) return;
    const qty = Math.max(1, Number(restockQty) || 0);
    restockMedicine(restockTarget.id, qty);
    showToast({
      type: 'success',
      title: 'Inventory Restocked',
      message: `Added ${qty} ${restockTarget.unit} to ${restockTarget.name}.`,
    });
    setRestockTarget(null);
  };

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;
    addMedicine({
      name: medName.trim(),
      category: medCategory,
      batchNo: medBatch,
      stock: Math.max(0, Number(medStock) || 0),
      reorderLevel: Math.max(10, Number(medReorder) || 50),
      unit: medUnit,
      unitPrice: Math.max(1, Number(medPrice) || 100),
      expiryDate: medExpiry,
    });
    showToast({
      type: 'success',
      title: 'Medication Added',
      message: `${medName.trim()} added to hospital pharmacy catalog.`,
    });
    setAddOpen(false);
    setMedName('');
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
            Pharmacy &amp; Inventory
          </h1>
          <p className="mt-1 text-sm text-[#334155]">
            Automated dispensary stock levels, batch expiry tracking, and reorder alerts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0070F3] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0070F3]/20 transition-colors hover:bg-[#005DD1] whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-4 shadow-sm shadow-[#0070F3]/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#334155]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medication, category, batch..."
            className="w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] py-2 pr-3 pl-9 text-xs sm:text-sm text-[#05080F] placeholder-[#334155]/75 focus:border-[#0070F3] focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => setLowStockOnly((v) => !v)}
          aria-pressed={lowStockOnly}
          className={`rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
            lowStockOnly
              ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]'
              : 'border-[#DCE8F7] bg-[#F4F8FF] text-[#334155] hover:text-[#0070F3]'
          }`}
        >
          {lowStockOnly ? 'Showing Low Stock Only' : 'Filter Low Stock Alerts'}
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 shadow-sm shadow-[#0070F3]/5 overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState
            title="No inventory items found"
            description="Adjust your search query or disable the low-stock filter."
            actionLabel="Reset Filter"
            onAction={() => {
              setQuery('');
              setLowStockOnly(false);
            }}
          />
        ) : (
          <table className="w-full min-w-[780px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#DCE8F7] text-xs text-[#334155]">
                <th className="py-3 pr-4 font-medium">Medication</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Batch</th>
                <th className="py-3 px-4 font-medium text-right">Stock</th>
                <th className="py-3 px-4 font-medium text-right">Unit Price</th>
                <th className="py-3 px-4 font-medium">Expiry</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 pl-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EFFA] text-xs sm:text-sm">
              {filtered.map((item) => {
                const status =
                  item.stock <= item.reorderLevel * 0.65
                    ? 'Critical'
                    : item.stock <= item.reorderLevel
                    ? 'Low Stock'
                    : 'In Stock';

                return (
                  <tr key={item.id} className="hover:bg-[#F4F8FF]">
                    <td className="py-3 pr-4 font-medium text-[#05080F] whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#334155] whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#334155] whitespace-nowrap">
                      {item.batchNo}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#05080F] tabular-nums whitespace-nowrap">
                      {item.stock} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#05080F] tabular-nums whitespace-nowrap">
                      {formatINR(item.unitPrice)}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#334155] whitespace-nowrap">
                      {item.expiryDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={status} />
                    </td>
                    <td className="py-3 pl-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          setRestockTarget(item);
                          setRestockQty('100');
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-semibold text-[#0070F3] hover:bg-[#DBEAFE]"
                      >
                        <PackagePlus className="h-3 w-3" />
                        Restock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Restock Modal */}
      <Modal
        open={Boolean(restockTarget)}
        onClose={() => setRestockTarget(null)}
        title={restockTarget ? `Restock ${restockTarget.name}` : 'Restock'}
        subtitle={
          restockTarget
            ? `Current inventory: ${restockTarget.stock} ${restockTarget.unit}`
            : undefined
        }
      >
        <form onSubmit={handleRestock} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#05080F]">
              Units to Add ({restockTarget?.unit})
            </label>
            <input
              type="number"
              min={1}
              value={restockQty}
              onChange={(e) => setRestockQty(e.target.value)}
              className={`${inputClass} font-mono`}
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setRestockTarget(null)}
              className="rounded-lg border border-[#DCE8F7] px-4 py-2 text-xs font-medium text-[#334155] hover:text-[#05080F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005DD1]"
            >
              Confirm Restock
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Medicine Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Pharmacy Item"
        subtitle="Register a new medicine or surgical consumable."
      >
        <form onSubmit={handleAddMedicine} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-medium text-[#05080F]">
              Medication Name
            </label>
            <input
              type="text"
              required
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Metformin 500mg SR"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Category</label>
              <input
                type="text"
                value={medCategory}
                onChange={(e) => setMedCategory(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Batch No.</label>
              <input
                type="text"
                value={medBatch}
                onChange={(e) => setMedBatch(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Initial Stock</label>
              <input
                type="number"
                value={medStock}
                onChange={(e) => setMedStock(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Unit</label>
              <input
                type="text"
                value={medUnit}
                onChange={(e) => setMedUnit(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Unit Price (₹)</label>
              <input
                type="number"
                value={medPrice}
                onChange={(e) => setMedPrice(e.target.value)}
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Expiry</label>
              <input
                type="text"
                value={medExpiry}
                onChange={(e) => setMedExpiry(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="rounded-lg border border-[#DCE8F7] px-4 py-2 text-xs font-medium text-[#334155]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005DD1]"
            >
              Save Item
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
