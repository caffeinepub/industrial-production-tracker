import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from 'lucide-react';
import type { DailyProductionReport } from '../backend';

interface LiveProductionTableProps {
  reports: DailyProductionReport[];
  isLoading: boolean;
  date: string;
}

export default function LiveProductionTable({ reports, isLoading, date }: LiveProductionTableProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Daily Production by Operation
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {formattedDate}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Operation Name</TableHead>
                  <TableHead className="text-right">Today's Production</TableHead>
                  <TableHead className="text-right">Total Completed</TableHead>
                  <TableHead className="text-right">Despatched</TableHead>
                  <TableHead className="text-right">In Hand</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports && reports.length > 0 ? (
                  reports.map((report) => (
                    <TableRow key={Number(report.id)} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{report.operationName}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold">
                          {Number(report.todayProduction)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{Number(report.totalCompleted)}</TableCell>
                      <TableCell className="text-right">{Number(report.despatched)}</TableCell>
                      <TableCell className="text-right">
                        <span className="inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md bg-accent font-medium">
                          {Number(report.inHand)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No production data available for {formattedDate}
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
