import { useGetMasterOrderStatus } from '../hooks/useQueries';
import SummaryCard from './SummaryCard';
import CircularProgress from './CircularProgress';
import { Package, Truck, Factory, CheckCircle2, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MasterOrderProgressSection() {
  const { data: masterOrder, isLoading, error, isRefetching } = useGetMasterOrderStatus();

  if (isLoading) {
    return (
      <div className="glass-card metallic-border p-8 rounded-lg animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !masterOrder) {
    return (
      <div className="glass-card metallic-border p-8 rounded-lg">
        <p className="text-destructive">Failed to load master order status</p>
      </div>
    );
  }

  // Backend totals already include opening balance (344 manufactured, 344 dispatched)
  const totalOrderQuantity = Number(masterOrder.totalOrderQuantity);
  const totalManufactured = Number(masterOrder.totalManufactured);
  const totalDispatched = Number(masterOrder.totalDispatched);

  const remainingToProduce = totalOrderQuantity - totalManufactured;
  const finishedStock = totalManufactured - totalDispatched;
  const completionPercentage = totalOrderQuantity > 0 ? (totalManufactured / totalOrderQuantity) * 100 : 0;

  return (
    <div className="glass-card metallic-border p-8 rounded-lg space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {masterOrder.orderName}
          </h2>
          <p className="text-muted-foreground mt-1">
            Total Order: <span className="font-semibold text-foreground">{totalOrderQuantity} Units</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRefetching && (
            <Badge variant="outline" className="animate-pulse">
              <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
              Updating...
            </Badge>
          )}
          {finishedStock === 0 && totalManufactured > 0 && (
            <Badge className="bg-success/20 text-success border-success/30 px-4 py-2 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              No Pending Dispatch
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Circular Progress */}
        <div className="flex items-center justify-center">
          <CircularProgress
            percentage={completionPercentage}
            total={totalManufactured}
            target={totalOrderQuantity}
            remaining={remainingToProduce}
          />
        </div>

        {/* Summary Cards - Display backend-calculated totals that incorporate the historical opening balance (344 manufactured, 344 dispatched) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryCard
            title="Total Manufactured"
            value={totalManufactured}
            icon={Factory}
            description="Units produced"
          />
          <SummaryCard
            title="Total Dispatched"
            value={totalDispatched}
            icon={Truck}
            description="Units shipped"
          />
          <SummaryCard
            title="Remaining to Produce"
            value={remainingToProduce}
            icon={Package}
            description="Units pending"
          />
          <SummaryCard
            title="Finished Stock"
            value={finishedStock}
            icon={CheckCircle2}
            description="Ready for dispatch"
          />
        </div>
      </div>
    </div>
  );
}
