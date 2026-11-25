export type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Insurance' | 'Bank Transfer';
export type PaymentStatus = 'Paid' | 'Pending' | 'Partially Paid' | 'Refunded';
export type TimeRangeKey = 'Today' | '7 Days' | '30 Days' | '3 Months' | '6 Months' | '1 Year';

export interface TimelinePoint {
  label: string;
  fullDate: string;
  time: string;
  incoming: number;
  outgoing: number;
  totalRevenue: number;
  pending: number;
  refunds: number;
  primaryMethod: PaymentMethod;
  status: PaymentStatus;
}

export interface TransactionRecord {
  id: string;
  patientName: string;
  patientId: string;
  invoiceNo: string;
  date: string;
  time: string;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  department: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  department: string;
  regDate: string;
  status: 'Admitted' | 'Outpatient' | 'Discharged' | 'Critical';
  bloodGroup: string;
  doctor: string;
  email: string;
  notes: string;
}

export interface DoctorRecord {
  id: string;
  name: string;
  specialization: string;
  department: string;
  availability: 'Available' | 'In Surgery' | 'On Leave' | 'OPD Active';
  fee: number;
  experienceYears: number;
  shift: string;
  phone: string;
  patientsToday: number;
}

export interface AppointmentRecord {
  id: string;
  patientName: string;
  patientId: string;
  doctorName: string;
  department: string;
  date: string;
  dayLabel: string;
  time: string;
  type: 'Consultation' | 'Follow-up' | 'Diagnostics' | 'Procedure';
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Pending';
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string;
  patientName: string;
  patientId: string;
  date: string;
  dueDate: string;
  department: string;
  lineItems: InvoiceLineItem[];
  discountPct: number;
  taxPct: number;
  paidAmount: number;
  status: PaymentStatus;
  method: PaymentMethod;
}

export interface DepartmentRecord {
  id: string;
  name: string;
  headDoctor: string;
  totalBeds: number;
  occupiedBeds: number;
  activeDoctors: number;
  todayVisits: number;
  monthlyRevenue: number;
  floor: string;
}

export interface PharmacyItem {
  id: string;
  name: string;
  category: string;
  batchNo: string;
  stock: number;
  reorderLevel: number;
  unit: string;
  unitPrice: number;
  expiryDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  category: 'Billing' | 'Clinical' | 'Inventory' | 'Schedule';
  read: boolean;
}

