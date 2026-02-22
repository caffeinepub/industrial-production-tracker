import { useState } from 'react';
import { useGetDailyProductionReportsByDate } from '../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';

export default function DailyProductionReportTable() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const { data: reports, isLoading } = useGetDailyProductionReportsByDate(selectedDate);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Daily Production Report</CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="reportDate" className="flex items-center gap-1 text-sm whitespace-nowrap">
              <Calendar className="h-4 w-4" />
              Date:
            </Label>
            <Input
              id="reportDate"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Operation Name</TableHead>
                  <TableHead className="text-right">Today's Production</TableHead>
                  <TableHead className="text-right">Total Completed</TableHead>
                  <TableHead className="text-right">Dispatched</TableHead>
                  <TableHead className="text-right">In Hand</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={Number(report.id)}>
                      <TableCell className="font-medium">{report.operationName}</TableCell>
                      <TableCell className="text-right">{Number(report.todayProduction)}</TableCell>
                      <TableCell className="text-right">{Number(report.totalCompleted)}</TableCell>
                      <TableCell className="text-right">{Number(report.dispatched)}</TableCell>
                      <TableCell className="text-right">{Number(report.inHand)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No production reports found for {selectedDate}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
