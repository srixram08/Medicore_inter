import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  AppointmentRecord,
  DepartmentRecord,
  DoctorRecord,
  INITIAL_APPOINTMENTS,
  INITIAL_DEPARTMENTS,
  INITIAL_DOCTORS,
  INITIAL_INVOICES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PATIENTS,
  INITIAL_PHARMACY,
  INITIAL_TRANSACTIONS,
  InvoiceRecord,
  NotificationItem,
  PatientRecord,
  PaymentMethod,
  PharmacyItem,
  TransactionRecord,
} from '../data/mockHospitalData';

export interface HospitalSettings {
  hospitalName: string;
  registrationCode: string;
  address: string;
  contactPhone: string;
  gstNumber: string;
  defaultTaxPct: number;
  lowStockAlerts: boolean;
  paymentReceiptsAutoEmail: boolean;
  sessionTimeoutMinutes: number;
}

interface HospitalStoreValue {
  patients: PatientRecord[];
  doctors: DoctorRecord[];
  appointments: AppointmentRecord[];
  transactions: TransactionRecord[];
  invoices: InvoiceRecord[];
  departments: DepartmentRecord[];
  pharmacy: PharmacyItem[];
  notifications: NotificationItem[];
  settings: HospitalSettings;

  addPatient: (patient: Omit<PatientRecord, 'id' | 'regDate'>) => PatientRecord;
  updatePatient: (id: string, updates: Partial<PatientRecord>) => void;
  addDoctor: (doctor: Omit<DoctorRecord, 'id' | 'patientsToday'>) => DoctorRecord;
  toggleDoctorAvailability: (id: string, availability: DoctorRecord['availability']) => void;
  addAppointment: (appt: Omit<AppointmentRecord, 'id'>) => AppointmentRecord;
  updateAppointment: (id: string, updates: Partial<AppointmentRecord>) => void;
  createInvoice: (
    invoice: Omit<InvoiceRecord, 'id' | 'invoiceNo' | 'date'>
  ) => InvoiceRecord;
  recordInvoicePayment: (id: string, amount: number, method: PaymentMethod) => void;
  updateDepartmentBeds: (id: string, occupiedBeds: number) => void;
  restockMedicine: (id: string, addedQty: number) => void;
  addMedicine: (item: Omit<PharmacyItem, 'id'>) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  updateSettings: (next: HospitalSettings) => void;
}

const HospitalStoreContext = createContext<HospitalStoreValue | null>(null);

