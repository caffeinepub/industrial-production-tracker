import { useMemo } from 'react';
import { useGetDailyProductionReportsByDate, useMonthlyProductionSummary } from '../hooks/useQueries';
import LiveProductionTable from '../components/LiveProductionTable';
import ProductionTrendChart from '../components/ProductionTrendChart';
import OperationComparisonChart from '../components/OperationComparisonChart';
import SummaryCard from '../components/SummaryCard';
import { Factory, Truck, Package, Target, TrendingDown, Percent, Calendar } from 'lucide-react';

export default function ProductionDashboardLivePage() {
  const today = new Date().toISOString().split('T')[0];
  const { data: reports, isLoading } = useGetDailyProductionReportsByDate(today);
  const { data: monthlySummary, isLoading: monthlyLoading } = useMonthlyProductionSummary();

  const summaryStats = useMemo(() => {
    if (!reports || reports.length === 0) {
      return {
        totalProducedToday: 0,
        totalDespatched: 0,
        totalInHand: 0,
      };
    }

    return {
      totalProducedToday: reports.reduce((sum, report) => sum + Number(report.todayProduction), 0),
      totalDespatched: reports.reduce((sum, report) => sum + Number(report.despatched), 0),
      totalInHand: reports.reduce((sum, report) => sum + Number(report.inHand), 0),
    };
  }, [reports]);

  const formattedDate = new Date(today).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Production Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Live production metrics for {formattedDate}
        </p>
      </div>

      {/* Monthly Production Summary */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold">Monthly Target Progress (Target: 100 Containers)</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total Containers Produced This Month"
            value={monthlyLoading ? '...' : monthlySummary?.totalProduced ?? 0}
            icon={Target}
            description="Cumulative production for current month"
          />
          <SummaryCard
            title="Remaining to Achieve Target"
            value={monthlyLoading ? '...' : monthlySummary?.remainingToTarget ?? 0}
            icon={TrendingDown}
            description="Containers needed to reach monthly goal"
          />
          <SummaryCard
            title="Production Completion Percentage"
            value={monthlyLoading ? '...' : `${monthlySummary?.completionPercentage.toFixed(1) ?? 0}%`}
            icon={Percent}
            description="Progress towards monthly target"
          />
          <SummaryCard
            title="Daily Average Production"
            value={monthlyLoading ? '...' : monthlySummary?.dailyAverage.toFixed(1) ?? 0}
            icon={Calendar}
            description="Average containers per day this month"
          />
        </div>
      </div>

      {/* Daily Production Summary */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold">Daily Production Summary</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard
            title="Total Container Produced Today"
            value={summaryStats.totalProducedToday}
            icon={Factory}
            description="Containers completed across all operations"
          />
          <SummaryCard
            title="Total Container Despatched"
            value={summaryStats.totalDespatched}
            icon={Truck}
            description="Containers shipped to customers"
          />
          <SummaryCard
            title="Total Work in Hand"
            value={summaryStats.totalInHand}
            icon={Package}
            description="Containers in production pipeline"
          />
        </div>
      </div>

      {/* Production Charts */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold">Production Analytics</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ProductionTrendChart />
          <OperationComparisonChart />
        </div>
      </div>

      {/* Production Table */}
      <LiveProductionTable reports={reports || []} isLoading={isLoading} date={today} />
    </div>
  );
}