export const PAYMENT_TIMELINE_DATA: Record<TimeRangeKey, TimelinePoint[]> = {
  Today: [
    { label: '08:00', fullDate: '23 Nov 2026', time: '08:15 AM', incoming: 8400, outgoing: 2200, totalRevenue: 6200, pending: 1500, refunds: 0, primaryMethod: 'UPI', status: 'Paid' },
    { label: '10:00', fullDate: '23 Nov 2026', time: '10:20 AM', incoming: 16200, outgoing: 4100, totalRevenue: 12100, pending: 2800, refunds: 600, primaryMethod: 'Card', status: 'Paid' },
    { label: '12:00', fullDate: '23 Nov 2026', time: '12:05 PM', incoming: 24500, outgoing: 6800, totalRevenue: 17700, pending: 4200, refunds: 1200, primaryMethod: 'Insurance', status: 'Partially Paid' },
    { label: '14:00', fullDate: '23 Nov 2026', time: '02:18 PM', incoming: 19800, outgoing: 5400, totalRevenue: 14400, pending: 3100, refunds: 800, primaryMethod: 'UPI', status: 'Paid' },
    { label: '16:00', fullDate: '23 Nov 2026', time: '04:40 PM', incoming: 28900, outgoing: 7200, totalRevenue: 21700, pending: 4800, refunds: 950, primaryMethod: 'Bank Transfer', status: 'Paid' },
    { label: '18:00', fullDate: '23 Nov 2026', time: '06:12 PM', incoming: 22400, outgoing: 5900, totalRevenue: 16500, pending: 2900, refunds: 400, primaryMethod: 'Cash', status: 'Pending' },
    { label: '20:00', fullDate: '23 Nov 2026', time: '08:04 PM', incoming: 14600, outgoing: 3600, totalRevenue: 11000, pending: 1900, refunds: 300, primaryMethod: 'UPI', status: 'Paid' },
  ],
  '7 Days': [
    { label: 'Nov 17', fullDate: '17 Nov 2026', time: '11:40 AM', incoming: 38500, outgoing: 12400, totalRevenue: 26100, pending: 6200, refunds: 1800, primaryMethod: 'UPI', status: 'Paid' },
    { label: 'Nov 18', fullDate: '18 Nov 2026', time: '02:15 PM', incoming: 44200, outgoing: 14800, totalRevenue: 29400, pending: 7400, refunds: 2100, primaryMethod: 'Card', status: 'Paid' },
    { label: 'Nov 19', fullDate: '19 Nov 2026', time: '10:50 AM', incoming: 36900, outgoing: 11200, totalRevenue: 25700, pending: 8900, refunds: 1400, primaryMethod: 'Insurance', status: 'Partially Paid' },
    { label: 'Nov 20', fullDate: '20 Nov 2026', time: '04:25 PM', incoming: 51800, outgoing: 16500, totalRevenue: 35300, pending: 5400, refunds: 2600, primaryMethod: 'Bank Transfer', status: 'Paid' },
    { label: 'Nov 21', fullDate: '21 Nov 2026', time: '01:10 PM', incoming: 47600, outgoing: 15200, totalRevenue: 32400, pending: 6800, refunds: 1900, primaryMethod: 'UPI', status: 'Paid' },
    { label: 'Nov 22', fullDate: '22 Nov 2026', time: '05:35 PM', incoming: 56400, outgoing: 17900, totalRevenue: 38500, pending: 4900, refunds: 2200, primaryMethod: 'Card', status: 'Paid' },
    { label: 'Nov 23', fullDate: '23 Nov 2026', time: '01:55 PM', incoming: 58900, outgoing: 18400, totalRevenue: 40500, pending: 7100, refunds: 1500, primaryMethod: 'UPI', status: 'Pending' },
  ],
  '30 Days': [
    { label: 'Wk 1', fullDate: '25 Oct – 31 Oct', time: '03:10 PM', incoming: 184000, outgoing: 62000, totalRevenue: 122000, pending: 28000, refunds: 8500, primaryMethod: 'Insurance', status: 'Paid' },
    { label: 'Wk 2', fullDate: '01 Nov – 07 Nov', time: '11:25 AM', incoming: 212000, outgoing: 71000, totalRevenue: 141000, pending: 31500, refunds: 7200, primaryMethod: 'UPI', status: 'Paid' },
    { label: 'Wk 3', fullDate: '08 Nov – 14 Nov', time: '04:45 PM', incoming: 198500, outgoing: 66000, totalRevenue: 132500, pending: 34000, refunds: 9100, primaryMethod: 'Card', status: 'Partially Paid' },
    { label: 'Wk 4', fullDate: '15 Nov – 21 Nov', time: '01:30 PM', incoming: 236000, outgoing: 74500, totalRevenue: 161500, pending: 24500, refunds: 6800, primaryMethod: 'Bank Transfer', status: 'Paid' },
    { label: 'Nov 23', fullDate: '22 Nov – 23 Nov', time: '01:55 PM', incoming: 115300, outgoing: 36300, totalRevenue: 79000, pending: 12000, refunds: 3700, primaryMethod: 'UPI', status: 'Paid' },
  ],
  '3 Months': [
    { label: 'Sep W1-2', fullDate: '01 Sep – 15 Sep', time: '12:00 PM', incoming: 342000, outgoing: 118000, totalRevenue: 224000, pending: 42000, refunds: 14000, primaryMethod: 'Insurance', status: 'Paid' },
    { label: 'Sep W3-4', fullDate: '16 Sep – 30 Sep', time: '02:30 PM', incoming: 378000, outgoing: 126000, totalRevenue: 252000, pending: 39000, refunds: 12500, primaryMethod: 'UPI', status: 'Paid' },
    { label: 'Oct W1-2', fullDate: '01 Oct – 15 Oct', time: '05:10 PM', incoming: 395000, outgoing: 131000, totalRevenue: 264000, pending: 48000, refunds: 16000, primaryMethod: 'Card', status: 'Partially Paid' },
    { label: 'Oct W3-4', fullDate: '16 Oct – 31 Oct', time: '11:45 AM', incoming: 428000, outgoing: 139000, totalRevenue: 289000, pending: 36000, refunds: 11800, primaryMethod: 'Bank Transfer', status: 'Paid' },
    { label: 'Nov W1-2', fullDate: '01 Nov – 15 Nov', time: '03:20 PM', incoming: 446000, outgoing: 144000, totalRevenue: 302000, pending: 41000, refunds: 13200, primaryMethod: 'UPI', status: 'Paid' },
    { label: 'Nov W3', fullDate: '16 Nov – 23 Nov', time: '01:55 PM', incoming: 312000, outgoing: 98000, totalRevenue: 214000, pending: 38400, refunds: 9400, primaryMethod: 'UPI', status: 'Paid' },
  ],
  '6 Months': [
    { label: 'Jun', fullDate: 'June 2026', time: 'Monthly Close', incoming: 640000, outgoing: 224000, totalRevenue: 416000, pending: 58000, refunds: 22000, primaryMethod: 'Insurance', status: 'Paid' },
    { label: 'Jul', fullDate: 'July 2026', time: 'Monthly Close', incoming: 685000, outgoing: 238000, totalRevenue: 447000, pending: 52000, refunds: 19500, primaryMethod: 'UPI', status: 'Paid' },
    { label: 'Aug', fullDate: 'August 2026', time: 'Monthly Close', incoming: 712000, outgoing: 245000, totalRevenue: 467000, pending: 61000, refunds: 24000, primaryMethod: 'Card', status: 'Paid' },
    { label: 'Sep', fullDate: 'September 2026', time: 'Monthly Close', incoming: 720000, outgoing: 244000, totalRevenue: 476000, pending: 49000, refunds: 26500, primaryMethod: 'Bank Transfer', status: 'Partially Paid' },
    { label: 'Oct', fullDate: 'October 2026', time: 'Monthly Close', incoming: 823000, outgoing: 270000, totalRevenue: 553000, pending: 44000, refunds: 21800, primaryMethod: 'UPI', status: 'Paid' },
    { label: 'Nov', fullDate: 'November 2026 (MTD)', time: '23 Nov 2026', incoming: 758000, outgoing: 242000, totalRevenue: 516000, pending: 38400, refunds: 18600, primaryMethod: 'UPI', status: 'Paid' },
  ],
  '1 Year': [
    { label: 'Dec', fullDate: 'December 2025', time: 'Fiscal Period', incoming: 580000, outgoing: 205000, totalRevenue: 375000, pending: 64000, refunds: 18000, primaryMethod: 'Cash', status: 'Paid' },
    { label: 'Feb', fullDate: 'February 2026', time: 'Fiscal Period', incoming: 612000, outgoing: 214000, totalRevenue: 398000, pending: 55000, refunds: 19000, primaryMethod: 'Card', status: 'Paid' },
    { label: 'Apr', fullDate: 'April 2026', time: 'Fiscal Period', incoming: 654000, outgoing: 228000, totalRevenue: 426000, pending: 59000, refunds: 21000, primaryMethod: 'Insurance', status: 'Paid' },
    { label: 'Jun', fullDate: 'June 2026', time: 'Fiscal Period', incoming: 640000, outgoing: 224000, totalRevenue: 416000, pending: 58000, refunds: 22000, primaryMethod: 'UPI', status: 'Paid' },
    { label: 'Aug', fullDate: 'August 2026', time: 'Fiscal Period', incoming: 712000, outgoing: 245000, totalRevenue: 467000, pending: 61000, refunds: 24000, primaryMethod: 'Bank Transfer', status: 'Partially Paid' },
    { label: 'Oct', fullDate: 'October 2026', time: 'Fiscal Period', incoming: 823000, outgoing: 270000, totalRevenue: 553000, pending: 44000, refunds: 21800, primaryMethod: 'UPI', status: 'Paid' },
    { label: 'Nov', fullDate: 'November 2026', time: '23 Nov 2026', incoming: 758000, outgoing: 242000, totalRevenue: 516000, pending: 38400, refunds: 18600, primaryMethod: 'UPI', status: 'Paid' },
  ],
};

