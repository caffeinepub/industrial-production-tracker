import { useGetOperationWorkload } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Wrench, Zap, Package, Paintbrush } from 'lucide-react';

const operationIcons: Record<string, any> = {
  cutting: Wrench,
  welding: Zap,
  assembly: Package,
  painting: Paintbrush,
};

export default function OperationWorkloadView() {
  const { data: workload, isLoading } = useGetOperationWorkload();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    );
  }

  // If no data from backend, show placeholder operations
  const operations = workload && workload.length > 0 
    ? workload 
    : [
        { operation: 'Cutting', pendingCount: BigInt(0) },
        { operation: 'Welding', pendingCount: BigInt(0) },
        { operation: 'Assembly', pendingCount: BigInt(0) },
        { operation: 'Painting', pendingCount: BigInt(0) },
      ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {operations.map((op) => {
        const Icon = operationIcons[op.operation.toLowerCase()] || Package;
        const pendingCount = Number(op.pendingCount);
        const maxCapacity = 100; // Assumed max capacity for progress bar
        const progress = Math.min((pendingCount / maxCapacity) * 100, 100);

        return (
          <Card key={op.operation} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{op.operation}</CardTitle>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mb-3">Pending items</p>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {pendingCount === 0 ? 'No pending work' : `${progress.toFixed(0)}% of capacity`}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
