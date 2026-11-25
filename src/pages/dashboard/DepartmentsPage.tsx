import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BedDouble, Building2, SlidersHorizontal, Stethoscope } from 'lucide-react';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { useToast } from '../../hooks/useToast';
import { DepartmentRecord } from '../../data/mockHospitalData';
import { Modal } from '../../components/ui/Modal';
import { formatINRCompact } from '../../lib/formatters';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function DepartmentsPage() {
  const { departments, updateDepartmentBeds } = useHospitalStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();

  const [editingDept, setEditingDept] = useState<DepartmentRecord | null>(null);
  const [occupiedInput, setOccupiedInput] = useState('0');

  const openBedModal = (dept: DepartmentRecord) => {
    setEditingDept(dept);
    setOccupiedInput(String(dept.occupiedBeds));
  };

  const handleUpdateBeds = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    const val = Math.max(0, Math.min(editingDept.totalBeds, Number(occupiedInput) || 0));
    updateDepartmentBeds(editingDept.id, val);
    showToast({
      type: 'success',
      title: 'Ward Occupancy Updated',
      message: `${editingDept.name}: ${val} of ${editingDept.totalBeds} beds occupied.`,
    });
    setEditingDept(null);
  };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-[#05080F]">Departments</h1>
        <p className="mt-1 text-sm text-[#334155]">
          Clinical unit capacity, ward bed occupancy, and department leadership.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {departments.map((dept) => {
          const pct = Math.round((dept.occupiedBeds / dept.totalBeds) * 100);
          const barColor =
            pct >= 85 ? 'bg-[#E11D48]' : pct >= 70 ? 'bg-[#F59E0B]' : 'bg-[#0070F3]';
          const available = dept.totalBeds - dept.occupiedBeds;

          return (
            <div
              key={dept.id}
              className="flex flex-col justify-between rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 shadow-sm shadow-[#0070F3]/5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-display text-base font-semibold text-[#05080F]">
                      {dept.name}
                    </h2>
                    <p className="mt-0.5 text-[11px] text-[#334155]">{dept.floor}</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] text-[#0070F3]">
                    <Building2 className="h-4 w-4" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#334155]">
                  Head: <span className="font-medium text-[#05080F]">{dept.headDoctor}</span>
                </p>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="inline-flex items-center gap-1 text-[#334155]">
                      <BedDouble className="h-3.5 w-3.5 text-[#0070F3]" />
                      Ward Occupancy
                    </span>
                    <span className="font-mono font-semibold text-[#05080F] tabular-nums">
                      {dept.occupiedBeds}/{dept.totalBeds} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#EBF4FF]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-[#0D9F6E] tabular-nums">
                    {available} beds available
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[#E6EFFA] pt-3 text-xs">
                  <div>
                    <span className="text-[#334155]">Doctors</span>
                    <p className="mt-0.5 flex items-center gap-1 font-mono font-semibold text-[#05080F]">
                      <Stethoscope className="h-3 w-3 text-[#0070F3]" />
                      {dept.activeDoctors}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#334155]">Monthly Rev.</span>
                    <p className="mt-0.5 font-mono font-semibold text-[#05080F] tabular-nums">
                      {formatINRCompact(dept.monthlyRevenue)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openBedModal(dept)}
                className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] px-3 py-2 text-xs font-medium text-[#05080F] transition-colors hover:border-[#0070F3] hover:text-[#0070F3]"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Manage Ward Beds
              </button>
            </div>
          );
        })}
      </div>

      <Modal
        open={Boolean(editingDept)}
        onClose={() => setEditingDept(null)}
        title={editingDept ? `Manage Beds · ${editingDept.name}` : 'Manage Ward Beds'}
        subtitle={
          editingDept
            ? `Total licensed capacity: ${editingDept.totalBeds} beds`
            : undefined
        }
      >
        {editingDept && (
          <form onSubmit={handleUpdateBeds} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#05080F]">
                Occupied Beds (0 – {editingDept.totalBeds})
              </label>
              <input
                type="number"
                min={0}
                max={editingDept.totalBeds}
                value={occupiedInput}
                onChange={(e) => setOccupiedInput(e.target.value)}
                className="w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] px-3.5 py-2.5 text-sm font-mono text-[#05080F] focus:border-[#0070F3] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEditingDept(null)}
                className="rounded-lg border border-[#DCE8F7] px-4 py-2 text-xs font-medium text-[#334155] hover:text-[#05080F]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005DD1]"
              >
                Save Bed Count
              </button>
            </div>
          </form>
        )}
      </Modal>
    </motion.div>
  );
}
