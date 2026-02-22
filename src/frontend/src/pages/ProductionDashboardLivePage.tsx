import { useState, useEffect } from 'react';
import { useGetDailyProductionReportsByDate, useHistoricalOpeningBalance } from '../hooks/useQueries';
import LiveProductionTable from '../components/LiveProductionTable';
import ProductionTrendChart from '../components/ProductionTrendChart';
import OperationComparisonChart from '../components/OperationComparisonChart';
import MasterOrderProgressSection from '../components/MasterOrderProgressSection';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProductionDashboardLivePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const { data: reports = [], isLoading, isRefetching, refetch } = useGetDailyProductionReportsByDate(selectedDate);
  const { data: openingBalance } = useHistoricalOpeningBalance();

  // Refetch data when date changes to ensure fresh data
  useEffect(() => {
    refetch();
  }, [selectedDate, refetch]);

  // Calculate summary statistics from reports
  const todaysTotalProduction = reports.reduce((sum, report) => sum + Number(report.todayProduction), 0);
  const totalCompleted = reports.reduce((sum, report) => sum + Number(report.totalCompleted), 0);
  const totalDispatched = reports.reduce((sum, report) => sum + Number(report.dispatched), 0);
  const totalInHand = reports.reduce((sum, report) => sum + Number(report.inHand), 0);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Production Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time production monitoring and analytics
          </p>
        </div>
        
        {openingBalance && (
          <Badge variant="outline" className="bg-accent/20 border-accent px-4 py-2 text-sm font-medium">
            <Info className="w-4 h-4 mr-2" />
            Opening Balance: {Number(openingBalance.manufacturedBeforeSystem)} units (as of {new Date(openingBalance.openingDate).toLocaleDateString()})
          </Badge>
        )}
      </div>

      {/* Master Order Progress */}
      <MasterOrderProgressSection />

      {/* Date Filter */}
      <div className="glass-card metallic-border p-6 rounded-lg">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-primary" />
          <div className="flex-1 max-w-xs">
            <Label htmlFor="date-filter" className="text-sm font-medium mb-2 block">
              Select Date
            </Label>
            <Input
              id="date-filter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="glass-input"
            />
          </div>
          {isRefetching && (
            <Badge variant="outline" className="animate-pulse">
              Refreshing...
            </Badge>
          )}
        </div>

        {/* Summary Statistics for Selected Date */}
        {reports.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Today's Production</p>
              <p className="text-2xl font-bold text-primary">{todaysTotalProduction}</p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Completed</p>
              <p className="text-2xl font-bold text-foreground">{totalCompleted}</p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Dispatched</p>
              <p className="text-2xl font-bold text-foreground">{totalDispatched}</p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total In Hand</p>
              <p className="text-2xl font-bold text-accent">{totalInHand}</p>
            </div>
          </div>
        )}
      </div>

      {/* Daily Production Table */}
      <LiveProductionTable reports={reports} isLoading={isLoading} date={selectedDate} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductionTrendChart />
        <OperationComparisonChart />
      </div>
    </div>
  );
}