export function HospitalStoreProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS);
  const [doctors, setDoctors] = useState<DoctorRecord[]>(INITIAL_DOCTORS);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(INITIAL_APPOINTMENTS);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(INITIAL_TRANSACTIONS);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);
  const [departments, setDepartments] = useState<DepartmentRecord[]>(INITIAL_DEPARTMENTS);
  const [pharmacy, setPharmacy] = useState<PharmacyItem[]>(INITIAL_PHARMACY);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [settings, setSettings] = useState<HospitalSettings>({
    hospitalName: 'MediCore Apex Hospital',
    registrationCode: 'MH-BLR-2026-094',
    address: '142 Residency Road, Bengaluru, Karnataka 560025',
    contactPhone: '+91 80 4412 9000',
    gstNumber: '29AABCM4412H1Z8',
    defaultTaxPct: 5,
    lowStockAlerts: true,
    paymentReceiptsAutoEmail: true,
    sessionTimeoutMinutes: 60,
  });

  const addPatient = useCallback((patient: Omit<PatientRecord, 'id' | 'regDate'>) => {
    const newPatient: PatientRecord = {
      ...patient,
      id: `PT-${Math.floor(1056 + Math.random() * 900)}`,
      regDate: '23 Nov 2026',
    };
    setPatients((prev) => [newPatient, ...prev]);
    return newPatient;
  }, []);

  const updatePatient = useCallback((id: string, updates: Partial<PatientRecord>) => {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const addDoctor = useCallback((doctor: Omit<DoctorRecord, 'id' | 'patientsToday'>) => {
    const newDoctor: DoctorRecord = {
      ...doctor,
      id: `DOC-${Math.floor(209 + Math.random() * 90)}`,
      patientsToday: 0,
    };
    setDoctors((prev) => [newDoctor, ...prev]);
    return newDoctor;
  }, []);

  const toggleDoctorAvailability = useCallback(
    (id: string, availability: DoctorRecord['availability']) => {
      setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, availability } : d)));
    },
    []
  );

  const addAppointment = useCallback((appt: Omit<AppointmentRecord, 'id'>) => {
    const newAppt: AppointmentRecord = {
      ...appt,
      id: `APT-${Math.floor(310 + Math.random() * 600)}`,
    };
    setAppointments((prev) => [newAppt, ...prev]);
    return newAppt;
  }, []);

  const updateAppointment = useCallback((id: string, updates: Partial<AppointmentRecord>) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const createInvoice = useCallback(
    (invoice: Omit<InvoiceRecord, 'id' | 'invoiceNo' | 'date'>) => {
      const invoiceNo = `INV-2026-${Math.floor(4413 + Math.random() * 500)}`;
      const newInv: InvoiceRecord = {
        ...invoice,
        id: `INVR-${Date.now()}`,
        invoiceNo,
        date: '23 Nov 2026',
      };
      setInvoices((prev) => [newInv, ...prev]);

      const subtotal = newInv.lineItems.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
      const afterDiscount = subtotal * (1 - newInv.discountPct / 100);
      const grandTotal = Math.round(afterDiscount * (1 + newInv.taxPct / 100));

      const txn: TransactionRecord = {
        id: `TXN-${Math.floor(9483 + Math.random() * 400)}`,
        patientName: newInv.patientName,
        patientId: newInv.patientId,
        invoiceNo,
        date: '23 Nov 2026',
        time: 'Just now',
        method: newInv.method,
        amount: newInv.paidAmount > 0 ? newInv.paidAmount : grandTotal,
        status: newInv.status,
        department: newInv.department,
      };
      setTransactions((prev) => [txn, ...prev]);
      return newInv;
    },
    []
  );

  const recordInvoicePayment = useCallback((id: string, amount: number, method: PaymentMethod) => {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const subtotal = inv.lineItems.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
        const total = Math.round(
          subtotal * (1 - inv.discountPct / 100) * (1 + inv.taxPct / 100)
        );
        const nextPaid = Math.min(total, inv.paidAmount + amount);
        const nextStatus = nextPaid >= total ? 'Paid' : nextPaid > 0 ? 'Partially Paid' : 'Pending';

        const txn: TransactionRecord = {
          id: `TXN-${Math.floor(9485 + Math.random() * 500)}`,
          patientName: inv.patientName,
          patientId: inv.patientId,
          invoiceNo: inv.invoiceNo,
          date: '23 Nov 2026',
          time: 'Just now',
          method,
          amount,
          status: nextStatus,
          department: inv.department,
        };
        setTransactions((tPrev) => [txn, ...tPrev]);

        return { ...inv, paidAmount: nextPaid, status: nextStatus, method };
      })
    );
  }, []);

  const updateDepartmentBeds = useCallback((id: string, occupiedBeds: number) => {
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, occupiedBeds: Math.max(0, Math.min(d.totalBeds, occupiedBeds)) }
          : d
      )
    );
  }, []);

  const restockMedicine = useCallback((id: string, addedQty: number) => {
    setPharmacy((prev) =>
      prev.map((m) => (m.id === id ? { ...m, stock: m.stock + Math.max(0, addedQty) } : m))
    );
  }, []);

  const addMedicine = useCallback((item: Omit<PharmacyItem, 'id'>) => {
    setPharmacy((prev) => [
      { ...item, id: `MED-${Math.floor(10 + Math.random() * 89)}` },
      ...prev,
    ]);
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const updateSettings = useCallback((next: HospitalSettings) => {
    setSettings(next);
  }, []);

  const value = useMemo(
    () => ({
      patients,
      doctors,
      appointments,
      transactions,
      invoices,
      departments,
      pharmacy,
      notifications,
      settings,
      addPatient,
      updatePatient,
      addDoctor,
      toggleDoctorAvailability,
      addAppointment,
      updateAppointment,
      createInvoice,
      recordInvoicePayment,
      updateDepartmentBeds,
      restockMedicine,
      addMedicine,
      markAllNotificationsRead,
      markNotificationRead,
      updateSettings,
    }),
    [
      patients,
      doctors,
      appointments,
      transactions,
      invoices,
      departments,
      pharmacy,
      notifications,
      settings,
      addPatient,
      updatePatient,
      addDoctor,
      toggleDoctorAvailability,
      addAppointment,
      updateAppointment,
      createInvoice,
      recordInvoicePayment,
      updateDepartmentBeds,
      restockMedicine,
      addMedicine,
      markAllNotificationsRead,
      markNotificationRead,
      updateSettings,
    ]
  );

  return (
    <HospitalStoreContext.Provider value={value}>{children}</HospitalStoreContext.Provider>
  );
}

export function useHospitalStore() {
  const ctx = useContext(HospitalStoreContext);
  if (!ctx) throw new Error('useHospitalStore must be used within HospitalStoreProvider');
  return ctx;
}
