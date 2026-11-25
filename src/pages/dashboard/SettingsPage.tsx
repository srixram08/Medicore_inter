import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save } from 'lucide-react';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { useToast } from '../../hooks/useToast';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function SettingsPage() {
  const { settings, updateSettings } = useHospitalStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();

  const [form, setForm] = useState(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    showToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Hospital profile and billing defaults updated.',
    });
  };

  const inputClass =
    'w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] px-3.5 py-2 text-sm text-[#05080F] focus:border-[#0070F3] focus:bg-white focus:outline-none';

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="space-y-6 max-w-4xl"
    >
      <div>
        <h1 className="font-display text-2xl font-bold text-[#05080F]">Settings</h1>
        <p className="mt-1 text-sm text-[#334155]">
          Configure hospital identity, GST tax defaults, and operational alert preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <section className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-6 space-y-4 shadow-sm shadow-[#0070F3]/5">
          <h2 className="font-display text-base font-semibold text-[#05080F]">
            Hospital Institution Details
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#05080F]">
                Hospital Display Name
              </label>
              <input
                type="text"
                value={form.hospitalName}
                onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#05080F]">
                Clinical Registration Code
              </label>
              <input
                type="text"
                value={form.registrationCode}
                onChange={(e) => setForm({ ...form, registrationCode: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-[#05080F]">
                Facility Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#05080F]">
                Contact Desk Phone
              </label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#05080F]">GSTIN</label>
              <input
                type="text"
                value={form.gstNumber}
                onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-6 space-y-4 shadow-sm shadow-[#0070F3]/5">
          <h2 className="font-display text-base font-semibold text-[#05080F]">
            Billing &amp; Notification Preferences
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#05080F]">
                Default Invoice GST (%)
              </label>
              <input
                type="number"
                min={0}
                max={28}
                value={form.defaultTaxPct}
                onChange={(e) =>
                  setForm({ ...form, defaultTaxPct: Math.max(0, Number(e.target.value) || 0) })
                }
                className={`${inputClass} font-mono`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#05080F]">
                Session Idle Timeout (mins)
              </label>
              <input
                type="number"
                min={15}
                max={240}
                value={form.sessionTimeoutMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sessionTimeoutMinutes: Math.max(15, Number(e.target.value) || 60),
                  })
                }
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-3.5">
              <div>
                <p className="text-xs font-semibold text-[#05080F]">
                  Automated Pharmacy Low-Stock Alerts
                </p>
                <p className="text-[11px] text-[#334155]">
                  Notify administrators when any medication falls below its reorder threshold.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.lowStockAlerts}
                onChange={(e) => setForm({ ...form, lowStockAlerts: e.target.checked })}
                className="h-4 w-4 accent-[#0070F3]"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-3.5">
              <div>
                <p className="text-xs font-semibold text-[#05080F]">
                  Auto-Dispatch Payment Receipts
                </p>
                <p className="text-[11px] text-[#334155]">
                  Send digital INR receipt summaries upon full invoice settlement.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.paymentReceiptsAutoEmail}
                onChange={(e) =>
                  setForm({ ...form, paymentReceiptsAutoEmail: e.target.checked })
                }
                className="h-4 w-4 accent-[#0070F3]"
              />
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0070F3] px-5 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0070F3]/20 transition-colors hover:bg-[#005DD1]"
          >
            <Save className="h-4 w-4" />
            Save Configuration
          </button>
        </div>
      </form>
    </motion.div>
  );
}
