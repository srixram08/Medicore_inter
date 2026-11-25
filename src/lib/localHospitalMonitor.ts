import {
  AppointmentRecord,
  DepartmentRecord,
  DoctorRecord,
  InvoiceRecord,
  NotificationItem,
  PAYMENT_METHODS_BREAKDOWN,
  PAYMENT_TIMELINE_DATA,
  PatientRecord,
  PharmacyItem,
  TransactionRecord,
} from '../data/mockHospitalData';
import type { HospitalSettings } from '../hooks/useHospitalStore';
import { formatINR } from './formatters';

export interface LiveHospitalStoreSnapshot {
  patients: PatientRecord[];
  doctors: DoctorRecord[];
  appointments: AppointmentRecord[];
  transactions: TransactionRecord[];
  invoices: InvoiceRecord[];
  departments: DepartmentRecord[];
  pharmacy: PharmacyItem[];
  notifications: NotificationItem[];
  settings: HospitalSettings;
}

export interface LocalMonitorResponse {
  reply: string;
  outOfScope: boolean;
}

function calcInvoiceTotal(inv: InvoiceRecord): number {
  const subtotal = inv.lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  return Math.round(subtotal * (1 - inv.discountPct / 100) * (1 + inv.taxPct / 100));
}

function getRouteGuide(currentRoute: string): { title: string; route: string; tips: string[] } {
  if (currentRoute.includes('/patients')) {
    return {
      title: 'Patients Registry',
      route: '/dashboard/patients',
      tips: [
        'Use "Register Patient" to add a new patient (automatically updates overview KPIs).',
        'Filter by department or clinical status (Admitted, Critical, Outpatient, Discharged).',
        'Click any patient row to open their clinical profile drawer and update status or notes.',
      ],
    };
  }
  if (currentRoute.includes('/doctors')) {
    return {
      title: 'Doctors & Staff',
      route: '/dashboard/doctors',
      tips: [
        'Add new specialists with "Add Doctor" or filter by department and availability.',
        'Switch doctor status directly between Available, OPD Active, In Surgery, and On Leave.',
      ],
    };
  }
  if (currentRoute.includes('/appointments')) {
    return {
      title: 'Appointments Schedule',
      route: '/dashboard/appointments',
      tips: [
        'Click "Book Appointment" to schedule consultations, follow-ups, diagnostics, or procedures.',
        'Update visit status (Scheduled, Pending, Completed, Cancelled) inline from the table.',
      ],
    };
  }
  if (currentRoute.includes('/departments')) {
    return {
      title: 'Departments & Ward Capacity',
      route: '/dashboard/departments',
      tips: [
        'Use the + / - bed controls on any department card to adjust occupied beds in real time.',
        'Wards at or above 85% occupancy are flagged as high-load in live monitoring.',
      ],
    };
  }
  if (currentRoute.includes('/billing')) {
    return {
      title: 'Payments & Billing',
      route: '/dashboard/billing',
      tips: [
        'Create multi-line itemized INR invoices with configurable discount and GST tax.',
        'Record partial or full payments via UPI, Card, Insurance, Bank Transfer, or Cash.',
        'Open any invoice to print or save a formatted hospital receipt.',
      ],
    };
  }
  if (currentRoute.includes('/analytics')) {
    return {
      title: 'Financial Analytics',
      route: '/dashboard/analytics',
      tips: [
        'Compare incoming revenue, outgoing costs, net profit, and refunds across Today, 7 Days, 30 Days, 3 Months, 6 Months, and 1 Year.',
        'Inspect the payment method share breakdown (UPI, Card, Insurance, Bank Transfer, Cash).',
      ],
    };
  }
  if (currentRoute.includes('/pharmacy')) {
    return {
      title: 'Pharmacy & Inventory',
      route: '/dashboard/pharmacy',
      tips: [
        'Items at or below their reorder threshold are highlighted with low-stock warnings.',
        'Use "Restock" on any medicine row or "Add Medicine" to register new inventory batches.',
      ],
    };
  }
  if (currentRoute.includes('/reports')) {
    return {
      title: 'Reports & CSV Exports',
      route: '/dashboard/reports',
      tips: [
        'Download real-time CSV exports for Patients, Billing Transactions, Department Occupancy, and Pharmacy Inventory.',
      ],
    };
  }
  if (currentRoute.includes('/settings')) {
    return {
      title: 'Hospital Settings',
      route: '/dashboard/settings',
      tips: [
        'Update hospital name, registration code, GSTIN, default tax %, low-stock alert toggle, and session timeout.',
      ],
    };
  }
  return {
    title: 'Hospital Overview',
    route: '/dashboard',
    tips: [
      'Monitor headline KPIs (Patients, Appointments, Doctors, Revenue), Payment Timeline charts, and recent transactions.',
      'Use the left sidebar (or mobile menu) to jump between Patients, Doctors, Appointments, Departments, Billing, Analytics, Pharmacy, Reports, and Settings.',
    ],
  };
}