export const PAYMENT_METHODS_BREAKDOWN: {
  method: PaymentMethod;
  amount: number;
  share: number;
  count: number;
  color: string;
}[] = [
  { method: 'UPI', amount: 102900, share: 42, count: 148, color: '#0070F3' },
  { method: 'Card', amount: 53900, share: 22, count: 64, color: '#0EA5E9' },
  { method: 'Insurance', amount: 46550, share: 19, count: 29, color: '#10B981' },
  { method: 'Bank Transfer', amount: 24500, share: 10, count: 18, color: '#F59E0B' },
  { method: 'Cash', amount: 17150, share: 7, count: 31, color: '#E11D48' },
];

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  { id: 'TXN-9482', patientName: 'Aarav Sharma', patientId: 'PT-1041', invoiceNo: 'INV-2026-4412', date: '23 Nov 2026', time: '01:42 PM', method: 'UPI', amount: 2500, status: 'Paid', department: 'Cardiology' },
  { id: 'TXN-9481', patientName: 'Priya Nair', patientId: 'PT-1042', invoiceNo: 'INV-2026-4411', date: '23 Nov 2026', time: '01:15 PM', method: 'Insurance', amount: 4800, status: 'Pending', department: 'Orthopedics' },
  { id: 'TXN-9480', patientName: 'Rajesh Kulkarni', patientId: 'PT-1043', invoiceNo: 'INV-2026-4410', date: '23 Nov 2026', time: '12:38 PM', method: 'Card', amount: 1200, status: 'Paid', department: 'General Medicine' },
  { id: 'TXN-9479', patientName: 'Meera Iyer', patientId: 'PT-1044', invoiceNo: 'INV-2026-4409', date: '23 Nov 2026', time: '11:50 AM', method: 'Bank Transfer', amount: 18500, status: 'Partially Paid', department: 'Neurology' },
  { id: 'TXN-9478', patientName: 'Vikram Deshmukh', patientId: 'PT-1045', invoiceNo: 'INV-2026-4408', date: '23 Nov 2026', time: '10:25 AM', method: 'UPI', amount: 3400, status: 'Paid', department: 'Diagnostics' },
  { id: 'TXN-9477', patientName: 'Ananya Chatterjee', patientId: 'PT-1046', invoiceNo: 'INV-2026-4407', date: '22 Nov 2026', time: '06:10 PM', method: 'Cash', amount: 950, status: 'Refunded', department: 'Pediatrics' },
  { id: 'TXN-9476', patientName: 'Siddharth Verma', patientId: 'PT-1047', invoiceNo: 'INV-2026-4406', date: '22 Nov 2026', time: '04:52 PM', method: 'Insurance', amount: 28400, status: 'Paid', department: 'Oncology' },
  { id: 'TXN-9475', patientName: 'Kavitha Reddy', patientId: 'PT-1048', invoiceNo: 'INV-2026-4405', date: '22 Nov 2026', time: '03:18 PM', method: 'UPI', amount: 4200, status: 'Paid', department: 'Gynecology' },
  { id: 'TXN-9474', patientName: 'Rohan Malhotra', patientId: 'PT-1049', invoiceNo: 'INV-2026-4404', date: '21 Nov 2026', time: '05:45 PM', method: 'Card', amount: 7600, status: 'Pending', department: 'Emergency & Trauma' },
  { id: 'TXN-9473', patientName: 'Deepika Joshi', patientId: 'PT-1050', invoiceNo: 'INV-2026-4403', date: '21 Nov 2026', time: '02:04 PM', method: 'Bank Transfer', amount: 14900, status: 'Paid', department: 'Cardiology' },
  { id: 'TXN-9472', patientName: 'Arjun Menon', patientId: 'PT-1051', invoiceNo: 'INV-2026-4402', date: '20 Nov 2026', time: '04:30 PM', method: 'UPI', amount: 3150, status: 'Paid', department: 'Orthopedics' },
  { id: 'TXN-9471', patientName: 'Neha Bansal', patientId: 'PT-1052', invoiceNo: 'INV-2026-4401', date: '20 Nov 2026', time: '11:20 AM', method: 'Card', amount: 6400, status: 'Partially Paid', department: 'Diagnostics' },
  { id: 'TXN-9470', patientName: 'Harishchandra Rao', patientId: 'PT-1053', invoiceNo: 'INV-2026-4400', date: '19 Nov 2026', time: '01:55 PM', method: 'Cash', amount: 1850, status: 'Paid', department: 'General Medicine' },
  { id: 'TXN-9469', patientName: 'Sneha Kulkarni', patientId: 'PT-1054', invoiceNo: 'INV-2026-4399', date: '18 Nov 2026', time: '03:40 PM', method: 'UPI', amount: 5200, status: 'Refunded', department: 'Neurology' },
  { id: 'TXN-9468', patientName: 'Karthik Subramanian', patientId: 'PT-1055', invoiceNo: 'INV-2026-4398', date: '17 Nov 2026', time: '12:12 PM', method: 'Insurance', amount: 22000, status: 'Paid', department: 'Cardiology' },
];

