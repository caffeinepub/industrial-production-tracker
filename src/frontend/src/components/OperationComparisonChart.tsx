import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { useOperationComparisonData } from '../hooks/useQueries';

interface OperationComparisonChartProps {
  containerTypeId?: bigint | null;
  containerSizeId?: bigint | null;
}

export default function OperationComparisonChart({ containerTypeId, containerSizeId }: OperationComparisonChartProps) {
  const { data, isLoading, isError, isRefetching } = useOperationComparisonData(containerTypeId, containerSizeId);

  if (isLoading) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Operation-wise Comparison</h3>
        </div>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Operation-wise Comparison</h3>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          Failed to load operation comparison data
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Operation-wise Comparison</h3>
        </div>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No operation comparison data available for selected filters
        </div>
      </div>
    );
  }

  const barColors = [
    'oklch(0.55 0.20 264)',
    'oklch(0.65 0.20 145)',
    'oklch(0.70 0.18 65)',
    'oklch(0.577 0.245 27.325)',
    'oklch(0.45 0.15 220)',
  ];

  return (
    <div className="glass-card metallic-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Operation-wise Comparison</h3>
        </div>
        {isRefetching && (
          <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Total completed units by operation
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
          <defs>
            {barColors.map((color, index) => (
              <linearGradient key={index} id={`barGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0.02 264)" opacity={0.3} />
          <XAxis
            dataKey="operation"
            angle={-45}
            textAnchor="end"
            height={100}
            className="text-xs"
            tick={{ fill: 'oklch(0.65 0.01 264)' }}
            stroke="oklch(0.30 0.02 264)"
            interval={0}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'oklch(0.65 0.01 264)' }}
            stroke="oklch(0.30 0.02 264)"
            label={{ value: 'Total Completed', angle: -90, position: 'insideLeft', style: { fill: 'oklch(0.65 0.01 264)' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'oklch(0.20 0.02 264)',
              border: '1px solid oklch(0.30 0.02 264)',
              borderRadius: '0.5rem',
              color: 'oklch(0.95 0.01 264)',
            }}
            labelStyle={{ color: 'oklch(0.95 0.01 264)' }}
          />
          <Legend />
          <Bar
            dataKey="production"
            name="Total Completed"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#barGradient${index % barColors.length})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
