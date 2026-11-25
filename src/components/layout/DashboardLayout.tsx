import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Activity,
  BarChart3,
  Bell,
  Bot,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Search,
  Settings,
  Stethoscope,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { DashboardHospitalBackdrop } from './DashboardHospitalBackdrop';
import { PWAInstallButton } from '../pwa/PWAInstallButton';
import { HospitalAssistant } from '../assistant/HospitalAssistant';
import { useAuth } from '../../hooks/useAuth';
import { useHospitalStore } from '../../hooks/useHospitalStore';
import { useToast } from '../../hooks/useToast';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
  { label: 'Patients', to: '/dashboard/patients', icon: Users },
  { label: 'Doctors & Staff', to: '/dashboard/doctors', icon: Stethoscope },
  { label: 'Appointments', to: '/dashboard/appointments', icon: CalendarDays },
  { label: 'Departments', to: '/dashboard/departments', icon: Building2 },
  { label: 'Payments & Billing', to: '/dashboard/billing', icon: CreditCard },
  { label: 'Financial Analytics', to: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Pharmacy & Inventory', to: '/dashboard/pharmacy', icon: Pill },
  { label: 'Reports', to: '/dashboard/reports', icon: FileBarChart2 },
  { label: 'Settings', to: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout() {
  const { session, logout } = useAuth();
  const { patients, doctors, notifications, markAllNotificationsRead, markNotificationRead, settings } =
    useHospitalStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(target)) setSearchFocused(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { patients: [], doctors: [] };
    return {
      patients: patients
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.id.toLowerCase().includes(q) ||
            p.department.toLowerCase().includes(q)
        )
        .slice(0, 5),
      doctors: doctors
        .filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.department.toLowerCase().includes(q) ||
            d.specialization.toLowerCase().includes(q)
        )
        .slice(0, 3),
    };
  }, [searchQuery, patients, doctors]);

  const handleLogout = () => {
    logout();
    showToast({
      type: 'info',
      title: 'Signed out',
      message: 'Your administrator session has ended.',
    });
    navigate('/login', { replace: true });
  };

  const renderNavLinks = (isCollapsed: boolean) => (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Hospital navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#EBF4FF] text-[#0070F3] border border-[#BFDBFE] font-semibold'
                  : 'text-[#334155] border border-transparent hover:bg-[#F4F8FF] hover:text-[#05080F]'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            {!isCollapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="relative flex min-h-screen w-full bg-[#EAF2FF] text-[#05080F]">
      {/* Lively Hospital Robotics & ECG Telemetry Backdrop Across All Dashboard Pages */}
      <DashboardHospitalBackdrop />

      {/* Desktop Collapsible Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 76 : 256 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-20 hidden shrink-0 flex-col border-r border-[#DCE8F7] bg-white/88 backdrop-blur-md lg:flex sticky top-0 h-screen no-print"
      >
        <div className="flex h-16 items-center justify-between border-b border-[#E6EFFA] px-4">
          <Logo collapsed={sidebarCollapsed} />
          <button
            type="button"
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="rounded-lg p-1.5 text-[#334155] transition-colors hover:bg-[#EFF6FF] hover:text-[#0070F3]"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {renderNavLinks(sidebarCollapsed)}

        <div className="border-t border-[#E6EFFA] p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#334155] transition-colors hover:bg-[#FFF1F2] hover:text-[#E11D48] whitespace-nowrap"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0" />
            {!sidebarCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#05080F]/40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex h-full w-64 flex-col border-r border-[#DCE8F7] bg-white"
            >
              <div className="flex h-16 items-center justify-between border-b border-[#E6EFFA] px-4">
                <Logo />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-lg p-1.5 text-[#334155] hover:bg-[#EFF6FF] hover:text-[#0070F3]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {renderNavLinks(false)}
              <div className="border-t border-[#E6EFFA] p-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#E11D48] hover:bg-[#FFF1F2]"
                >
                  <LogOut className="h-4.5 w-4.5 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[#DCE8F7] bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:px-8 no-print">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg border border-[#DCE8F7] bg-[#F4F8FF] p-2 text-[#05080F] lg:hidden"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
            <div className="hidden sm:flex items-center gap-2.5 min-w-0">
              <Activity className="h-4 w-4 shrink-0 text-[#0070F3]" aria-hidden="true" />
              <span className="truncate font-display text-sm font-semibold text-[#05080F]">
                {settings.hospitalName}
              </span>
            </div>
          </div>

          {/* Live Patient & Doctor Search */}
          <div ref={searchRef} className="relative flex-1 max-w-md">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#334155]"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onFocus={() => setSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchFocused(true);
              }}
              placeholder="Search patients, IDs, or departments..."
              aria-label="Search hospital records"
              className="w-full rounded-xl border border-[#CFE0F5] bg-[#F4F8FF] py-2 pr-3 pl-9 text-xs sm:text-sm text-[#05080F] placeholder-[#334155]/75 transition-colors focus:border-[#0070F3] focus:bg-white focus:outline-none"
            />

            <AnimatePresence>
              {searchFocused && searchQuery.trim().length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.14 }}
                  className="absolute top-full right-0 left-0 mt-2 overflow-hidden rounded-xl border border-[#DCE8F7] bg-white shadow-xl shadow-[#0070F3]/12"
                >
                  {searchResults.patients.length === 0 && searchResults.doctors.length === 0 ? (
                    <div className="p-4 text-center text-xs text-[#334155]">
                      No patients or clinicians matching &ldquo;{searchQuery}&rdquo;
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto divide-y divide-[#E6EFFA]">
                      {searchResults.patients.length > 0 && (
                        <div className="p-2">
                          <p className="px-2.5 py-1 text-[11px] font-semibold text-[#334155]">
                            Patients
                          </p>
                          {searchResults.patients.map((pt) => (
                            <button
                              key={pt.id}
                              type="button"
                              onClick={() => {
                                setSearchFocused(false);
                                setSearchQuery('');
                                navigate(`/dashboard/patients?selected=${pt.id}`);
                              }}
                              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-[#EFF6FF]"
                            >
                              <div>
                                <p className="font-medium text-[#05080F]">{pt.name}</p>
                                <p className="text-[11px] text-[#334155]">
                                  <span className="font-mono">{pt.id}</span> · {pt.department}
                                </p>
                              </div>
                              <span className="text-[11px] font-semibold text-[#0070F3]">
                                {pt.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {searchResults.doctors.length > 0 && (
                        <div className="p-2">
                          <p className="px-2.5 py-1 text-[11px] font-semibold text-[#334155]">
                            Doctors &amp; Specialists
                          </p>
                          {searchResults.doctors.map((doc) => (
                            <button
                              key={doc.id}
                              type="button"
                              onClick={() => {
                                setSearchFocused(false);
                                setSearchQuery('');
                                navigate('/dashboard/doctors');
                              }}
                              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-[#EFF6FF]"
                            >
                              <div>
                                <p className="font-medium text-[#05080F]">{doc.name}</p>
                                <p className="text-[11px] text-[#334155]">
                                  {doc.specialization} · {doc.department}
                                </p>
                              </div>
                              <span className="text-[11px] font-semibold text-[#0D9F6E]">
                                {doc.availability}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setAssistantOpen((o) => !o)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors whitespace-nowrap ${
                assistantOpen
                  ? 'border-[#0070F3] bg-[#0070F3] text-white'
                  : 'border-[#BFDBFE] bg-[#EFF6FF] text-[#0070F3] hover:bg-[#DBEAFE]'
              }`}
            >
              <Bot className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Monitor AI</span>
            </button>

            <PWAInstallButton compact />

            <span className="hidden md:inline-block font-mono text-xs text-[#334155] whitespace-nowrap">
              23 Nov 2026
            </span>

            {/* Notifications Dropdown */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen((o) => !o);
                  setProfileOpen(false);
                }}
                aria-label="Open notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] text-[#334155] transition-colors hover:border-[#0070F3] hover:text-[#0070F3]"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-md bg-[#0070F3] px-1 font-mono text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-[#DCE8F7] bg-white shadow-xl shadow-[#0070F3]/12"
                  >
                    <div className="flex items-center justify-between border-b border-[#E6EFFA] px-4 py-3">
                      <span className="font-display text-xs font-semibold text-[#05080F]">
                        Hospital Alerts ({unreadCount} unread)
                      </span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsRead}
                          className="text-[11px] font-semibold text-[#0070F3] hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 divide-y divide-[#E6EFFA] overflow-y-auto">
                      {notifications.map((n) => (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => markNotificationRead(n.id)}
                          className={`block w-full px-4 py-3 text-left transition-colors hover:bg-[#F4F8FF] ${
                            n.read ? 'opacity-65' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-semibold text-[#0070F3]">
                              {n.category}
                            </span>
                            <span className="text-[11px] text-[#334155]">{n.time}</span>
                          </div>
                          <p className="mt-1 text-xs font-semibold text-[#05080F]">{n.title}</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-[#334155]">
                            {n.detail}
                          </p>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Admin Profile Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((o) => !o);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-[#DCE8F7] bg-[#F4F8FF] py-1.5 pr-2.5 pl-1.5 text-left transition-colors hover:border-[#0070F3]"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0070F3] font-display text-xs font-bold text-white">
                  {session?.user.initials || 'AN'}
                </div>
                <div className="hidden sm:block leading-tight">
                  <p className="text-xs font-semibold text-[#05080F] whitespace-nowrap">
                    {session?.user.name || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-[#334155] whitespace-nowrap">Admin Console</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[#334155]" />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-[#DCE8F7] bg-white shadow-xl shadow-[#0070F3]/12"
                  >
                    <div className="border-b border-[#E6EFFA] px-4 py-3">
                      <p className="text-xs font-semibold text-[#05080F]">
                        {session?.user.name}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-[11px] text-[#334155]">
                        {session?.user.email}
                      </p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          navigate('/dashboard/settings');
                        }}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-[#05080F] transition-colors hover:bg-[#EFF6FF]"
                      >
                        <UserCheck className="h-3.5 w-3.5 text-[#0070F3]" />
                        <span>Hospital Settings</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[#E11D48] transition-colors hover:bg-[#FFF1F2]"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Scrollable Viewport */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1440px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* MediCore 3D Live Hospital Monitor & App-Only Assistant */}
      <HospitalAssistant open={assistantOpen} onOpenChange={setAssistantOpen} />
    </div>
  );
}