export const INITIAL_PATIENTS: PatientRecord[] = [
  { id: 'PT-1041', name: 'Aarav Sharma', age: 42, gender: 'Male', phone: '+91 98201 44120', department: 'Cardiology', regDate: '23 Nov 2026', status: 'Admitted', bloodGroup: 'O+', doctor: 'Dr. Raghavendra Rao', email: 'aarav.sharma@mail.demo', notes: 'Post-angiography monitoring; vitals stable.' },
  { id: 'PT-1042', name: 'Priya Nair', age: 34, gender: 'Female', phone: '+91 98452 31098', department: 'Orthopedics', regDate: '23 Nov 2026', status: 'Outpatient', bloodGroup: 'A+', doctor: 'Dr. Vikramaditya Sen', email: 'priya.nair@mail.demo', notes: 'ACL physiotherapy week 4 review.' },
  { id: 'PT-1043', name: 'Rajesh Kulkarni', age: 58, gender: 'Male', phone: '+91 97650 88214', department: 'General Medicine', regDate: '23 Nov 2026', status: 'Outpatient', bloodGroup: 'B+', doctor: 'Dr. Nandini Krishnan', email: 'rajesh.k@mail.demo', notes: 'Routine hypertension medication titration.' },
  { id: 'PT-1044', name: 'Meera Iyer', age: 61, gender: 'Female', phone: '+91 99001 74532', department: 'Neurology', regDate: '22 Nov 2026', status: 'Admitted', bloodGroup: 'AB+', doctor: 'Dr. Farhan Qureshi', email: 'meera.iyer@mail.demo', notes: 'Scheduled for cranial MRI follow-up at 16:00.' },
  { id: 'PT-1045', name: 'Vikram Deshmukh', age: 49, gender: 'Male', phone: '+91 98230 11940', department: 'Diagnostics', regDate: '22 Nov 2026', status: 'Outpatient', bloodGroup: 'O-', doctor: 'Dr. Shalini Kapoor', email: 'vikram.d@mail.demo', notes: 'Comprehensive lipid and cardiac marker panel.' },
  { id: 'PT-1046', name: 'Ananya Chatterjee', age: 9, gender: 'Female', phone: '+91 98311 65022', department: 'Pediatrics', regDate: '21 Nov 2026', status: 'Discharged', bloodGroup: 'A-', doctor: 'Dr. Devika Menon', email: 'chatterjee.family@mail.demo', notes: 'Recovered from viral bronchitis; home care plan issued.' },
  { id: 'PT-1047', name: 'Siddharth Verma', age: 53, gender: 'Male', phone: '+91 99104 52891', department: 'Oncology', regDate: '20 Nov 2026', status: 'Admitted', bloodGroup: 'B-', doctor: 'Dr. Aditya Deshpande', email: 'siddharth.v@mail.demo', notes: 'Cycle 3 infusion completed smoothly.' },
  { id: 'PT-1048', name: 'Kavitha Reddy', age: 29, gender: 'Female', phone: '+91 98490 77412', department: 'Gynecology', regDate: '20 Nov 2026', status: 'Outpatient', bloodGroup: 'O+', doctor: 'Dr. Sunita Hegde', email: 'kavitha.r@mail.demo', notes: 'Third trimester antenatal consultation.' },
  { id: 'PT-1049', name: 'Rohan Malhotra', age: 37, gender: 'Male', phone: '+91 98112 90345', department: 'Emergency & Trauma', regDate: '19 Nov 2026', status: 'Critical', bloodGroup: 'B+', doctor: 'Dr. Kabir Ahluwalia', email: 'rohan.m@mail.demo', notes: 'ICU observation bed 04; orthopedic stabilization complete.' },
  { id: 'PT-1050', name: 'Deepika Joshi', age: 45, gender: 'Female', phone: '+91 97698 34210', department: 'Cardiology', regDate: '18 Nov 2026', status: 'Discharged', bloodGroup: 'A+', doctor: 'Dr. Raghavendra Rao', email: 'deepika.j@mail.demo', notes: 'Echocardiogram cleared; follow-up in 14 days.' },
];

