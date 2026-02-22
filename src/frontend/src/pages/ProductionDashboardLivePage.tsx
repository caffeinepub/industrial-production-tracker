import { useState } from 'react';
import { useGetDailyProductionReportsByDate, useGetEnhancedMasterOrderStatus } from '../hooks/useQueries';
import SummaryCard from '../components/SummaryCard';
import LiveProductionTable from '../components/LiveProductionTable';
import ProductionTrendChart from '../components/ProductionTrendChart';
import OperationComparisonChart from '../components/OperationComparisonChart';
import MasterOrderProgressSection from '../components/MasterOrderProgressSection';
import ContainerTypeFilter from '../components/ContainerTypeFilter';
import ContainerSizeFilter from '../components/ContainerSizeFilter';
import TypeWiseProductionSummary from '../components/TypeWiseProductionSummary';
import { Package, TruckIcon, Warehouse, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProductionDashboardLivePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [containerTypeId, setContainerTypeId] = useState<bigint | null>(null);
  const [containerSizeId, setContainerSizeId] = useState<bigint | null>(null);

  const { data: reports, isLoading, isRefetching } = useGetDailyProductionReportsByDate(
    selectedDate,
    containerTypeId,
    containerSizeId
  );
  const { data: masterOrderStatus, isRefetching: isMasterOrderRefetching } = useGetEnhancedMasterOrderStatus();

  const totalProducedToday = reports?.reduce((sum, report) => sum + Number(report.todayProduction), 0) || 0;
  const totalDispatched = reports?.reduce((sum, report) => sum + Number(report.dispatched), 0) || 0;
  const totalInHand = reports?.reduce((sum, report) => sum + Number(report.inHand), 0) || 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Live Production Dashboard</h1>
        {(isRefetching || isMasterOrderRefetching) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Refreshing data...</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="date-filter">Select Date</Label>
        <Input
          id="date-filter"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="glass-card metallic-border max-w-xs"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContainerTypeFilter value={containerTypeId} onChange={setContainerTypeId} />
        <ContainerSizeFilter value={containerSizeId} onChange={setContainerSizeId} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Produced Today"
          value={totalProducedToday}
          icon={Package}
        />
        <SummaryCard
          title="Total Dispatched"
          value={totalDispatched}
          icon={TruckIcon}
        />
        <SummaryCard
          title="Work in Hand"
          value={totalInHand}
          icon={Warehouse}
        />
      </div>

      <MasterOrderProgressSection />

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Production by Container Type</h2>
        <TypeWiseProductionSummary
          startDate={selectedDate}
          endDate={selectedDate}
          containerSizeId={containerSizeId}
        />
      </div>

      <LiveProductionTable
        date={selectedDate}
        containerTypeId={containerTypeId}
        containerSizeId={containerSizeId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductionTrendChart containerTypeId={containerTypeId} containerSizeId={containerSizeId} />
        <OperationComparisonChart containerTypeId={containerTypeId} containerSizeId={containerSizeId} />
      </div>
    </div>
  );
}
