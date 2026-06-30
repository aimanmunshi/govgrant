import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import ProposalDetail from '../pages/Proposals/ProposalDetail'
import SubmitReview from '@/pages/Reviews/SubmitReview';
import MilestoneTracker from '@/pages/Milestones/MilestoneTracker';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
      <div className="text-slate-400">Loading...</div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// Layout wrapper with sidebar
const AppLayout = ({ children }: { children: React.ReactNode }) => {
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
        <div className="flex flex-1 flex-col overflow-auto">
          {children}
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
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AppLayout><Dashboard /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/proposals" element={
          <ProtectedRoute>
            <AppLayout><ProposalList /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/proposals/new" element={
          <ProtectedRoute>
            <AppLayout><SubmitProposal /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/proposals/:id" element={
          <ProtectedRoute>
            <AppLayout><ProposalDetail /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/proposals/:id/milestones" element={
          <ProtectedRoute>
            <AppLayout><MilestoneTracker /></AppLayout>
          </ProtectedRoute>
        } />
        <Route path="/proposals/:id/review" element={
          <ProtectedRoute>
            <AppLayout><SubmitReview /></AppLayout>
          </ProtectedRoute>
        } />
        <Route
          path="/proposals/:id/edit"
          element={<SubmitProposal />}
        />
      </Routes>


    </BrowserRouter>

  );
};

export default AppRouter;