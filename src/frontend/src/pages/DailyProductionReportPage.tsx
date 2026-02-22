import DailyProductionReportForm from '../components/DailyProductionReportForm';
import DailyProductionReportTable from '../components/DailyProductionReportTable';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function DailyProductionReportPage() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <h1 className="text-3xl font-bold">Daily Production Reports</h1>
      
      {isAdmin ? (
        <DailyProductionReportForm />
      ) : (
        <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            Only administrators can create or update production reports. You can view reports below.
          </p>
        </div>
      )}
      
      <DailyProductionReportTable />
    </div>
  );
}