export const INITIAL_DOCTORS: DoctorRecord[] = [
  { id: 'DOC-201', name: 'Dr. Raghavendra Rao', specialization: 'Interventional Cardiology', department: 'Cardiology', availability: 'OPD Active', fee: 1200, experienceYears: 18, shift: '09:00 AM – 05:00 PM', phone: '+91 98400 10101', patientsToday: 14 },
  { id: 'DOC-202', name: 'Dr. Vikramaditya Sen', specialization: 'Joint & Spine Surgery', department: 'Orthopedics', availability: 'In Surgery', fee: 1100, experienceYears: 15, shift: '08:00 AM – 04:00 PM', phone: '+91 98400 10102', patientsToday: 9 },
  { id: 'DOC-203', name: 'Dr. Farhan Qureshi', specialization: 'Clinical Neurology', department: 'Neurology', availability: 'Available', fee: 1300, experienceYears: 14, shift: '10:00 AM – 06:00 PM', phone: '+91 98400 10103', patientsToday: 11 },
  { id: 'DOC-204', name: 'Dr. Devika Menon', specialization: 'Pediatric Intensive Care', department: 'Pediatrics', availability: 'OPD Active', fee: 850, experienceYears: 11, shift: '09:00 AM – 05:00 PM', phone: '+91 98400 10104', patientsToday: 16 },
  { id: 'DOC-205', name: 'Dr. Aditya Deshpande', specialization: 'Medical Oncology', department: 'Oncology', availability: 'Available', fee: 1500, experienceYears: 20, shift: '09:30 AM – 05:30 PM', phone: '+91 98400 10105', patientsToday: 8 },
  { id: 'DOC-206', name: 'Dr. Nandini Krishnan', specialization: 'Internal Medicine', department: 'General Medicine', availability: 'OPD Active', fee: 750, experienceYears: 12, shift: '08:30 AM – 04:30 PM', phone: '+91 98400 10106', patientsToday: 19 },
  { id: 'DOC-207', name: 'Dr. Kabir Ahluwalia', specialization: 'Trauma & Emergency', department: 'Emergency & Trauma', availability: 'In Surgery', fee: 1000, experienceYears: 13, shift: 'Rotational ICU', phone: '+91 98400 10107', patientsToday: 12 },
  { id: 'DOC-208', name: 'Dr. Sunita Hegde', specialization: 'Obstetrics & Gynecology', department: 'Gynecology', availability: 'On Leave', fee: 950, experienceYears: 16, shift: '10:00 AM – 06:00 PM', phone: '+91 98400 10108', patientsToday: 0 },
];