const APP_DOMAIN_TERMS = [
  'medicore',
  'app',
  'application',
  'dashboard',
  'overview',
  'page',
  'screen',
  'route',
  'navigate',
  'sidebar',
  'menu',
  'hospital',
  'clinic',
  'ward',
  'bed',
  'beds',
  'occupancy',
  'capacity',
  'department',
  'departments',
  'cardiology',
  'orthopedics',
  'neurology',
  'pediatrics',
  'oncology',
  'emergency',
  'trauma',
  'gynecology',
  'general medicine',
  'diagnostics',
  'patient',
  'patients',
  'critical',
  'admitted',
  'discharged',
  'outpatient',
  'icu',
  'doctor',
  'doctors',
  'staff',
  'specialist',
  'surgeon',
  'surgery',
  'opd',
  'leave',
  'available',
  'availability',
  'shift',
  'fee',
  'appointment',
  'appointments',
  'schedule',
  'slot',
  'booking',
  'book',
  'reschedule',
  'follow-up',
  'invoice',
  'invoices',
  'bill',
  'billing',
  'payment',
  'payments',
  'transaction',
  'transactions',
  'txn',
  'inv',
  'due',
  'dues',
  'pending',
  'balance',
  'paid',
  'refund',
  'refunded',
  'collection',
  'collections',
  'revenue',
  'income',
  'outgoing',
  'expense',
  'profit',
  'analytics',
  'financial',
  'finance',
  'upi',
  'insurance',
  'bank transfer',
  'cash',
  'card',
  'gst',
  'tax',
  'pharmacy',
  'medicine',
  'medicines',
  'meds',
  'drug',
  'drugs',
  'stock',
  'inventory',
  'reorder',
  'restock',
  'expiry',
  'expire',
  'batch',
  'alert',
  'alerts',
  'notification',
  'notifications',
  'unread',
  'warning',
  'risk',
  'report',
  'reports',
  'csv',
  'export',
  'download',
  'setting',
  'settings',
  'gstin',
  'timeout',
  'pwa',
  'install',
  'android',
  'ios',
  'iphone',
  'offline',
  'home screen',
  'apk',
  'login',
  'sign in',
  'auth',
  'telemetry',
  'monitor',
  'briefing',
  'summary',
  'status',
  'kpi',
  'kpis',
  'help',
  'guide',
  'how do i',
  'how to',
  'where is',
  'what can you',
  'who are you',
  '3d',
  'hello',
  'hi',
  'hey',
];

const PERSONAL_MEDICAL_ADVICE_PATTERNS = [
  /\b(should i take|what medicine should i|diagnose me|my symptoms|home remedy|treat my|cure my|chest pain|headache|fever medicine|dosage for me)\b/i,
];

function findMatchingEntities(queryLower: string, store: LiveHospitalStoreSnapshot) {
  const matchedPatients = store.patients.filter(
    (p) =>
      queryLower.includes(p.id.toLowerCase()) ||
      queryLower.includes(p.name.toLowerCase()) ||
      p.name
        .toLowerCase()
        .split(' ')
        .some((part) => part.length > 3 && queryLower.includes(part))
  );

  const matchedDoctors = store.doctors.filter(
    (d) =>
      queryLower.includes(d.id.toLowerCase()) ||
      queryLower.includes(d.name.toLowerCase()) ||
      d.name
        .toLowerCase()
        .replace(/^dr\.\s*/i, '')
        .split(' ')
        .some((part) => part.length > 3 && queryLower.includes(part))
  );

  const matchedMeds = store.pharmacy.filter(
    (m) =>
      queryLower.includes(m.id.toLowerCase()) ||
      queryLower.includes(m.batchNo.toLowerCase()) ||
      queryLower.includes(m.name.toLowerCase()) ||
      m.name
        .toLowerCase()
        .split(' ')
        .some((part) => part.length > 4 && queryLower.includes(part))
  );

  const matchedInvoices = store.invoices.filter(
    (inv) =>
      queryLower.includes(inv.invoiceNo.toLowerCase()) ||
      queryLower.includes(inv.id.toLowerCase())
  );

  const matchedTxns = store.transactions.filter((t) =>
    queryLower.includes(t.id.toLowerCase())
  );

  const matchedDepts = store.departments.filter((d) =>
    queryLower.includes(d.name.toLowerCase())
  );

  return {
    matchedPatients,
    matchedDoctors,
    matchedMeds,
    matchedInvoices,
    matchedTxns,
    matchedDepts,
  };
}

