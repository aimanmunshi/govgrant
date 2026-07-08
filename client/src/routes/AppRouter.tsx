import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import ProposalList from '../pages/Proposals/ProposalList';
import SubmitProposal from '../pages/Proposals/SubmitProposal';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { VerifyEmailBanner } from '@/components/VerifyEmailBanner';
import ProposalDetail from '../pages/Proposals/ProposalDetail'
import SubmitReview from '@/pages/Reviews/SubmitReview';
import MilestoneTracker from '@/pages/Milestones/MilestoneTracker';
import MilestoneDashboard from "@/pages/Milestones/MilestoneDashboard";
import ReviewsDashboard from "@/pages/Reviews/ReviewsDashboard";
import UsersPage from "@/pages/Users/UsersPage";
import ActivityPage from "@/pages/Activity/ActivityPage";
import HelpPage from "@/pages/Help";
import SettingsPage from "@/pages/Settings";
import NotificationsPage from "@/pages/Notifications/NotificationsPage";
import AccountPage from "@/pages/Account";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import ResetPasswordPage from "@/pages/ResetPassword";
import VerifyEmailPage from "@/pages/VerifyEmail";

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
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
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
          <AnimatedOutlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

const AppRouter = () => {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

export default AppRouter;