export const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  { id: 'APT-301', patientName: 'Aarav Sharma', patientId: 'PT-1041', doctorName: 'Dr. Raghavendra Rao', department: 'Cardiology', date: '23 Nov 2026', dayLabel: 'Mon', time: '09:30 AM', type: 'Follow-up', status: 'Completed' },
  { id: 'APT-302', patientName: 'Priya Nair', patientId: 'PT-1042', doctorName: 'Dr. Vikramaditya Sen', department: 'Orthopedics', date: '23 Nov 2026', dayLabel: 'Mon', time: '11:00 AM', type: 'Consultation', status: 'Scheduled' },
  { id: 'APT-303', patientName: 'Meera Iyer', patientId: 'PT-1044', doctorName: 'Dr. Farhan Qureshi', department: 'Neurology', date: '23 Nov 2026', dayLabel: 'Mon', time: '02:30 PM', type: 'Diagnostics', status: 'Scheduled' },
  { id: 'APT-304', patientName: 'Vikram Deshmukh', patientId: 'PT-1045', doctorName: 'Dr. Nandini Krishnan', department: 'General Medicine', date: '23 Nov 2026', dayLabel: 'Mon', time: '04:00 PM', type: 'Consultation', status: 'Pending' },
  { id: 'APT-305', patientName: 'Kavitha Reddy', patientId: 'PT-1048', doctorName: 'Dr. Sunita Hegde', department: 'Gynecology', date: '24 Nov 2026', dayLabel: 'Tue', time: '10:30 AM', type: 'Follow-up', status: 'Scheduled' },
  { id: 'APT-306', patientName: 'Siddharth Verma', patientId: 'PT-1047', doctorName: 'Dr. Aditya Deshpande', department: 'Oncology', date: '25 Nov 2026', dayLabel: 'Wed', time: '11:30 AM', type: 'Procedure', status: 'Scheduled' },
  { id: 'APT-307', patientName: 'Rajesh Kulkarni', patientId: 'PT-1043', doctorName: 'Dr. Nandini Krishnan', department: 'General Medicine', date: '26 Nov 2026', dayLabel: 'Thu', time: '09:45 AM', type: 'Follow-up', status: 'Pending' },
  { id: 'APT-308', patientName: 'Ananya Chatterjee', patientId: 'PT-1046', doctorName: 'Dr. Devika Menon', department: 'Pediatrics', date: '27 Nov 2026', dayLabel: 'Fri', time: '03:15 PM', type: 'Consultation', status: 'Cancelled' },
  { id: 'APT-309', patientName: 'Deepika Joshi', patientId: 'PT-1050', doctorName: 'Dr. Raghavendra Rao', department: 'Cardiology', date: '28 Nov 2026', dayLabel: 'Sat', time: '10:00 AM', type: 'Follow-up', status: 'Scheduled' },
];

