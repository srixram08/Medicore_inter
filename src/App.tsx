import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, MotionConfig } from 'motion/react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';
import { HospitalStoreProvider } from './hooks/useHospitalStore';
import { DashboardSkeleton } from './components/ui/Skeleton';
import { OfflineIndicator } from './components/pwa/OfflineIndicator';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const OverviewPage = lazy(() => import('./pages/dashboard/OverviewPage'));
const PatientsPage = lazy(() => import('./pages/dashboard/PatientsPage'));
const DoctorsPage = lazy(() => import('./pages/dashboard/DoctorsPage'));
const AppointmentsPage = lazy(() => import('./pages/dashboard/AppointmentsPage'));
const DepartmentsPage = lazy(() => import('./pages/dashboard/DepartmentsPage'));
const PaymentsBillingPage = lazy(() => import('./pages/dashboard/PaymentsBillingPage'));
const FinancialAnalyticsPage = lazy(() => import('./pages/dashboard/FinancialAnalyticsPage'));
const PharmacyPage = lazy(() => import('./pages/dashboard/PharmacyPage'));
const ReportsPage = lazy(() => import('./pages/dashboard/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function FullscreenLoader() {
  return (
    <div className="min-h-screen w-full bg-[#F4F8FF] p-6 sm:p-10">
      <div className="mx-auto max-w-[1440px]">
        <DashboardSkeleton />
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<FullscreenLoader />}>
        <Routes location={location} key={location.pathname.split('/')[1] || 'root'}>
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<OverviewPage />} />
            <Route path="patients" element={<PatientsPage />} />
            <Route path="doctors" element={<DoctorsPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="billing" element={<PaymentsBillingPage />} />
            <Route path="analytics" element={<FinancialAnalyticsPage />} />
            <Route path="pharmacy" element={<PharmacyPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
          />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <AuthProvider>
          <HospitalStoreProvider>
            <BrowserRouter>
              <AppRoutes />
              <OfflineIndicator />
            </BrowserRouter>
          </HospitalStoreProvider>
        </AuthProvider>
      </ToastProvider>
    </MotionConfig>
  );
}
