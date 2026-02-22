import { useGetHistoricalOpeningBalance, useIsCallerAdmin } from '../hooks/useQueries';
import HistoricalOpeningBalanceForm from '../components/HistoricalOpeningBalanceForm';
import HistoricalOpeningBalanceDisplay from '../components/HistoricalOpeningBalanceDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import AccessDeniedScreen from '../components/AccessDeniedScreen';

export default function HistoricalOpeningBalancePage() {
  const { data: openingBalance, isLoading, error } = useGetHistoricalOpeningBalance();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();

  if (isLoading || isAdminLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-96 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card metallic-border p-8 rounded-lg">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">Error Loading Opening Balance</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'Failed to load opening balance data'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If opening balance exists, show display component
  if (openingBalance) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Historical Opening Balance
          </h1>
          <p className="text-muted-foreground mt-2">
            View the production baseline established before system go-live
          </p>
        </div>
        <HistoricalOpeningBalanceDisplay openingBalance={openingBalance} />
      </div>
    );
  }

  // If no opening balance and user is not admin, show access denied
  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  // If no opening balance and user is admin, show form
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
          Historical Opening Balance
        </h1>
        <p className="text-muted-foreground mt-2">
          Initialize the system with production data from before go-live
        </p>
      </div>
      <HistoricalOpeningBalanceForm />
    </div>
  );
}