export const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'INVR-1',
    invoiceNo: 'INV-2026-4412',
    patientName: 'Aarav Sharma',
    patientId: 'PT-1041',
    date: '23 Nov 2026',
    dueDate: '23 Nov 2026',
    department: 'Cardiology',
    lineItems: [
      { id: 'li-1', description: 'Cardiology Specialist Consultation', qty: 1, unitPrice: 1200 },
      { id: 'li-2', description: '12-Lead ECG & Troponin Panel', qty: 1, unitPrice: 1300 },
    ],
    discountPct: 0,
    taxPct: 0,
    paidAmount: 2500,
    status: 'Paid',
    method: 'UPI',
  },
  {
    id: 'INVR-2',
    invoiceNo: 'INV-2026-4411',
    patientName: 'Priya Nair',
    patientId: 'PT-1042',
    date: '23 Nov 2026',
    dueDate: '30 Nov 2026',
    department: 'Orthopedics',
    lineItems: [
      { id: 'li-3', description: 'Orthopedic Consultation & Brace', qty: 1, unitPrice: 2600 },
      { id: 'li-4', description: 'Digital Knee X-Ray (2 Views)', qty: 1, unitPrice: 2200 },
    ],
    discountPct: 0,
    taxPct: 0,
    paidAmount: 0,
    status: 'Pending',
    method: 'Insurance',
  },
  {
    id: 'INVR-3',
    invoiceNo: 'INV-2026-4409',
    patientName: 'Meera Iyer',
    patientId: 'PT-1044',
    date: '23 Nov 2026',
    dueDate: '28 Nov 2026',
    department: 'Neurology',
    lineItems: [
      { id: 'li-5', description: 'Cranial MRI with Contrast', qty: 1, unitPrice: 14500 },
      { id: 'li-6', description: 'Neurology Ward Bed (2 Days)', qty: 2, unitPrice: 4500 },
    ],
    discountPct: 5,
    taxPct: 5,
    paidAmount: 18500,
    status: 'Partially Paid',
    method: 'Bank Transfer',
  },
  {
    id: 'INVR-4',
    invoiceNo: 'INV-2026-4406',
    patientName: 'Siddharth Verma',
    patientId: 'PT-1047',
    date: '22 Nov 2026',
    dueDate: '22 Nov 2026',
    department: 'Oncology',
    lineItems: [
      { id: 'li-7', description: 'Daycare Infusion Therapy', qty: 1, unitPrice: 24000 },
      { id: 'li-8', description: 'Complete Blood & Metabolic Panel', qty: 1, unitPrice: 4400 },
    ],
    discountPct: 0,
    taxPct: 0,
    paidAmount: 28400,
    status: 'Paid',
    method: 'Insurance',
  },
];

