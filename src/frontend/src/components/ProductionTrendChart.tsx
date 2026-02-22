import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useProductionTrendData, useHistoricalOpeningBalance } from '../hooks/useQueries';

export default function ProductionTrendChart() {
  const { data, isLoading, isError, isRefetching } = useProductionTrendData();
  const { data: openingBalance } = useHistoricalOpeningBalance();

  if (isLoading) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Production Trend</h3>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Production Trend</h3>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          Failed to load production trend data
        </div>
      </div>
    );
  }

  // Prepare chart data with opening balance as first point
  let chartData: Array<{
    date: string;
    totalProduction: number;
    displayDate?: string;
    isOpeningBalance?: boolean;
  }> = data || [];
  
  if (openingBalance) {
    const openingBalancePoint = {
      date: openingBalance.openingDate,
      totalProduction: Number(openingBalance.manufacturedBeforeSystem),
      displayDate: new Date(openingBalance.openingDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      isOpeningBalance: true,
    };
    
    // Prepend opening balance to chart data
    chartData = [openingBalancePoint, ...chartData.map(item => ({ ...item, isOpeningBalance: false }))];
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Production Trend</h3>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No production trend data available
        </div>
      </div>
    );
  }

  const formattedData = chartData.map((item) => ({
    ...item,
    displayDate: item.displayDate || new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="glass-card metallic-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Production Trend</h3>
        </div>
        {isRefetching && (
          <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Daily total production output across all operations
        {openingBalance && ' (includes historical baseline)'}
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="productionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.55 0.20 264)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="oklch(0.55 0.20 264)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 264)" opacity={0.3} />
          <XAxis
            dataKey="displayDate"
            className="text-xs"
            tick={{ fill: 'oklch(0.65 0.01 264)' }}
            stroke="oklch(0.30 0.02 264)"
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'oklch(0.65 0.01 264)' }}
            stroke="oklch(0.30 0.02 264)"
            label={{ value: 'Production Output', angle: -90, position: 'insideLeft', style: { fill: 'oklch(0.65 0.01 264)' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.20 0.02 264)',
              border: '1px solid oklch(0.30 0.02 264)',
              borderRadius: '0.5rem',
              color: 'oklch(0.95 0.01 264)',
            }}
            labelStyle={{ color: 'oklch(0.95 0.01 264)' }}
            formatter={(value: any, name: any, props: any) => {
              if (props.payload.isOpeningBalance) {
                return [value, 'Opening Balance'];
              }
              return [value, 'Total Production'];
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalProduction"
            name="Total Production"
            stroke="oklch(0.55 0.20 264)"
            strokeWidth={3}
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isOpeningBalance) {
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={7}
                    fill="oklch(0.70 0.15 140)"
                    stroke="oklch(0.20 0.02 264)"
                    strokeWidth={2}
                  />
                );
              }
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill="oklch(0.55 0.20 264)"
                  stroke="oklch(0.20 0.02 264)"
                  strokeWidth={2}
                />
              );
            }}
            activeDot={{ r: 7, strokeWidth: 2 }}
            fill="url(#productionGradient)"
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
