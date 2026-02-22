import { useIsCallerAdmin } from '../hooks/useQueries';
import DailyProductionReportForm from '../components/DailyProductionReportForm';
import DailyProductionReportTable from '../components/DailyProductionReportTable';
import AccessDeniedScreen from '../components/AccessDeniedScreen';
import { Skeleton } from '@/components/ui/skeleton';

export default function DailyProductionReportPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Daily Production Report
        </h1>
        <p className="text-muted-foreground mt-2">
          Record and manage daily production metrics for all operations
        </p>
      </div>

      <DailyProductionReportForm />
      <DailyProductionReportTable />
    </div>
  );
}
