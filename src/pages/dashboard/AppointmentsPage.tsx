import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CalendarDays, Clock, List, Plus, RefreshCw, XCircle } from 'lucide-react';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { useToast } from '../../hooks/useToast';
import { AppointmentRecord } from '../../data/mockHospitalData';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/StateViews';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const WEEK_DAYS = [
  { dayLabel: 'Mon', date: '23 Nov 2026' },
  { dayLabel: 'Tue', date: '24 Nov 2026' },
  { dayLabel: 'Wed', date: '25 Nov 2026' },
  { dayLabel: 'Thu', date: '26 Nov 2026' },
  { dayLabel: 'Fri', date: '27 Nov 2026' },
  { dayLabel: 'Sat', date: '28 Nov 2026' },
];

export default function AppointmentsPage() {
  const { appointments, addAppointment, updateAppointment, patients, doctors } =
    useHospitalStore();
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();

  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [statusFilter, setStatusFilter] = useState<'All' | AppointmentRecord['status']>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<AppointmentRecord | null>(null);

  const [patientId, setPatientId] = useState(patients[0]?.id || 'PT-1041');
  const [doctorName, setDoctorName] = useState(doctors[0]?.name || 'Dr. Raghavendra Rao');
  const [dateStr, setDateStr] = useState('23 Nov 2026');
  const [timeStr, setTimeStr] = useState('11:30 AM');
  const [apptType, setApptType] = useState<AppointmentRecord['type']>('Consultation');

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return appointments;
    return appointments.filter((a) => a.status === statusFilter);
  }, [appointments, statusFilter]);

  const openBookModal = () => {
    setRescheduleTarget(null);
    setPatientId(patients[0]?.id || 'PT-1041');
    setDoctorName(doctors[0]?.name || 'Dr. Raghavendra Rao');
    setDateStr('23 Nov 2026');
    setTimeStr('11:30 AM');
    setApptType('Consultation');
    setModalOpen(true);
  };

  const openReschedule = (appt: AppointmentRecord) => {
    setRescheduleTarget(appt);
    setDateStr(appt.date);
    setTimeStr(appt.time);
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dayObj = WEEK_DAYS.find((d) => d.date === dateStr) || WEEK_DAYS[0];

    if (rescheduleTarget) {
      updateAppointment(rescheduleTarget.id, {
        date: dateStr,
        dayLabel: dayObj.dayLabel,
        time: timeStr,
        status: 'Scheduled',
      });
      showToast({
        type: 'success',
        title: 'Appointment Rescheduled',
        message: `${rescheduleTarget.patientName} moved to ${dateStr} at ${timeStr}.`,
      });
    } else {
      const patient = patients.find((p) => p.id === patientId) || patients[0];
      const doc = doctors.find((d) => d.name === doctorName) || doctors[0];
      addAppointment({
        patientName: patient.name,
        patientId: patient.id,
        doctorName: doc.name,
        department: doc.department,
        date: dateStr,
        dayLabel: dayObj.dayLabel,
        time: timeStr,
        type: apptType,
        status: 'Scheduled',
      });
      showToast({
        type: 'success',
        title: 'Appointment Booked',
        message: `${patient.name} scheduled with ${doc.name}.`,
      });
    }
    setModalOpen(false);
  };

  const handleCancel = (appt: AppointmentRecord) => {
    updateAppointment(appt.id, { status: 'Cancelled' });
    showToast({
      type: 'info',
      title: 'Appointment Cancelled',
      message: `${appt.id} for ${appt.patientName} marked as Cancelled.`,
    });
  };

  const selectClass =
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
          <h1 className="font-display text-2xl font-bold text-[#05080F]">Appointments</h1>
          <p className="mt-1 text-sm text-[#334155]">
            OPD consultation slots, diagnostic bookings, and weekly specialist calendar.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 rounded-xl border border-[#DCE8F7] bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#0070F3] text-white font-semibold'
                  : 'text-[#334155] hover:text-[#0070F3]'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-[#0070F3] text-white font-semibold'
                  : 'text-[#334155] hover:text-[#0070F3]'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Weekly Grid
            </button>
          </div>

          <button
            type="button"
            onClick={openBookModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#0070F3]/20 transition-colors hover:bg-[#005DD1] whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Status Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-3 shadow-sm shadow-[#0070F3]/5">
        {(['All', 'Scheduled', 'Completed', 'Pending', 'Cancelled'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === st
                ? 'bg-[#0070F3] text-white font-semibold'
                : 'text-[#334155] hover:bg-[#EFF6FF] hover:text-[#0070F3]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No appointments in this view"
          description="No appointments match the selected status filter."
          actionLabel="Book Appointment"
          onAction={openBookModal}
        />
      ) : viewMode === 'list' ? (
        <div className="rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-5 shadow-sm shadow-[#0070F3]/5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#DCE8F7] text-xs text-[#334155]">
                <th className="py-3 pr-4 font-medium">ID</th>
                <th className="py-3 px-4 font-medium">Patient</th>
                <th className="py-3 px-4 font-medium">Doctor &amp; Dept</th>
                <th className="py-3 px-4 font-medium">Date &amp; Time</th>
                <th className="py-3 px-4 font-medium">Visit Type</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 pl-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6EFFA] text-xs sm:text-sm">
              {filtered.map((appt) => (
                <tr key={appt.id} className="hover:bg-[#F4F8FF]">
                  <td className="py-3 pr-4 font-mono text-xs font-semibold text-[#0070F3] whitespace-nowrap">
                    {appt.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-[#05080F] whitespace-nowrap">
                    {appt.patientName}
                    <span className="ml-2 font-mono text-[11px] text-[#334155]">
                      {appt.patientId}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <p className="text-xs font-medium text-[#05080F]">{appt.doctorName}</p>
                    <p className="text-[11px] text-[#334155]">{appt.department}</p>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#334155] whitespace-nowrap">
                    {appt.date} · <span className="font-mono font-medium text-[#05080F]">{appt.time}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#05080F] whitespace-nowrap">
                    {appt.type}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={appt.status} />
                  </td>
                  <td className="py-3 pl-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      {appt.status !== 'Completed' && appt.status !== 'Cancelled' && (
                        <>
                          <button
                            type="button"
                            onClick={() => openReschedule(appt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#DCE8F7] bg-[#F4F8FF] px-2.5 py-1 text-[11px] font-medium text-[#05080F] hover:border-[#0070F3] hover:text-[#0070F3]"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancel(appt)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#FECDD3] bg-[#FFF1F2] px-2.5 py-1 text-[11px] font-medium text-[#BE123C] hover:bg-[#FFE4E6]"
                          >
                            <XCircle className="h-3 w-3" />
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {WEEK_DAYS.map((day) => {
            const items = filtered.filter((a) => a.date === day.date);
            return (
              <div
                key={day.date}
                className="flex flex-col rounded-2xl border border-white/90 bg-white/82 backdrop-blur-[4px] ring-1 ring-[#DCE8F7]/80 p-4 shadow-sm shadow-[#0070F3]/5"
              >
                <div className="border-b border-[#E6EFFA] pb-3">
                  <p className="font-display text-sm font-semibold text-[#0070F3]">
                    {day.dayLabel}
                  </p>
                  <p className="font-mono text-[11px] text-[#334155]">{day.date}</p>
                </div>
                <div className="mt-3 space-y-2.5 flex-1">
                  {items.length === 0 ? (
                    <p className="py-6 text-center text-xs text-[#334155]/70">No bookings</p>
                  ) : (
                    items.map((appt) => (
                      <div
                        key={appt.id}
                        className="rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#0070F3]">
                            <Clock className="h-3 w-3" />
                            {appt.time}
                          </span>
                          <StatusBadge status={appt.status} />
                        </div>
                        <p className="text-xs font-semibold text-[#05080F]">{appt.patientName}</p>
                        <p className="text-[11px] text-[#334155] truncate">{appt.doctorName}</p>
                        <p className="text-[11px] text-[#334155]">{appt.department}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book / Reschedule Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={rescheduleTarget ? `Reschedule ${rescheduleTarget.id}` : 'Book New Appointment'}
        subtitle={
          rescheduleTarget
            ? `Patient: ${rescheduleTarget.patientName}`
            : 'Select patient, specialist, and date slot.'
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!rescheduleTarget && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#05080F]">Patient</label>
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className={selectClass}
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-[#05080F]">
                  Consulting Doctor
                </label>
                <select
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className={selectClass}
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name} — {d.department}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Date</label>
              <select
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className={selectClass}
              >
                {WEEK_DAYS.map((d) => (
                  <option key={d.date} value={d.date}>
                    {d.dayLabel}, {d.date}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Time Slot</label>
              <select
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className={selectClass}
              >
                {[
                  '09:00 AM',
                  '10:00 AM',
                  '11:30 AM',
                  '02:00 PM',
                  '03:30 PM',
                  '05:00 PM',
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {!rescheduleTarget && (
            <div>
              <label className="mb-1 block text-xs font-medium text-[#05080F]">Visit Type</label>
              <select
                value={apptType}
                onChange={(e) => setApptType(e.target.value as AppointmentRecord['type'])}
                className={selectClass}
              >
                <option value="Consultation">Consultation</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Diagnostics">Diagnostics</option>
                <option value="Procedure">Procedure</option>
              </select>
            </div>
          )}

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
              className="rounded-lg bg-[#0070F3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005DD1]"
            >
              {rescheduleTarget ? 'Save New Slot' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
