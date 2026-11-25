import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Edit3, Eye, Phone, Plus, Search, UserPlus, X } from 'lucide-react';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { useToast } from '../../hooks/useToast';
import { PatientRecord } from '../../data/mockHospitalData';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/StateViews';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const DEPARTMENTS = [
  'All',
  'Cardiology',
  'Orthopedics',
  'Neurology',
  'Pediatrics',
  'Oncology',
  'Emergency & Trauma',
  'General Medicine',
  'Gynecology',
  'Diagnostics',
];

const STATUSES: Array<'All' | PatientRecord['status']> = [
  'All',
  'Admitted',
  'Outpatient',
  'Discharged',
  'Critical',
];

export default function PatientsPage() {
  const { patients, addPatient, updatePatient, doctors } = useHospitalStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | PatientRecord['status']>('All');

  const [drawerPatient, setDrawerPatient] = useState<PatientRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formAge, setFormAge] = useState('35');
  const [formGender, setFormGender] = useState<PatientRecord['gender']>('Male');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('Cardiology');
  const [formBlood, setFormBlood] = useState('O+');
  const [formStatus, setFormStatus] = useState<PatientRecord['status']>('Outpatient');
  const [formDoctor, setFormDoctor] = useState(doctors[0]?.name || 'Dr. Raghavendra Rao');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      const found = patients.find((p) => p.id === selectedId);
      if (found) setDrawerPatient(found);
    }
  }, [searchParams, patients]);

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    return patients.filter((p) => {
      const matchDept = deptFilter === 'All' || p.department === deptFilter;
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.phone.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q);
      return matchDept && matchStatus && matchQ;
    });
  }, [patients, query, deptFilter, statusFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormAge('35');
    setFormGender('Male');
    setFormPhone('+91 ');
    setFormEmail('');
    setFormDept('Cardiology');
    setFormBlood('O+');
    setFormStatus('Outpatient');
    setFormDoctor(doctors[0]?.name || 'Dr. Raghavendra Rao');
    setFormNotes('');
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (p: PatientRecord) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormAge(String(p.age));
    setFormGender(p.gender);
    setFormPhone(p.phone);
    setFormEmail(p.email);
    setFormDept(p.department);
    setFormBlood(p.bloodGroup);
    setFormStatus(p.status);
    setFormDoctor(p.doctor);
    setFormNotes(p.notes);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const ageNum = Number(formAge);
    if (!formName.trim() || formName.trim().length < 2) {
      setFormError('Patient full name is required.');
      return;
    }
    if (!Number.isFinite(ageNum) || ageNum < 0 || ageNum > 120) {
      setFormError('Enter a valid age between 0 and 120.');
      return;
    }
    if (!formPhone.trim() || formPhone.trim().length < 8) {
      setFormError('Enter a valid contact phone number.');
      return;
    }

    const payload = {
      name: formName.trim(),
      age: ageNum,
      gender: formGender,
      phone: formPhone.trim(),
      email: formEmail.trim() || 'patient@mail.demo',
      department: formDept,
      bloodGroup: formBlood,
      status: formStatus,
      doctor: formDoctor,
      notes: formNotes.trim() || 'Initial clinical intake completed.',
    };

    if (editingId) {
      updatePatient(editingId, payload);
      if (drawerPatient?.id === editingId) {
        setDrawerPatient({ ...drawerPatient, ...payload });
      }
      showToast({
        type: 'success',
        title: 'Patient Record Updated',
        message: `${payload.name} (${editingId}) updated.`,
      });
    } else {
      const created = addPatient(payload);
      showToast({
        type: 'success',
        title: 'Patient Registered',
        message: `${created.name} assigned ID ${created.id}.`,
      });
    }

    setModalOpen(false);
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
          <h1 className="font-display text-2xl font-bold text-[#05080F]">Patient Registry</h1>
          <p className="mt-1 text-sm text-[#334155]">
            Manage admissions, outpatient records, and department assignments.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0070F3] px-4 py-2.5 text-xs font-semibold text-white shadow-sm shadow-[#0070F3]/20 transition-colors hover:bg-[#005DD1] whitespace-nowrap"
        >
          <UserPlus className="h-4 w-4" />
          <span>Register Patient</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-4 shadow-sm shadow-[#0070F3]/5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#334155]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by patient name, ID, or phone..."
            className="w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] py-2 pr-3 pl-9 text-xs sm:text-sm text-[#05080F] placeholder-[#334155]/75 focus:border-[#0070F3] focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            aria-label="Filter by department"
            className="rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] px-3 py-2 text-xs text-[#05080F] focus:border-[#0070F3] focus:outline-none"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-1">
            {STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-[#0070F3] text-white font-semibold'
                    : 'text-[#334155] hover:text-[#0070F3]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Table */}
      <div className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 shadow-sm shadow-[#0070F3]/5">
        {filteredPatients.length === 0 ? (
          <EmptyState
            title="No patients found"
            description="Adjust your department or status filters, or register a new patient."
            actionLabel="Register Patient"
            onAction={openAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#DCE8F7] text-xs text-[#334155]">
                  <th className="py-3 pr-4 font-medium">Patient ID</th>
                  <th className="py-3 px-4 font-medium">Name</th>
                  <th className="py-3 px-4 font-medium">Age / Gender</th>
                  <th className="py-3 px-4 font-medium">Phone</th>
                  <th className="py-3 px-4 font-medium">Department</th>
                  <th className="py-3 px-4 font-medium">Reg. Date</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 pl-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EFFA] text-xs sm:text-sm">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-[#F4F8FF]">
                    <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#0070F3] whitespace-nowrap">
                      {p.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#05080F] whitespace-nowrap">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#334155] tabular-nums whitespace-nowrap">
                      {p.age} yrs · {p.gender}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[#334155] whitespace-nowrap">
                      {p.phone}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#05080F] whitespace-nowrap">
                      {p.department}
                    </td>
                    <td className="py-3 px-4 text-xs text-[#334155] whitespace-nowrap">
                      {p.regDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 pl-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDrawerPatient(p)}
                          aria-label={`View profile for ${p.name}`}
                          className="rounded-lg border border-[#DCE8F7] bg-[#F4F8FF] p-1.5 text-[#334155] hover:border-[#0070F3] hover:text-[#0070F3]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(p)}
                          aria-label={`Edit ${p.name}`}
                          className="rounded-lg border border-[#DCE8F7] bg-[#F4F8FF] p-1.5 text-[#334155] hover:border-[#0070F3] hover:text-[#05080F]"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Patient Profile Slide-Over Drawer */}
      <AnimatePresence>
        {drawerPatient && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setDrawerPatient(null);
                if (searchParams.get('selected')) setSearchParams({});
              }}
              className="fixed inset-0 bg-[#05080F]/40"
            />
            <motion.aside
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[#DCE8F7] bg-white shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-[#E6EFFA] p-6">
                <div>
                  <span className="font-mono text-xs font-semibold text-[#0070F3]">
                    {drawerPatient.id}
                  </span>
                  <h2 className="mt-1 font-display text-xl font-bold text-[#05080F]">
                    {drawerPatient.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#334155]">
                    {drawerPatient.age} yrs · {drawerPatient.gender} · Blood {drawerPatient.bloodGroup}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerPatient(null);
                    if (searchParams.get('selected')) setSearchParams({});
                  }}
                  aria-label="Close patient profile"
                  className="rounded-lg p-1.5 text-[#334155] hover:bg-[#EFF6FF] hover:text-[#0070F3]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-6 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-4">
                  <span className="text-xs text-[#334155]">Current Status</span>
                  <StatusBadge status={drawerPatient.status} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-3.5">
                    <p className="text-[#334155]">Department</p>
                    <p className="mt-1 font-semibold text-[#05080F]">
                      {drawerPatient.department}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-3.5">
                    <p className="text-[#334155]">Attending Physician</p>
                    <p className="mt-1 font-semibold text-[#05080F]">{drawerPatient.doctor}</p>
                  </div>
                  <div className="rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-3.5">
                    <p className="text-[#334155]">Contact Phone</p>
                    <p className="mt-1 flex items-center gap-1.5 font-mono text-[#05080F]">
                      <Phone className="h-3 w-3 text-[#0070F3]" />
                      {drawerPatient.phone}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-3.5">
                    <p className="text-[#334155]">Registered</p>
                    <p className="mt-1 font-semibold text-[#05080F]">{drawerPatient.regDate}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-4">
                  <p className="text-xs font-semibold text-[#05080F]">Clinical Notes</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#334155]">
                    {drawerPatient.notes}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-[#E6EFFA] p-4">
                <button
                  type="button"
                  onClick={() => openEditModal(drawerPatient)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005DD1]"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Record</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Add / Edit Patient Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? `Edit Patient ${editingId}` : 'Register New Patient'}
        subtitle="All records are stored locally in the current hospital session."
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="rounded-lg border border-[#FECDD3] bg-[#FFF1F2] px-3 py-2 text-xs text-[#E11D48]">
              {formError}
            </p>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Full Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Aditya Krishnan"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Age (Years)</label>
              <input
                type="number"
                value={formAge}
                onChange={(e) => setFormAge(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Gender</label>
              <select
                value={formGender}
                onChange={(e) => setFormGender(e.target.value as PatientRecord['gender'])}
                className={inputClass}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Phone Number</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+91 98400 00000"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Blood Group</label>
              <select
                value={formBlood}
                onChange={(e) => setFormBlood(e.target.value)}
                className={inputClass}
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Department</label>
              <select
                value={formDept}
                onChange={(e) => setFormDept(e.target.value)}
                className={inputClass}
              >
                {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as PatientRecord['status'])}
                className={inputClass}
              >
                <option value="Outpatient">Outpatient</option>
                <option value="Admitted">Admitted</option>
                <option value="Discharged">Discharged</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#05080F]">
                Attending Physician
              </label>
              <select
                value={formDoctor}
                onChange={(e) => setFormDoctor(e.target.value)}
                className={inputClass}
              >
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.name}>
                    {doc.name} ({doc.department})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Clinical Notes</label>
              <textarea
                rows={2}
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Reason for visit, allergies, or admission notes..."
                className={inputClass}
              />
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
              <span>{editingId ? 'Save Changes' : 'Register Patient'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
