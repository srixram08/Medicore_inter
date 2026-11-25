import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCcw,
  ShieldAlert,
  XCircle,
} from 'lucide-react';

type KnownStatus =
  | 'Paid'
  | 'Pending'
  | 'Partially Paid'
  | 'Refunded'
  | 'Scheduled'
  | 'Completed'
  | 'Cancelled'
  | 'Admitted'
  | 'Outpatient'
  | 'Discharged'
  | 'Critical'
  | 'Available'
  | 'In Surgery'
  | 'On Leave'
  | 'OPD Active'
  | 'In Stock'
  | 'Low Stock';

const STATUS_MAP: Record<
  KnownStatus,
  { text: string; bg: string; border: string; icon: typeof CheckCircle2 }
> = {
  Paid: {
    text: 'text-[#047857]',
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#A7F3D0]',
    icon: CheckCircle2,
  },
  Completed: {
    text: 'text-[#047857]',
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#A7F3D0]',
    icon: CheckCircle2,
  },
  Available: {
    text: 'text-[#047857]',
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#A7F3D0]',
    icon: CheckCircle2,
  },
  'In Stock': {
    text: 'text-[#047857]',
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#A7F3D0]',
    icon: CheckCircle2,
  },
  Discharged: {
    text: 'text-[#047857]',
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#A7F3D0]',
    icon: CheckCircle2,
  },
  Scheduled: {
    text: 'text-[#0060D1]',
    bg: 'bg-[#EFF6FF]',
    border: 'border-[#BFDBFE]',
    icon: Clock,
  },
  'OPD Active': {
    text: 'text-[#0060D1]',
    bg: 'bg-[#EFF6FF]',
    border: 'border-[#BFDBFE]',
    icon: CheckCircle2,
  },
  Outpatient: {
    text: 'text-[#0284C7]',
    bg: 'bg-[#F0F9FF]',
    border: 'border-[#BAE6FD]',
    icon: Clock,
  },
  Admitted: {
    text: 'text-[#0070F3]',
    bg: 'bg-[#EBF4FF]',
    border: 'border-[#93C5FD]',
    icon: Clock,
  },
  'Partially Paid': {
    text: 'text-[#B45309]',
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    icon: AlertTriangle,
  },
  Pending: {
    text: 'text-[#B45309]',
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    icon: Clock,
  },
  'Low Stock': {
    text: 'text-[#B45309]',
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    icon: AlertTriangle,
  },
  'In Surgery': {
    text: 'text-[#B45309]',
    bg: 'bg-[#FFFBEB]',
    border: 'border-[#FDE68A]',
    icon: AlertTriangle,
  },
  'On Leave': {
    text: 'text-[#475569]',
    bg: 'bg-[#F1F5F9]',
    border: 'border-[#CBD5E1]',
    icon: Clock,
  },
  Refunded: {
    text: 'text-[#0284C7]',
    bg: 'bg-[#F0F9FF]',
    border: 'border-[#BAE6FD]',
    icon: RefreshCcw,
  },
  Cancelled: {
    text: 'text-[#BE123C]',
    bg: 'bg-[#FFF1F2]',
    border: 'border-[#FECDD3]',
    icon: XCircle,
  },
  Critical: {
    text: 'text-[#BE123C]',
    bg: 'bg-[#FFF1F2]',
    border: 'border-[#FECDD3]',
    icon: ShieldAlert,
  },
};

export function StatusBadge({ status }: { status: KnownStatus | string }) {
  const cfg = STATUS_MAP[status as KnownStatus] ?? {
    text: 'text-[#475569]',
    bg: 'bg-[#F1F5F9]',
    border: 'border-[#CBD5E1]',
    icon: Clock,
  };
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}
