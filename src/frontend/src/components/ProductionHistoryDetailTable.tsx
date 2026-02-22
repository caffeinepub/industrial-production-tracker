import { useProductionHistoryByDateRange, useContainerTypes, useContainerSizes } from '../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useState, useMemo } from 'react';
import EditProductionReportDialog from './EditProductionReportDialog';
import type { DailyProductionReport } from '../backend';

interface ProductionHistoryDetailTableProps {
  startDate: string;
  endDate: string;
  isAdmin: boolean;
  containerTypeId?: bigint | null;
  containerSizeId?: bigint | null;
}

export default function ProductionHistoryDetailTable({
  startDate,
  endDate,
  isAdmin,
  containerTypeId,
  containerSizeId,
}: ProductionHistoryDetailTableProps) {
  const { data: reports, isLoading } = useProductionHistoryByDateRange(
    startDate,
    endDate,
    containerTypeId,
    containerSizeId
  );
  const { data: containerTypes } = useContainerTypes();
  const { data: containerSizes } = useContainerSizes();
  const [editingReport, setEditingReport] = useState<DailyProductionReport | null>(null);

  const typeMap = useMemo(
    () => new Map(containerTypes?.map((type) => [type.id, type.container_type_name])),
    [containerTypes]
  );
  const sizeMap = useMemo(
    () => new Map(containerSizes?.map((size) => [size.id, size.container_size])),
    [containerSizes]
  );

  if (isLoading) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Production History</h2>
        <div className="text-center py-12 text-muted-foreground">
          No production records found for the selected date range and filters.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card metallic-border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Production History</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Container Type</TableHead>
                <TableHead>Container Size</TableHead>
                <TableHead className="text-right">Today's Production</TableHead>
                <TableHead className="text-right">Total Completed</TableHead>
                <TableHead className="text-right">Dispatched</TableHead>
                <TableHead className="text-right">In Hand</TableHead>
                {isAdmin && <TableHead className="text-center">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id.toString()} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{report.date}</TableCell>
                  <TableCell>{report.operationName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {typeMap.get(report.container_type_id) || `Type ${report.container_type_id}`}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {sizeMap.get(report.container_size_id) || `Size ${report.container_size_id}`}
                  </TableCell>
                  <TableCell className="text-right text-primary font-semibold">
                    {Number(report.todayProduction)}
                  </TableCell>
                  <TableCell className="text-right">{Number(report.totalCompleted)}</TableCell>
                  <TableCell className="text-right text-success">{Number(report.dispatched)}</TableCell>
                  <TableCell className="text-right text-warning">{Number(report.inHand)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingReport(report)}
                        className="hover:bg-primary/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {editingReport && (
        <EditProductionReportDialog
          report={editingReport}
          open={!!editingReport}
          onClose={() => setEditingReport(null)}
        />
      )}
    </>
  );
}
