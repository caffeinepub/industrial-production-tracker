import DispatchEntryForm from '../components/DispatchEntryForm';
import DispatchHistoryTable from '../components/DispatchHistoryTable';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function DispatchTrackingPage() {
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
      <h1 className="text-3xl font-bold">Dispatch Tracking</h1>
      
      {isAdmin ? (
        <DispatchEntryForm />
      ) : (
        <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
          <p className="text-muted-foreground">
            Only administrators can create dispatch entries. You can view dispatch history below.
          </p>
        </div>
      )}
      
      <DispatchHistoryTable isAdmin={isAdmin || false} />
    </div>
  );
}
