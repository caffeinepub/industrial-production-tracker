import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import ProfileSetup from './components/ProfileSetup';
import DashboardPage from './pages/DashboardPage';
import ProductionEntryPage from './pages/ProductionEntryPage';
import ProductionHistoryPage from './pages/ProductionHistoryPage';
import DispatchTrackingPage from './pages/DispatchTrackingPage';
import OperationWorkloadPage from './pages/OperationWorkloadPage';
import DailyProductionReportPage from './pages/DailyProductionReportPage';
import ProductionDashboardLivePage from './pages/ProductionDashboardLivePage';
import HistoricalOpeningBalancePage from './pages/HistoricalOpeningBalancePage';
import LoginPage from './pages/LoginPage';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function ProtectedLayout() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <Layout>
        <div className="fade-in">
          <Outlet />
        </div>
      </Layout>
      {showProfileSetup && <ProfileSetup />}
    </>
  );
}

const rootRoute = createRootRoute({
  component: ProtectedLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ProductionDashboardLivePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const productionDashboardLiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/production-dashboard-live',
  component: ProductionDashboardLivePage,
});

const productionEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/production-entry',
  component: ProductionEntryPage,
});

const productionHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/production-history',
  component: ProductionHistoryPage,
});

const dispatchTrackingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dispatch-tracking',
  component: DispatchTrackingPage,
});

const operationWorkloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/operation-workload',
  component: OperationWorkloadPage,
});

const dailyProductionReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/daily-production-report',
  component: DailyProductionReportPage,
});

const openingBalanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/opening-balance',
  component: HistoricalOpeningBalancePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  productionDashboardLiveRoute,
  productionEntryRoute,
  productionHistoryRoute,
  dispatchTrackingRoute,
  operationWorkloadRoute,
  dailyProductionReportRoute,
  openingBalanceRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="gradient-bg container-watermark min-h-screen">
        <RouterProvider router={router} />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
