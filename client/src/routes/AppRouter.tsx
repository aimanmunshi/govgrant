import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { VerifyEmailBanner } from '@/components/VerifyEmailBanner';

const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const ProposalList = lazy(() => import('../pages/Proposals/ProposalList'));
const SubmitProposal = lazy(() => import('../pages/Proposals/SubmitProposal'));
const ProposalDetail = lazy(() => import('../pages/Proposals/ProposalDetail'));
const SubmitReview = lazy(() => import('@/pages/Reviews/SubmitReview'));
const MilestoneTracker = lazy(() => import('@/pages/Milestones/MilestoneTracker'));
const MilestoneDashboard = lazy(() => import('@/pages/Milestones/MilestoneDashboard'));
const ReviewsDashboard = lazy(() => import('@/pages/Reviews/ReviewsDashboard'));
const UsersPage = lazy(() => import('@/pages/Users/UsersPage'));
const ActivityPage = lazy(() => import('@/pages/Activity/ActivityPage'));
const HelpPage = lazy(() => import('@/pages/Help'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const NotificationsPage = lazy(() => import('@/pages/Notifications/NotificationsPage'));
const AccountPage = lazy(() => import('@/pages/Account'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPassword'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmail'));

const PageFallback = () => (
  <div className="flex flex-1 items-center justify-center p-12">
    <div className="text-muted-foreground text-sm">Loading...</div>
  </div>
);

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Animates route content in/out on navigation, without touching the surrounding layout
const AnimatedOutlet = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } }}
        exit={{ opacity: 0, transition: { duration: 0.12, ease: 'easeIn' } }}
        className="flex flex-1 flex-col"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
};

// Persistent layout for all protected routes — mounted once, not per-route,
// so the sidebar/header survive navigation and only the page content animates
const ProtectedLayout = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
      <div className="text-slate-400">Loading...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <VerifyEmailBanner />
        <div className="relative flex flex-1 flex-col overflow-auto">
          <Suspense fallback={<PageFallback />}>
            <AnimatedOutlet />
          </Suspense>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/proposals" element={<ProposalList />} />
            <Route path="/proposals/new" element={<SubmitProposal />} />
            <Route path="/proposals/:id" element={<ProposalDetail />} />
            <Route path="/proposals/:id/milestones" element={<MilestoneTracker />} />
            <Route path="/proposals/:id/review" element={<SubmitReview />} />
            <Route path="/proposals/:id/edit" element={<SubmitProposal />} />
            <Route path="/milestones" element={<MilestoneDashboard />} />
            <Route path="/reviews" element={<ReviewsDashboard />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/users" element={<AdminGuard><UsersPage /></AdminGuard>} />
            <Route path="/activity" element={<AdminGuard><ActivityPage /></AdminGuard>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