export function answerWithLocalMonitor({
  query,
  currentRoute,
  store,
}: {
  query: string;
  currentRoute: string;
  store: LiveHospitalStoreSnapshot;
}): LocalMonitorResponse {
  const trimmed = query.trim();
  const q = trimmed.toLowerCase();

  const entities = findMatchingEntities(q, store);
  const hasEntityMatch =
    entities.matchedPatients.length > 0 ||
    entities.matchedDoctors.length > 0 ||
    entities.matchedMeds.length > 0 ||
    entities.matchedInvoices.length > 0 ||
    entities.matchedTxns.length > 0 ||
    entities.matchedDepts.length > 0;

  const hasDomainTerm = APP_DOMAIN_TERMS.some((term) => q.includes(term));

  const isPersonalMedicalQuery = PERSONAL_MEDICAL_ADVICE_PATTERNS.some((re) => re.test(q));
  if (isPersonalMedicalQuery && !hasEntityMatch) {
    return {
      outOfScope: true,
      reply: [
        'I cannot provide personal medical advice or clinical diagnoses. I strictly monitor MediCore 3D hospital operations and answer questions about this application.',
        '',
        'Try asking instead:',
        '• "Give me a live hospital status briefing"',
        '• "Which medicines are low on stock?"',
        '• "List critical or admitted patients"',
      ].join('\n'),
    };
  }

  if (!hasEntityMatch && !hasDomainTerm) {
    return {
      outOfScope: true,
      reply: [
        'I only monitor MediCore 3D hospital operations and answer questions related to this application.',
        '',
        'You can ask me about:',
        '• Live bed capacity, wards, and high-occupancy alerts',
        '• Patients, doctors on duty, and upcoming appointments',
        '• Pending invoices, INR revenue analytics, and pharmacy stock alerts',
        '• How to use any MediCore 3D screen, CSV reports, settings, or mobile PWA install',
      ].join('\n'),
    };
  }

  // Computed live telemetry
  const totalBeds = store.departments.reduce((s, d) => s + d.totalBeds, 0);
  const occupiedBeds = store.departments.reduce((s, d) => s + d.occupiedBeds, 0);
  const freeBeds = Math.max(0, totalBeds - occupiedBeds);
  const occupancyPct = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0.0';
  const highLoadDepts = store.departments.filter(
    (d) => d.totalBeds > 0 && d.occupiedBeds / d.totalBeds >= 0.85
  );
  const watchDepts = store.departments.filter(
    (d) => d.totalBeds > 0 && d.occupiedBeds / d.totalBeds >= 0.75
  );

  const lowStockMeds = store.pharmacy.filter((m) => m.stock <= m.reorderLevel);
  const pendingInvoices = store.invoices.filter((inv) => inv.status !== 'Paid');
  const pendingBalanceINR = pendingInvoices.reduce((acc, inv) => {
    const total = calcInvoiceTotal(inv);
    return acc + Math.max(0, total - inv.paidAmount);
  }, 0);
  const unreadAlerts = store.notifications.filter((n) => !n.read);

  const totalPatientsShown = 1248 + (store.patients.length - 10);
  const todaysAppointmentsShown = 36 + (store.appointments.length - 9);
  const totalDoctorsShown = 42 + (store.doctors.length - 8);

  // 1. Direct entity lookup responses (when user names a specific person, ID, medicine, invoice, or transaction)
  if (
    hasEntityMatch &&
    (entities.matchedPatients.length > 0 ||
      entities.matchedDoctors.length > 0 ||
      entities.matchedMeds.length > 0 ||
      entities.matchedInvoices.length > 0 ||
      entities.matchedTxns.length > 0)
  ) {
    const lines: string[] = [];

    if (entities.matchedPatients.length > 0) {
      lines.push('Matching Patient Records:');
      entities.matchedPatients.forEach((p) => {
        const patientInvs = store.invoices.filter((i) => i.patientId === p.id);
        const due = patientInvs.reduce(
          (s, i) => s + Math.max(0, calcInvoiceTotal(i) - i.paidAmount),
          0
        );
        lines.push(
          `• ${p.name} (${p.id}) — ${p.status} | ${p.department} | Doctor: ${p.doctor} | Blood: ${p.bloodGroup} | Registered: ${p.regDate}`
        );
        lines.push(`  Notes: ${p.notes}${due > 0 ? ` | Pending Due: ${formatINR(due)}` : ''}`);
      });
    }

    if (entities.matchedDoctors.length > 0) {
      if (lines.length) lines.push('');
      lines.push('Matching Doctor Records:');
      entities.matchedDoctors.forEach((d) => {
        lines.push(
          `• ${d.name} (${d.id}) — ${d.availability} | ${d.department} (${d.specialization})`
        );
        lines.push(
          `  Fee: ${formatINR(d.fee)} | Shift: ${d.shift} | Patients Today: ${d.patientsToday} | Exp: ${d.experienceYears} yrs`
        );
      });
    }

    if (entities.matchedMeds.length > 0) {
      if (lines.length) lines.push('');
      lines.push('Matching Pharmacy Inventory:');
      entities.matchedMeds.forEach((m) => {
        const statusFlag = m.stock <= m.reorderLevel ? 'LOW STOCK' : 'Healthy';
        lines.push(
          `• ${m.name} (${m.id}) — ${m.stock} ${m.unit} [${statusFlag}, Reorder <= ${m.reorderLevel}] | Unit Price: ${formatINR(m.unitPrice)} | Batch: ${m.batchNo} | Exp: ${m.expiryDate}`
        );
      });
    }

    if (entities.matchedInvoices.length > 0) {
      if (lines.length) lines.push('');
      lines.push('Matching Billing Invoices:');
      entities.matchedInvoices.forEach((inv) => {
        const total = calcInvoiceTotal(inv);
        const bal = Math.max(0, total - inv.paidAmount);
        lines.push(
          `• ${inv.invoiceNo} (${inv.patientName}, ${inv.department}) — Status: ${inv.status} | Total: ${formatINR(total)} | Paid: ${formatINR(inv.paidAmount)} | Balance: ${formatINR(bal)} | Method: ${inv.method}`
        );
      });
    }

    if (entities.matchedTxns.length > 0) {
      if (lines.length) lines.push('');
      lines.push('Matching Transactions:');
      entities.matchedTxns.forEach((t) => {
        lines.push(
          `• ${t.id} — ${t.patientName} (${t.invoiceNo}) | ${formatINR(t.amount)} via ${t.method} | ${t.status} (${t.date} ${t.time})`
        );
      });
    }

    return { outOfScope: false, reply: lines.join('\n') };
  }

  // 2. Greeting / Capabilities / Help
  if (
    /^(hi|hello|hey|help|what can you do|who are you)\b/i.test(q) ||
    q.includes('capabilities')
  ) {
    const routeGuide = getRouteGuide(currentRoute);
    return {
      outOfScope: false,
      reply: [
        `MediCore 3D Monitor is active on ${routeGuide.title} (${routeGuide.route}).`,
        '',
        'Live Hospital Snapshot:',
        `• Beds: ${occupiedBeds}/${totalBeds} occupied (${freeBeds} free, ${occupancyPct}%)`,
        `• Low-Stock Pharmacy Items: ${lowStockMeds.length}`,
        `• Pending Invoice Balance: ${formatINR(pendingBalanceINR)} across ${pendingInvoices.length} invoice(s)`,
        `• Unread Alerts: ${unreadAlerts.length}`,
        '',
        'Ask me for a full status briefing, specific patients/doctors/invoices, ward capacities, pharmacy alerts, or how to use any MediCore 3D screen.',
      ].join('\n'),
    };
  }

  // 3. Full Live Status Briefing / Overview
  if (
    q.includes('briefing') ||
    q.includes('status') ||
    q.includes('summary') ||
    q.includes('overview') ||
    q.includes('kpi') ||
    (q.includes('monitor') && !q.includes('bed') && !q.includes('ward'))
  ) {
    const criticalPatients = store.patients.filter((p) => p.status === 'Critical');
    const availableDocs = store.doctors.filter(
      (d) => d.availability === 'Available' || d.availability === 'OPD Active'
    );
    const inSurgeryDocs = store.doctors.filter((d) => d.availability === 'In Surgery');

    return {
      outOfScope: false,
      reply: [
        `Live Hospital Status Briefing — ${store.settings.hospitalName} (23 Nov 2026)`,
        '',
        `• Patients: ${totalPatientsShown.toLocaleString('en-IN')} total (${store.patients.length} active registry records; ${criticalPatients.length} Critical${criticalPatients.length ? `: ${criticalPatients.map((p) => `${p.name} in ${p.department}`).join(', ')}` : ''})`,
        `• Beds & Wards: ${occupiedBeds}/${totalBeds} occupied (${occupancyPct}% load, ${freeBeds} beds free). ${highLoadDepts.length > 0 ? `High load (>=85%): ${highLoadDepts.map((d) => `${d.name} ${d.occupiedBeds}/${d.totalBeds}`).join(', ')}` : `Highest load: Emergency & Trauma (${store.departments.find((d) => d.name.includes('Emergency'))?.occupiedBeds ?? 19}/${store.departments.find((d) => d.name.includes('Emergency'))?.totalBeds ?? 24} = 79.2%) — all wards below 85%`}`,
        `• Doctors & Staff: ${totalDoctorsShown} total (${availableDocs.length} Available/OPD Active, ${inSurgeryDocs.length} In Surgery in tracked roster)`,
        `• Appointments: ${todaysAppointmentsShown} scheduled today (${store.appointments.filter((a) => a.status === 'Scheduled' || a.status === 'Pending').length} active/pending in roster)`,
        `• Billing & Revenue: Today's Overview Revenue ${formatINR(245000)} | Pending Invoice Balance: ${formatINR(pendingBalanceINR)} (${pendingInvoices.length} open invoice${pendingInvoices.length === 1 ? '' : 's'})`,
        `• Pharmacy Alerts: ${lowStockMeds.length} item(s) at or below reorder level (${lowStockMeds.map((m) => `${m.name}: ${m.stock}/${m.reorderLevel} ${m.unit}`).join('; ') || 'All healthy'})`,
        `• Unread Alerts: ${unreadAlerts.length} active notification(s)`,
      ].join('\n'),
    };
  }

  // 4. Pharmacy / Low Stock / Expiry
  if (
    q.includes('pharmacy') ||
    q.includes('medicine') ||
    q.includes('meds') ||
    q.includes('drug') ||
    q.includes('stock') ||
    q.includes('inventory') ||
    q.includes('reorder') ||
    q.includes('restock') ||
    q.includes('expiry') ||
    q.includes('expire')
  ) {
    const lines = [
      `Pharmacy Inventory Monitor (${store.pharmacy.length} tracked items | Low-Stock Alerts: ${store.settings.lowStockAlerts ? 'Enabled' : 'Disabled'})`,
      '',
    ];

    if (lowStockMeds.length > 0) {
      lines.push(`Action Needed — ${lowStockMeds.length} Item(s) At or Below Reorder Level:`);
      lowStockMeds.forEach((m) => {
        const deficit = m.reorderLevel - m.stock;
        lines.push(
          `• ${m.name} (${m.id}) — ${m.stock} ${m.unit} left (Reorder at ${m.reorderLevel}, shortage: ${deficit} ${m.unit}) | Batch ${m.batchNo} | Exp ${m.expiryDate}`
        );
      });
    } else {
      lines.push('• All pharmacy medicines are currently above their reorder thresholds.');
    }

    lines.push('');
    lines.push('Earliest Expiries:');
    store.pharmacy.slice(0, 4).forEach((m) => {
      lines.push(`• ${m.name}: ${m.stock} ${m.unit} — Expires ${m.expiryDate} (${formatINR(m.unitPrice)}/unit)`);
    });
    lines.push('');
    lines.push('Workflow Tip: Open Pharmacy & Inventory (/dashboard/pharmacy) and click "Restock" on any row to add units immediately.');
    return { outOfScope: false, reply: lines.join('\n') };
  }

  // 5. Beds / Wards / Departments / Capacity
  if (
    q.includes('bed') ||
    q.includes('ward') ||
    q.includes('capacity') ||
    q.includes('occupancy') ||
    q.includes('department') ||
    entities.matchedDepts.length > 0
  ) {
    const targetDepts =
      entities.matchedDepts.length > 0
        ? entities.matchedDepts
        : [...store.departments].sort(
            (a, b) => b.occupiedBeds / b.totalBeds - a.occupiedBeds / a.totalBeds
          );

    const lines = [
      `Department & Bed Capacity Monitor — ${occupiedBeds}/${totalBeds} occupied (${freeBeds} free, ${occupancyPct}% total load)`,
      '',
    ];

    if (highLoadDepts.length > 0) {
      lines.push(
        `CRITICAL >=85% Wards: ${highLoadDepts.map((d) => `${d.name} (${Math.round((d.occupiedBeds / d.totalBeds) * 100)}%)`).join(', ')}`
      );
    } else if (watchDepts.length > 0) {
      lines.push(
        `Watch List (>=75% load, below 85% critical): ${watchDepts.map((d) => `${d.name} (${Math.round((d.occupiedBeds / d.totalBeds) * 100)}%)`).join(', ')}`
      );
    } else {
      lines.push('All departments are currently under 75% capacity.');
    }

    lines.push('');
    targetDepts.forEach((d) => {
      const pct = d.totalBeds ? Math.round((d.occupiedBeds / d.totalBeds) * 100) : 0;
      const free = Math.max(0, d.totalBeds - d.occupiedBeds);
      lines.push(
        `• ${d.name} (${d.floor}) — ${d.occupiedBeds}/${d.totalBeds} beds (${pct}%, ${free} free) | Head: ${d.headDoctor} | Active Doctors: ${d.activeDoctors} | Monthly Rev: ${formatINR(d.monthlyRevenue)}`
      );
    });
    lines.push('');
    lines.push('Workflow Tip: Adjust bed counts live on Departments (/dashboard/departments) using the + / - buttons.');
    return { outOfScope: false, reply: lines.join('\n') };
  }

  // 6. Billing / Pending Invoices / Payments / Revenue / Financial Analytics
  if (
    q.includes('invoice') ||
    q.includes('bill') ||
    q.includes('pending') ||
    q.includes('due') ||
    q.includes('balance') ||
    q.includes('collection') ||
    q.includes('payment') ||
    q.includes('transaction') ||
    q.includes('revenue') ||
    q.includes('analytics') ||
    q.includes('financial') ||
    q.includes('upi') ||
    q.includes('insurance') ||
    q.includes('refund') ||
    q.includes('profit')
  ) {
    const sevenDays = PAYMENT_TIMELINE_DATA['7 Days'];
    const weekIncoming = sevenDays.reduce((s, p) => s + p.incoming, 0);
    const weekOutgoing = sevenDays.reduce((s, p) => s + p.outgoing, 0);
    const weekNet = sevenDays.reduce((s, p) => s + p.totalRevenue, 0);

    const lines = [
      `Billing & INR Financial Monitor — Pending Balance: ${formatINR(pendingBalanceINR)} (${pendingInvoices.length} open invoice${pendingInvoices.length === 1 ? '' : 's'})`,
      '',
    ];

    if (pendingInvoices.length > 0) {
      lines.push('Pending / Partially Paid Invoices:');
      pendingInvoices.forEach((inv) => {
        const total = calcInvoiceTotal(inv);
        const bal = Math.max(0, total - inv.paidAmount);
        lines.push(
          `• ${inv.invoiceNo} — ${inv.patientName} (${inv.department}) | Total: ${formatINR(total)} | Paid: ${formatINR(inv.paidAmount)} | Due: ${formatINR(bal)} | Status: ${inv.status} | Due Date: ${inv.dueDate}`
        );
      });
    } else {
      lines.push('• All tracked invoices are fully Paid.');
    }

    lines.push('');
    lines.push(`7-Day Cashflow Summary: Incoming ${formatINR(weekIncoming)} | Outgoing ${formatINR(weekOutgoing)} | Net ${formatINR(weekNet)}`);
    lines.push(
      `Payment Method Mix: ${PAYMENT_METHODS_BREAKDOWN.map((m) => `${m.method} ${m.share}% (${formatINR(m.amount)})`).join(' · ')}`
    );

    const recentTxns = store.transactions.slice(0, 3);
    if (recentTxns.length > 0) {
      lines.push('');
      lines.push('Latest Transactions:');
      recentTxns.forEach((t) => {
        lines.push(`• ${t.id}: ${t.patientName} — ${formatINR(t.amount)} via ${t.method} (${t.status})`);
      });
    }

    lines.push('');
    lines.push('Workflow Tip: Record payments, create GST invoices, or print receipts in Payments & Billing (/dashboard/billing).');
    return { outOfScope: false, reply: lines.join('\n') };
  }

  // 7. Alerts & Notifications
  if (
    q.includes('alert') ||
    q.includes('notification') ||
    q.includes('unread') ||
    q.includes('warning') ||
    q.includes('risk')
  ) {
    const lines = [
      `Live Operational Alerts — ${unreadAlerts.length} unread notification(s), ${lowStockMeds.length} low-stock medicine(s), ${highLoadDepts.length} critical (>=85%) ward(s)`,
      '',
    ];

    if (unreadAlerts.length > 0) {
      lines.push('Unread Notifications:');
      unreadAlerts.forEach((n) => {
        lines.push(`• [${n.category}] ${n.title} (${n.time}) — ${n.detail}`);
      });
    } else {
      lines.push('• Zero unread notifications in the alert bell.');
    }

    if (lowStockMeds.length > 0) {
      lines.push('');
      lines.push(
        `Low Pharmacy Stock: ${lowStockMeds.map((m) => `${m.name} (${m.stock}/${m.reorderLevel} ${m.unit})`).join('; ')}`
      );
    }

    if (pendingBalanceINR > 0) {
      lines.push(`Pending Collections: ${formatINR(pendingBalanceINR)} due across ${pendingInvoices.length} invoice(s).`);
    }

    return { outOfScope: false, reply: lines.join('\n') };
  }

  // 8. Patients
  if (
    q.includes('patient') ||
    q.includes('critical') ||
    q.includes('admitted') ||
    q.includes('outpatient') ||
    q.includes('discharged')
  ) {
    const critical = store.patients.filter((p) => p.status === 'Critical');
    const admitted = store.patients.filter((p) => p.status === 'Admitted');
    const outpatient = store.patients.filter((p) => p.status === 'Outpatient');
    const discharged = store.patients.filter((p) => p.status === 'Discharged');

    const lines = [
      `Patient Registry Monitor — ${totalPatientsShown.toLocaleString('en-IN')} hospital total (${store.patients.length} tracked records)`,
      `Breakdown: ${critical.length} Critical · ${admitted.length} Admitted · ${outpatient.length} Outpatient · ${discharged.length} Discharged`,
      '',
    ];

    if (critical.length > 0) {
      lines.push('Critical Priority:');
      critical.forEach((p) => {
        lines.push(`• ${p.name} (${p.id}, ${p.age}y) — ${p.department} | ${p.doctor} | ${p.notes}`);
      });
      lines.push('');
    }

    lines.push('Admitted Patients:');
    admitted.slice(0, 5).forEach((p) => {
      lines.push(`• ${p.name} (${p.id}) — ${p.department} | ${p.doctor}`);
    });

    lines.push('');
    lines.push('Workflow Tip: Register or inspect patients in Patients (/dashboard/patients).');
    return { outOfScope: false, reply: lines.join('\n') };
  }

  // 9. Doctors & Staff
  if (
    q.includes('doctor') ||
    q.includes('staff') ||
    q.includes('surgeon') ||
    q.includes('surgery') ||
    q.includes('opd') ||
    q.includes('available') ||
    q.includes('availability') ||
    q.includes('leave') ||
    q.includes('shift') ||
    q.includes('fee')
  ) {
    const lines = [
      `Doctors & Staff Roster — ${totalDoctorsShown} hospital total (${store.doctors.length} tracked specialists)`,
      '',
    ];
    store.doctors.forEach((d) => {
      lines.push(
        `• ${d.name} (${d.department}) — ${d.availability} | Fee: ${formatINR(d.fee)} | Today: ${d.patientsToday} pts | Shift: ${d.shift}`
      );
    });
    lines.push('');
    lines.push('Workflow Tip: Toggle doctor availability or add specialists in Doctors & Staff (/dashboard/doctors).');
    return { outOfScope: false, reply: lines.join('\n') };
  }

  // 10. Appointments
  if (
    q.includes('appointment') ||
    q.includes('schedule') ||
    q.includes('booking') ||
    q.includes('slot') ||
    q.includes('follow-up')
  ) {
    const scheduled = store.appointments.filter((a) => a.status === 'Scheduled');
    const pending = store.appointments.filter((a) => a.status === 'Pending');
    const completed = store.appointments.filter((a) => a.status === 'Completed');
    const cancelled = store.appointments.filter((a) => a.status === 'Cancelled');

    const lines = [
      `Appointments Monitor — ${todaysAppointmentsShown} shown for today (${store.appointments.length} tracked)`,
      `Status Mix: ${scheduled.length} Scheduled · ${pending.length} Pending · ${completed.length} Completed · ${cancelled.length} Cancelled`,
      '',
      'Upcoming / Pending Slots:',
    ];
    store.appointments
      .filter((a) => a.status === 'Scheduled' || a.status === 'Pending')
      .slice(0, 6)
      .forEach((a) => {
        lines.push(
          `• ${a.id} (${a.date}, ${a.time}) — ${a.patientName} with ${a.doctorName} (${a.department}, ${a.type}) [${a.status}]`
        );
      });
    lines.push('');
    lines.push('Workflow Tip: Book or update appointments in Appointments (/dashboard/appointments).');
    return { outOfScope: false, reply: lines.join('\n') };
  }

  // 11. PWA Install / Mobile App / Offline
  if (
    q.includes('pwa') ||
    q.includes('install') ||
    q.includes('android') ||
    q.includes('ios') ||
    q.includes('iphone') ||
    q.includes('offline') ||
    q.includes('apk') ||
    q.includes('home screen')
  ) {
    return {
      outOfScope: false,
      reply: [
        'MediCore 3D PWA Mobile Installation Guide:',
        '',
        '• Android (Chrome): Open the Shared App URL in Chrome and tap "Install App" in the MediCore top bar (or Chrome menu -> Add to Home screen / Install app). It installs full-screen with the MediCore 3D icon.',
        '• iOS (Safari): Open in Safari -> tap Share -> "Add to Home Screen".',
        '• Offline Support: Cached dashboard shells and assets load offline; an offline banner appears automatically whenever network connectivity drops.',
      ].join('\n'),
    };
  }

  // 12. Reports / CSV / Settings / Navigation / Login
  if (q.includes('report') || q.includes('csv') || q.includes('export') || q.includes('download')) {
    return {
      outOfScope: false,
      reply: [
        'Reports & CSV Exports (/dashboard/reports):',
        '',
        '• Export live snapshots directly as CSV files for Patients Registry, Billing Transactions, Department Bed Occupancy, and Pharmacy Inventory.',
        '• All exports reflect edits made during your current session (new patients, recorded payments, bed updates, or restocks).',
      ].join('\n'),
    };
  }

  if (
    q.includes('setting') ||
    q.includes('gst') ||
    q.includes('tax') ||
    q.includes('timeout')
  ) {
    return {
      outOfScope: false,
      reply: [
        `Hospital Settings (/dashboard/settings) — ${store.settings.hospitalName}`,
        '',
        `• Registration Code: ${store.settings.registrationCode}`,
        `• GSTIN: ${store.settings.gstNumber} | Default Tax: ${store.settings.defaultTaxPct}%`,
        `• Low-Stock Alerts: ${store.settings.lowStockAlerts ? 'Enabled' : 'Disabled'} | Auto-Email Receipts: ${store.settings.paymentReceiptsAutoEmail ? 'Enabled' : 'Disabled'}`,
        `• Session Timeout: ${store.settings.sessionTimeoutMinutes} minutes`,
      ].join('\n'),
    };
  }

  // 13. General app navigation / current route fallback
  const guide = getRouteGuide(currentRoute);
  return {
    outOfScope: false,
    reply: [
      `Current Screen: ${guide.title} (${guide.route})`,
      ...guide.tips.map((t) => `• ${t}`),
      '',
      `Live Pulse: ${freeBeds} beds free (${occupancyPct}% occupied) · ${lowStockMeds.length} low-stock medicine(s) · ${formatINR(pendingBalanceINR)} pending dues · ${unreadAlerts.length} unread alert(s).`,
    ].join('\n'),
  };
}
