import { useState } from 'react';
import ProductionHistoryDetailTable from '../components/ProductionHistoryDetailTable';
import DateRangeFilter from '../components/DateRangeFilter';
import { useIsCallerAdmin } from '../hooks/useQueries';

export default function ProductionHistoryPage() {
  const { data: isAdmin } = useIsCallerAdmin();

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const handleDateRangeChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">Production History</h1>
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onChange={handleDateRangeChange}
        />
      </div>

      {!isAdmin && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
          You are viewing production history in read-only mode. Only administrators can edit records.
        </div>
      )}

      <ProductionHistoryDetailTable
        startDate={startDate}
        endDate={endDate}
        isAdmin={isAdmin || false}
      />
    </div>
  );
}