export const INITIAL_DEPARTMENTS: DepartmentRecord[] = [
  { id: 'DEP-1', name: 'Cardiology', headDoctor: 'Dr. Raghavendra Rao', totalBeds: 40, occupiedBeds: 31, activeDoctors: 7, todayVisits: 48, monthlyRevenue: 685000, floor: 'Tower A · Level 3' },
  { id: 'DEP-2', name: 'Orthopedics', headDoctor: 'Dr. Vikramaditya Sen', totalBeds: 32, occupiedBeds: 22, activeDoctors: 6, todayVisits: 34, monthlyRevenue: 492000, floor: 'Tower A · Level 2' },
  { id: 'DEP-3', name: 'Neurology', headDoctor: 'Dr. Farhan Qureshi', totalBeds: 28, occupiedBeds: 21, activeDoctors: 5, todayVisits: 27, monthlyRevenue: 518000, floor: 'Tower B · Level 4' },
  { id: 'DEP-4', name: 'Pediatrics', headDoctor: 'Dr. Devika Menon', totalBeds: 30, occupiedBeds: 18, activeDoctors: 6, todayVisits: 42, monthlyRevenue: 312000, floor: 'Tower B · Level 1' },
  { id: 'DEP-5', name: 'Oncology', headDoctor: 'Dr. Aditya Deshpande', totalBeds: 26, occupiedBeds: 20, activeDoctors: 5, todayVisits: 22, monthlyRevenue: 644000, floor: 'Tower C · Level 3' },
  { id: 'DEP-6', name: 'Emergency & Trauma', headDoctor: 'Dr. Kabir Ahluwalia', totalBeds: 24, occupiedBeds: 19, activeDoctors: 6, todayVisits: 51, monthlyRevenue: 425000, floor: 'Ground Level · Bay 1' },
  { id: 'DEP-7', name: 'General Medicine', headDoctor: 'Dr. Nandini Krishnan', totalBeds: 24, occupiedBeds: 15, activeDoctors: 4, todayVisits: 63, monthlyRevenue: 288000, floor: 'Tower A · Level 1' },
  { id: 'DEP-8', name: 'Gynecology', headDoctor: 'Dr. Sunita Hegde', totalBeds: 16, occupiedBeds: 10, activeDoctors: 3, todayVisits: 29, monthlyRevenue: 345000, floor: 'Tower B · Level 2' },
];

export const INITIAL_PHARMACY: PharmacyItem[] = [
  { id: 'MED-01', name: 'Atorvastatin 20mg Tablets', category: 'Cardiovascular', batchNo: 'BT-8841A', stock: 840, reorderLevel: 200, unit: 'Strips', unitPrice: 145, expiryDate: 'Aug 2027' },
  { id: 'MED-02', name: 'Ceftriaxone 1g IV Injection', category: 'Antibiotics', batchNo: 'BT-7420C', stock: 68, reorderLevel: 100, unit: 'Vials', unitPrice: 210, expiryDate: 'Mar 2027' },
  { id: 'MED-03', name: 'Insulin Glargine 100IU/mL', category: 'Endocrinology', batchNo: 'BT-9012B', stock: 42, reorderLevel: 50, unit: 'Pens', unitPrice: 680, expiryDate: 'Jan 2027' },
  { id: 'MED-04', name: 'Pantoprazole 40mg Gastro-Cap', category: 'Gastroenterology', batchNo: 'BT-6619D', stock: 1220, reorderLevel: 300, unit: 'Strips', unitPrice: 95, expiryDate: 'Nov 2027' },
  { id: 'MED-05', name: 'Enoxaparin 40mg Pre-filled', category: 'Anticoagulant', batchNo: 'BT-5518K', stock: 24, reorderLevel: 40, unit: 'Syringes', unitPrice: 490, expiryDate: 'Feb 2027' },
  { id: 'MED-06', name: 'Paracetamol 500mg Infusion', category: 'Analgesic', batchNo: 'BT-4902F', stock: 310, reorderLevel: 120, unit: 'Bottles', unitPrice: 185, expiryDate: 'Sep 2027' },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  { id: 'NOT-1', title: 'High-value insurance claim settled', detail: 'TXN-9476 for Siddharth Verma (₹28,400) cleared via TPA.', time: '14 mins ago', category: 'Billing', read: false },
  { id: 'NOT-2', title: 'ICU bed alert in Emergency & Trauma', detail: 'Occupancy reached 79% (19 of 24 beds active).', time: '42 mins ago', category: 'Clinical', read: false },
  { id: 'NOT-3', title: 'Low pharmacy stock: Enoxaparin 40mg', detail: '24 syringes remaining — below reorder threshold of 40.', time: '2 hours ago', category: 'Inventory', read: false },
  { id: 'NOT-4', title: 'Afternoon OPD roster updated', detail: 'Dr. Farhan Qureshi added 2 neurology diagnostic slots.', time: '4 hours ago', category: 'Schedule', read: true },
];
