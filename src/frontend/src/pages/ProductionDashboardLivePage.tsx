import { useMemo } from 'react';
import { useGetDailyProductionReportsByDate, useMonthlyProductionSummary, useHistoricalOpeningBalance } from '../hooks/useQueries';
import LiveProductionTable from '../components/LiveProductionTable';
import ProductionTrendChart from '../components/ProductionTrendChart';
import OperationComparisonChart from '../components/OperationComparisonChart';
import SummaryCard from '../components/SummaryCard';
import MasterOrderProgressSection from '../components/MasterOrderProgressSection';
import MasterOrderUpdateForm from '../components/MasterOrderUpdateForm';
import { Factory, Truck, Package, Target, TrendingDown, Calendar, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProductionDashboardLivePage() {
  const today = new Date().toISOString().split('T')[0];
  const { data: todayReports = [], isLoading: reportsLoading } = useGetDailyProductionReportsByDate(today);
  const { data: monthlySummary, isLoading: summaryLoading } = useMonthlyProductionSummary();
  const { data: openingBalance } = useHistoricalOpeningBalance();

  const todayTotal = useMemo(() => {
    return todayReports.reduce((sum, report) => sum + Number(report.todayProduction), 0);
  }, [todayReports]);

  const totalInHand = useMemo(() => {
    return todayReports.reduce((sum, report) => sum + Number(report.inHand), 0);
  }, [todayReports]);

  const totalDispatched = useMemo(() => {
    return todayReports.reduce((sum, report) => sum + Number(report.despatched), 0);
  }, [todayReports]);

  const isLoading = reportsLoading || summaryLoading;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            Production Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Real-time production metrics and analytics
          </p>
        </div>
      </div>

      {/* Opening Balance Badge */}
      {openingBalance && (
        <div className="slide-up" style={{ animationDelay: '0.05s' }}>
          <Badge className="glass-card metallic-border px-6 py-3 text-sm font-medium bg-accent/20 border-accent/30 hover:bg-accent/30">
            <Info className="w-4 h-4 mr-2" />
            Baseline: {Number(openingBalance.manufacturedBeforeSystem).toLocaleString()} units manufactured before system go-live ({formatDate(openingBalance.openingDate)})
          </Badge>
        </div>
      )}

      {/* Master Order Progress Section */}
      <div className="slide-up" style={{ animationDelay: '0.1s' }}>
        <MasterOrderProgressSection />
      </div>

      {/* Master Order Update Form (Admin Only) */}
      <div className="slide-up" style={{ animationDelay: '0.2s' }}>
        <MasterOrderUpdateForm />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="slide-up" style={{ animationDelay: '0.3s' }}>
          <SummaryCard
            title="Today's Production"
            value={todayTotal}
            icon={Factory}
            description="Units produced today"
          />
        </div>
        <div className="slide-up" style={{ animationDelay: '0.4s' }}>
          <SummaryCard
            title="Monthly Target"
            value={`${monthlySummary?.completionPercentage.toFixed(1) || 0}%`}
            icon={Target}
            description={`${monthlySummary?.totalProduced || 0} / ${monthlySummary?.monthlyTarget || 0} units`}
          />
        </div>
        <div className="slide-up" style={{ animationDelay: '0.5s' }}>
          <SummaryCard
            title="Total In Hand"
            value={totalInHand}
            icon={Package}
            description="Units ready for dispatch"
          />
        </div>
        <div className="slide-up" style={{ animationDelay: '0.6s' }}>
          <SummaryCard
            title="Total Dispatched"
            value={totalDispatched}
            icon={Truck}
            description="Units shipped"
          />
        </div>
      </div>

      {/* Live Production Table */}
      <div className="slide-up" style={{ animationDelay: '0.7s' }}>
        <LiveProductionTable reports={todayReports} isLoading={isLoading} date={today} />
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="slide-up" style={{ animationDelay: '0.8s' }}>
          <ProductionTrendChart />
        </div>
        <div className="slide-up" style={{ animationDelay: '0.9s' }}>
          <OperationComparisonChart />
        </div>
      </div>
    </div>
  );
}
