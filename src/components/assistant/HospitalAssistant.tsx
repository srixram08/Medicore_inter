import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  AlertTriangle,
  BedDouble,
  Bot,
  Cloud,
  Cpu,
  CreditCard,
  Loader2,
  Pill,
  RefreshCw,
  Send,
  ShieldAlert,
  Trash2,
  X,
} from 'lucide-react';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { formatINR } from '../../lib/formatters';
import { answerWithLocalMonitor } from '../../lib/localHospitalMonitor';

type EngineMode = 'local' | 'gemini';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sourceLabel?: 'On-Device Monitor' | 'Gemini Cloud AI';
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text:
    'MediCore 3D Monitor ready. On-Device Monitor is active using live hospital data (beds, patients, doctors, appointments, INR invoices, pharmacy stock, and alerts). Strictly scoped to MediCore 3D operations & workflows.',
  timestamp: 'Live',
  sourceLabel: 'On-Device Monitor',
};

const QUICK_PROMPTS = [
  'Give me a live hospital status briefing',
  'Which medicines are low on stock?',
  'Check pending invoices & collections',
  'Which departments are near full capacity?',
];

export function HospitalAssistant({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const {
    patients,
    doctors,
    appointments,
    transactions,
    invoices,
    departments,
    pharmacy,
    notifications,
    settings,
  } = useHospitalStore();
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  const [engineMode, setEngineMode] = useState<EngineMode>('local');
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [lastFailedPrompt, setLastFailedPrompt] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const monitorSummary = useMemo(() => {
    const totalBeds = departments.reduce((acc, d) => acc + d.totalBeds, 0);
    const occupiedBeds = departments.reduce((acc, d) => acc + d.occupiedBeds, 0);
    const freeBeds = Math.max(0, totalBeds - occupiedBeds);
    const highOccupancyDepts = departments.filter(
      (d) => d.totalBeds > 0 && d.occupiedBeds / d.totalBeds >= 0.85
    );

    const lowStockMeds = pharmacy.filter((m) => m.stock <= m.reorderLevel);

    const pendingInvoicesList = invoices.filter((inv) => inv.status !== 'Paid');
    const pendingBalanceINR = pendingInvoicesList.reduce((acc, inv) => {
      const subtotal = inv.lineItems.reduce((s, item) => s + item.qty * item.unitPrice, 0);
      const grandTotal = Math.round(
        subtotal * (1 - inv.discountPct / 100) * (1 + inv.taxPct / 100)
      );
      return acc + Math.max(0, grandTotal - inv.paidAmount);
    }, 0);

    const unreadNotifications = notifications.filter((n) => !n.read);

    return {
      totalBeds,
      occupiedBeds,
      freeBeds,
      highOccupancyDepts,
      lowStockMeds,
      pendingInvoicesList,
      pendingBalanceINR,
      unreadNotifications,
      alertCount:
        lowStockMeds.length + highOccupancyDepts.length + unreadNotifications.length,
    };
  }, [departments, pharmacy, invoices, notifications]);

  const hospitalContextPayload = useMemo(() => {
    return {
      hospitalName: settings.hospitalName,
      date: '23 Nov 2026',
      kpis: {
        totalPatientsShownOnOverview: 1248 + (patients.length - 10),
        trackedRegistryPatients: patients.length,
        todaysAppointmentsShownOnOverview: 36 + (appointments.length - 9),
        trackedAppointments: appointments.length,
        totalDoctorsShownOnOverview: 42 + (doctors.length - 8),
        trackedDoctors: doctors.length,
        availableBeds: monitorSummary.freeBeds,
        totalBeds: monitorSummary.totalBeds,
        occupancyPct: monitorSummary.totalBeds
          ? Number(((monitorSummary.occupiedBeds / monitorSummary.totalBeds) * 100).toFixed(1))
          : 0,
        overviewRevenueINR: 245000,
        pendingInvoiceBalanceINR: monitorSummary.pendingBalanceINR,
      },
      alerts: {
        highOccupancyDepartments: monitorSummary.highOccupancyDepts.map((d) => ({
          name: d.name,
          occupied: d.occupiedBeds,
          total: d.totalBeds,
        })),
        lowStockMedicines: monitorSummary.lowStockMeds.map((m) => ({
          name: m.name,
          stock: m.stock,
          reorderLevel: m.reorderLevel,
          unit: m.unit,
          expiryDate: m.expiryDate,
        })),
        unreadNotifications: monitorSummary.unreadNotifications.map((n) => ({
          title: n.title,
          detail: n.detail,
          category: n.category,
          time: n.time,
        })),
      },
      departments: departments.map((d) => ({
        name: d.name,
        headDoctor: d.headDoctor,
        occupiedBeds: d.occupiedBeds,
        totalBeds: d.totalBeds,
        activeDoctors: d.activeDoctors,
        monthlyRevenueINR: d.monthlyRevenue,
      })),
      doctors: doctors.map((d) => ({
        name: d.name,
        department: d.department,
        specialization: d.specialization,
        availability: d.availability,
        feeINR: d.fee,
        patientsToday: d.patientsToday,
      })),
      appointments: appointments.slice(0, 15).map((a) => ({
        id: a.id,
        patientName: a.patientName,
        doctorName: a.doctorName,
        department: a.department,
        date: a.date,
        time: a.time,
        status: a.status,
      })),
      patients: patients.slice(0, 15).map((p) => ({
        id: p.id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        department: p.department,
        status: p.status,
        regDate: p.regDate,
      })),
      invoices: invoices.map((inv) => {
        const subtotal = inv.lineItems.reduce((s, item) => s + item.qty * item.unitPrice, 0);
        const total = Math.round(
          subtotal * (1 - inv.discountPct / 100) * (1 + inv.taxPct / 100)
        );
        return {
          invoiceNo: inv.invoiceNo,
          patientName: inv.patientName,
          department: inv.department,
          totalINR: total,
          paidINR: inv.paidAmount,
          balanceINR: Math.max(0, total - inv.paidAmount),
          status: inv.status,
          method: inv.method,
        };
      }),
      recentTransactions: transactions.slice(0, 10).map((t) => ({
        id: t.id,
        patientName: t.patientName,
        invoiceNo: t.invoiceNo,
        date: t.date,
        method: t.method,
        amountINR: t.amount,
        status: t.status,
      })),
      pharmacy: pharmacy.map((m) => ({
        name: m.name,
        category: m.category,
        stock: m.stock,
        reorderLevel: m.reorderLevel,
        unit: m.unit,
        unitPriceINR: m.unitPrice,
        expiryDate: m.expiryDate,
      })),
      settingsSummary: {
        defaultTaxPct: settings.defaultTaxPct,
        lowStockAlertsEnabled: settings.lowStockAlerts,
        paymentReceiptsAutoEmail: settings.paymentReceiptsAutoEmail,
      },
    };
  }, [
    settings,
    patients,
    appointments,
    doctors,
    departments,
    invoices,
    transactions,
    pharmacy,
    monitorSummary,
  ]);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, isLoading]);

  const sendMessage = async (
    promptText: string,
    overrideMode?: EngineMode,
    skipUserBubble?: boolean
  ) => {
    const trimmed = promptText.trim();
    if (!trimmed || isLoading) return;

    const activeMode = overrideMode ?? engineMode;
    const nowTime = new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setErrorMsg('');
    setLastFailedPrompt('');

    if (!skipUserBubble) {
      const userMsg: ChatMessage = {
        id: `usr-${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: nowTime,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
    }

    if (activeMode === 'local') {
      const localResult = answerWithLocalMonitor({
        query: trimmed,
        currentRoute: location.pathname,
        store: {
          patients,
          doctors,
          appointments,
          transactions,
          invoices,
          departments,
          pharmacy,
          notifications,
          settings,
        },
      });
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now() + 1}`,
        role: 'assistant',
        text: localResult.reply,
        timestamp: nowTime,
        sourceLabel: 'On-Device Monitor',
      };
      setMessages((prev) => [...prev, assistantMsg]);
      return;
    }

    const historyToSend = messages
      .filter((m) => m.id !== 'welcome')
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));

    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyToSend,
          currentRoute: location.pathname,
          hospitalContext: hospitalContextPayload,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok || !data.reply) {
        setErrorMsg(data.error || 'Unable to get a response from Gemini Cloud AI.');
        setLastFailedPrompt(trimmed);
        setIsLoading(false);
        return;
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sourceLabel: 'Gemini Cloud AI',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setErrorMsg('Network error reaching the Gemini Cloud AI proxy.');
      setLastFailedPrompt(trimmed);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEngineSwitch = (nextMode: EngineMode) => {
    setEngineMode(nextMode);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <>
      {/* Floating Monitor Launcher (hidden while drawer is open or printing) */}
      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          aria-label="Open MediCore Monitor AI Assistant"
          className="no-print fixed right-5 bottom-5 z-40 flex items-center gap-2.5 rounded-xl border border-[#0070F3] bg-[#0070F3] px-4 py-3 text-xs font-bold text-white shadow-xl shadow-[#0070F3]/30 transition-transform hover:-translate-y-0.5 hover:bg-[#005DD1]"
        >
          <Bot className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          <span>MediCore AI Monitor</span>
          {monitorSummary.alertCount > 0 && (
            <span className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] font-extrabold text-[#0070F3] tabular-nums">
              {monitorSummary.alertCount}
            </span>
          )}
        </button>
      )}

      {/* Assistant Drawer / Panel */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            aria-label="MediCore AI Monitor Assistant"
            className="no-print fixed right-4 bottom-4 z-50 flex h-[min(640px,calc(100vh-2rem))] w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-[#93C5FD] bg-white shadow-2xl shadow-[#0070F3]/20 sm:right-6 sm:bottom-6 sm:w-[430px]"
          >
            {/* Header */}
            <div className="border-b border-[#DCE8F7] bg-[#EFF6FF] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0070F3] text-white shadow-sm shadow-[#0070F3]/25">
                    <Bot className="h-4.5 w-4.5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-sm font-extrabold text-[#05080F]">
                      MediCore Monitor AI
                    </h2>
                    <p className="truncate text-[11px] font-semibold text-[#1E293B]">
                      {engineMode === 'local'
                        ? 'On-Device Telemetry · Live App Data'
                        : 'Gemini Cloud AI · App-Only Proxy'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMessages([WELCOME_MESSAGE]);
                      setErrorMsg('');
                      setLastFailedPrompt('');
                    }}
                    title="Clear conversation"
                    aria-label="Clear assistant conversation"
                    className="rounded-lg p-1.5 text-[#334155] transition-colors hover:bg-white hover:text-[#0070F3]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    aria-label="Close assistant"
                    className="rounded-lg p-1.5 text-[#334155] transition-colors hover:bg-white hover:text-[#05080F]"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Explicit Engine Selector (On-Device Monitor vs Gemini Cloud AI) */}
              <div
                role="tablist"
                aria-label="Assistant Engine Mode"
                className="mt-2.5 grid grid-cols-2 gap-1.5 rounded-xl border border-[#CFE0F5] bg-white p-1"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={engineMode === 'local'}
                  onClick={() => handleEngineSwitch('local')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                    engineMode === 'local'
                      ? 'bg-[#0070F3] text-white shadow-sm'
                      : 'text-[#05080F] hover:bg-[#F4F8FF]'
                  }`}
                >
                  <Cpu className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>On-Device Monitor</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={engineMode === 'gemini'}
                  onClick={() => handleEngineSwitch('gemini')}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition-colors ${
                    engineMode === 'gemini'
                      ? 'bg-[#0070F3] text-white shadow-sm'
                      : 'text-[#05080F] hover:bg-[#F4F8FF]'
                  }`}
                >
                  <Cloud className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span>Gemini Cloud AI</span>
                </button>
              </div>
            </div>

            {/* Live Monitoring Tiles */}
            <div className="grid grid-cols-4 gap-1.5 border-b border-[#DCE8F7] bg-[#F8FBFF] p-2.5">
              <button
                type="button"
                onClick={() =>
                  void sendMessage('Monitor department bed occupancy and flag high-load wards.')
                }
                className="flex flex-col items-start rounded-xl border border-[#DCE8F7] bg-white p-2 text-left transition-colors hover:border-[#0070F3]"
              >
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#334155]">
                  <BedDouble className="h-3 w-3 text-[#0070F3]" />
                  Beds
                </span>
                <span className="mt-1 font-mono text-xs font-extrabold text-[#05080F] tabular-nums">
                  {monitorSummary.freeBeds} free
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  void sendMessage('List all pending or partially paid invoices and balances.')
                }
                className="flex flex-col items-start rounded-xl border border-[#DCE8F7] bg-white p-2 text-left transition-colors hover:border-[#0070F3]"
              >
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#334155]">
                  <CreditCard className="h-3 w-3 text-[#D97706]" />
                  Due
                </span>
                <span className="mt-1 truncate font-mono text-xs font-extrabold text-[#05080F] tabular-nums">
                  {formatINR(monitorSummary.pendingBalanceINR)}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  void sendMessage('Check pharmacy items at or below reorder threshold.')
                }
                className="flex flex-col items-start rounded-xl border border-[#DCE8F7] bg-white p-2 text-left transition-colors hover:border-[#0070F3]"
              >
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#334155]">
                  <Pill className="h-3 w-3 text-[#E11D48]" />
                  Stock
                </span>
                <span className="mt-1 font-mono text-xs font-extrabold text-[#05080F] tabular-nums">
                  {monitorSummary.lowStockMeds.length} low
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  void sendMessage('Review all unread clinical and operational alerts.')
                }
                className="flex flex-col items-start rounded-xl border border-[#DCE8F7] bg-white p-2 text-left transition-colors hover:border-[#0070F3]"
              >
                <span className="flex items-center gap-1 text-[10px] font-bold text-[#334155]">
                  <Activity className="h-3 w-3 text-[#0D9F6E]" />
                  Alerts
                </span>
                <span className="mt-1 font-mono text-xs font-extrabold text-[#05080F] tabular-nums">
                  {monitorSummary.unreadNotifications.length} new
                </span>
              </button>
            </div>

            {/* Conversation Feed */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 bg-[#F4F8FF]/60">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                        isUser
                          ? 'bg-[#0070F3] font-medium text-white'
                          : 'border border-[#DCE8F7] bg-white font-medium text-[#05080F]'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                    </div>
                    <span className="mt-1 px-1 text-[10px] font-medium text-[#334155]">
                      {isUser ? 'You' : msg.sourceLabel || 'MediCore Monitor'} · {msg.timestamp}
                    </span>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-[#DCE8F7] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#05080F] shadow-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0070F3]" />
                    <span>Querying Gemini Cloud AI...</span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="rounded-xl border border-[#FECDD3] bg-[#FFF1F2] p-3 text-xs text-[#9F1239]"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#E11D48]" />
                    <div className="flex-1">
                      <p className="font-bold">Gemini Cloud AI Unavailable</p>
                      <p className="mt-0.5 font-medium leading-relaxed">{errorMsg}</p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        {lastFailedPrompt && (
                          <button
                            type="button"
                            onClick={() => {
                              setEngineMode('local');
                              void sendMessage(lastFailedPrompt, 'local', true);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-[#0070F3] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#005DD1]"
                          >
                            <Cpu className="h-3 w-3" />
                            Answer with On-Device Monitor
                          </button>
                        )}
                        {lastFailedPrompt && (
                          <button
                            type="button"
                            onClick={() => void sendMessage(lastFailedPrompt, 'gemini', true)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#FDA4AF] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#9F1239] hover:bg-[#FFE4E6]"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Retry Gemini
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="border-t border-[#DCE8F7] bg-white px-3 pt-2.5 pb-1.5">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={isLoading}
                    onClick={() => void sendMessage(q)}
                    className="shrink-0 rounded-lg border border-[#CFE0F5] bg-[#F4F8FF] px-2.5 py-1 text-[11px] font-semibold text-[#05080F] transition-colors hover:border-[#0070F3] hover:bg-[#EFF6FF] hover:text-[#0070F3] disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-[#DCE8F7] bg-white p-3"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about MediCore beds, patients, billing, stock..."
                  aria-label="Ask MediCore Monitor AI"
                  maxLength={2000}
                  className="flex-1 rounded-xl border border-[#94A3B8]/80 bg-[#F4F8FF] px-3.5 py-2.5 text-xs font-medium text-[#05080F] placeholder-[#475569] focus:border-[#0070F3] focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0070F3] text-white shadow-sm shadow-[#0070F3]/25 transition-colors hover:bg-[#005DD1] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-[#334155]">
                <ShieldAlert className="h-3 w-3 shrink-0 text-[#0070F3]" />
                <span>Restricted strictly to MediCore 3D monitoring &amp; app workflows.</span>
              </p>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
