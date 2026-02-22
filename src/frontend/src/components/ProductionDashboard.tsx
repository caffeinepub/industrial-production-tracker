import { useGetProductionStats, useGetContainerStatuses } from '../hooks/useQueries';
import SummaryCard from './SummaryCard';
import { Package, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ContainerStatus } from '../backend';

export default function ProductionDashboard() {
  const { data: productionStats, isLoading: statsLoading } = useGetProductionStats();
  const { data: containerStatuses, isLoading: statusesLoading } = useGetContainerStatuses();

  if (statsLoading || statusesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalProduction = productionStats?.reduce((sum, [, , qty]) => sum + Number(qty), 0) || 0;
  
  const readyForDispatch = containerStatuses?.filter(([, status]) => status === ContainerStatus.readyForDispatch).length || 0;
  const pendingOperations = containerStatuses?.filter(([, status]) => status === ContainerStatus.pendingOperations).length || 0;
  const underTesting = containerStatuses?.filter(([, status]) => status === ContainerStatus.underTesting).length || 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Production"
          value={totalProduction}
          icon={Package}
          description="Total containers produced"
        />
        <SummaryCard
          title="Ready for Dispatch"
          value={readyForDispatch}
          icon={CheckCircle}
          description="Completed containers"
        />
        <SummaryCard
          title="Pending Operations"
          value={pendingOperations}
          icon={Clock}
          description="In production"
        />
        <SummaryCard
          title="Under Testing"
          value={underTesting}
          icon={AlertCircle}
          description="Quality check"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Production by Container Type</h3>
          <div className="space-y-3">
            {productionStats && productionStats.length > 0 ? (
              (() => {
                const typeMap = new Map<string, number>();
                productionStats.forEach(([type, , qty]) => {
                  const current = typeMap.get(type) || 0;
                  typeMap.set(type, current + Number(qty));
                });
                return Array.from(typeMap.entries()).map(([type, qty]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <Badge variant="secondary">{qty} units</Badge>
                  </div>
                ));
              })()
            ) : (
              <p className="text-sm text-muted-foreground">No production data available</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold mb-4">Status Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Ready for Dispatch</span>
              <Badge className="bg-green-600 hover:bg-green-700">{readyForDispatch}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending Operations</span>
              <Badge className="bg-amber-600 hover:bg-amber-700">{pendingOperations}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Under Testing</span>
              <Badge className="bg-blue-600 hover:bg-blue-700">{underTesting}</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
