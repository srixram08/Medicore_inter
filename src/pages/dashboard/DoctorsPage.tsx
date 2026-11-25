import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Phone, Plus, Search, Stethoscope, UserPlus } from 'lucide-react';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { useToast } from '../../hooks/useToast';
import { DoctorRecord } from '../../data/mockHospitalData';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/StateViews';
import { formatINR } from '../../lib/formatters';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const AVAILABILITY_CYCLE: DoctorRecord['availability'][] = [
  'Available',
  'OPD Active',
  'In Surgery',
  'On Leave',
];

export default function DoctorsPage() {
  const { doctors, addDoctor, toggleDoctorAvailability } = useHospitalStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();

  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [fee, setFee] = useState('1000');
  const [experienceYears, setExperienceYears] = useState('10');
  const [shift, setShift] = useState('09:00 AM – 05:00 PM');
  const [phone, setPhone] = useState('+91 ');
  const [error, setError] = useState('');

  const departments = useMemo(
    () => ['All', ...Array.from(new Set(doctors.map((d) => d.department)))],
    [doctors]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter((d) => {
      const matchDept = deptFilter === 'All' || d.department === deptFilter;
      const matchQ =
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialization.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q);
      return matchDept && matchQ;
    });
  }, [doctors, query, deptFilter]);

  const handleCycleAvailability = (doc: DoctorRecord) => {
    const idx = AVAILABILITY_CYCLE.indexOf(doc.availability);
    const next = AVAILABILITY_CYCLE[(idx + 1) % AVAILABILITY_CYCLE.length];
    toggleDoctorAvailability(doc.id, next);
    showToast({
      type: 'info',
      title: 'Roster Status Updated',
      message: `${doc.name} is now marked ${next}.`,
    });
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !specialization.trim()) {
      setError('Doctor name and specialization are required.');
      return;
    }
    const feeVal = Number(fee);
    if (!Number.isFinite(feeVal) || feeVal <= 0) {
      setError('Enter a valid consultation fee in INR.');
      return;
    }

    const created = addDoctor({
      name: name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
      specialization: specialization.trim(),
      department,
      availability: 'Available',
      fee: feeVal,
      experienceYears: Math.max(1, Number(experienceYears) || 5),
      shift,
      phone: phone.trim() || '+91 98400 10999',
    });

    showToast({
      type: 'success',
      title: 'Doctor Added to Roster',
      message: `${created.name} added to ${created.department}.`,
    });
    setModalOpen(false);
    setName('');
    setSpecialization('');
    setError('');
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
          <h1 className="font-display text-2xl font-bold text-[#05080F]">Doctors &amp; Staff</h1>
          <p className="mt-1 text-sm text-[#334155]">
            Consultants, surgical robotics specialists, consultation fees, and live shift availability.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0070F3] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0070F3]/20 transition-colors hover:bg-[#005DD1] whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-4 shadow-sm shadow-[#0070F3]/5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#334155]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search doctors or specializations..."
            className="w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] py-2 pr-3 pl-9 text-xs sm:text-sm text-[#05080F] placeholder-[#334155]/75 focus:border-[#0070F3] focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          aria-label="Filter doctors by department"
          className="rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] px-3 py-2 text-xs text-[#05080F] focus:border-[#0070F3] focus:outline-none"
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === 'All' ? 'All Departments' : d}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No clinicians match your filter"
          description="Try selecting another department or add a new specialist to the roster."
          actionLabel="Add Doctor"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="flex flex-col justify-between rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 shadow-sm shadow-[#0070F3]/5 transition-colors hover:border-[#93C5FD]"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] text-[#0070F3]">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-base font-semibold text-[#05080F]">
                        {doc.name}
                      </h2>
                      <p className="truncate text-xs font-medium text-[#0070F3]">
                        {doc.specialization}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={doc.availability} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#E6EFFA] pt-4 text-xs">
                  <div>
                    <p className="text-[#334155]">Department</p>
                    <p className="mt-0.5 font-medium text-[#05080F]">{doc.department}</p>
                  </div>
                  <div>
                    <p className="text-[#334155]">Consultation Fee</p>
                    <p className="mt-0.5 font-mono font-semibold text-[#0D9F6E] tabular-nums">
                      {formatINR(doc.fee)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[#334155]">Experience</p>
                    <p className="mt-0.5 font-medium text-[#05080F] tabular-nums">
                      {doc.experienceYears} years
                    </p>
                  </div>
                  <div>
                    <p className="text-[#334155]">Patients Today</p>
                    <p className="mt-0.5 font-mono font-medium text-[#05080F] tabular-nums">
                      {doc.patientsToday} visits
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#E6EFFA] pt-3.5 text-xs">
                <div className="flex items-center gap-3 text-[#334155] truncate">
                  <span className="inline-flex items-center gap-1 truncate">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {doc.shift}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCycleAvailability(doc)}
                  className="shrink-0 rounded-lg border border-[#DCE8F7] bg-[#F4F8FF] px-2.5 py-1.5 text-[11px] font-medium text-[#05080F] transition-colors hover:border-[#0070F3] hover:text-[#0070F3]"
                >
                  Update Status
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Doctor Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Specialist Doctor"
        subtitle="Add a consultant to the active hospital roster."
      >
        <form onSubmit={handleAddDoctor} className="space-y-4">
          {error && (
            <p className="rounded-lg border border-[#FECDD3] bg-[#FFF1F2] px-3 py-2 text-xs text-[#E11D48]">
              {error}
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Doctor Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Anirudh Kulkarni"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#05080F]">
                Specialization
              </label>
              <input
                type="text"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                placeholder="e.g. Robotic Cardiac Surgery"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={inputClass}
              >
                {[
                  'Cardiology',
                  'Orthopedics',
                  'Neurology',
                  'Pediatrics',
                  'Oncology',
                  'General Medicine',
                  'Emergency & Trauma',
                  'Gynecology',
                ].map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">
                Consultation Fee (₹)
              </label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">
                Experience (Years)
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Shift</label>
              <input
                type="text"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#05080F]">
                Extension / Contact
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#334155]" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] py-2 pr-3 pl-9 text-sm text-[#05080F] focus:border-[#0070F3] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-[#DCE8F7] px-4 py-2 text-xs font-medium text-[#334155] hover:text-[#05080F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005DD1]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Roster</span>
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
