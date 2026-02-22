import OperationWorkloadView from '../components/OperationWorkloadView';

export default function OperationWorkloadPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Operation Workload</h1>
        <p className="text-muted-foreground mt-1">
          Current work in hand status across manufacturing operations
        </p>
      </div>
      <OperationWorkloadView />
    </div>
  );
}
