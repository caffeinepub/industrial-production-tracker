import { useState } from 'react';
import { useProductionHistoryByDateRange } from '../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil } from 'lucide-react';
import EditProductionReportDialog from './EditProductionReportDialog';
import type { DailyProductionReport } from '../backend';

interface ProductionHistoryDetailTableProps {
  startDate: string;
  endDate: string;
  isAdmin: boolean;
}

export default function ProductionHistoryDetailTable({ startDate, endDate, isAdmin }: ProductionHistoryDetailTableProps) {
  const { data: reports = [], isLoading } = useProductionHistoryByDateRange(startDate, endDate);
  const [editingReport, setEditingReport] = useState<DailyProductionReport | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (reports.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            No production records found for the selected date range.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Operation</TableHead>
                  <TableHead className="text-right">Today's Production</TableHead>
                  <TableHead className="text-right">Total Completed</TableHead>
                  <TableHead className="text-right">Dispatched</TableHead>
                  <TableHead className="text-right">In Hand</TableHead>
                  {isAdmin && <TableHead className="text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id.toString()}>
                    <TableCell className="font-medium">{report.date || 'N/A'}</TableCell>
                    <TableCell>{report.operationName}</TableCell>
                    <TableCell className="text-right">{report.todayProduction.toString()}</TableCell>
                    <TableCell className="text-right">{report.totalCompleted.toString()}</TableCell>
                    <TableCell className="text-right">{report.dispatched.toString()}</TableCell>
                    <TableCell className="text-right font-semibold">{report.inHand.toString()}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingReport(report)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {editingReport && (
        <EditProductionReportDialog
          open={true}
          entry={editingReport}
          onSuccess={() => setEditingReport(null)}
          onCancel={() => setEditingReport(null)}
        />
      )}
    </>
  );
}
