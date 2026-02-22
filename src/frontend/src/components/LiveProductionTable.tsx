import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, CheckCircle2 } from 'lucide-react';
import type { DailyProductionReport } from '../backend';

interface LiveProductionTableProps {
  reports: DailyProductionReport[];
  isLoading: boolean;
  date: string;
}

// All 17 operations in the correct order
const ALL_OPERATIONS = [
  'Boxing',
  'Welding/Finishing',
  'Rear Wall',
  'Front Wall',
  'Side Wall',
  'Roof',
  'Rear Door',
  'Blasting & Primer',
  'Final Paint',
  'Gasket',
  'DLM',
  'Plywood',
  'Floor Screw',
  'Decal',
  'Data Plate',
  'Sikha',
  'Black Paint',
];

export default function LiveProductionTable({ reports, isLoading, date }: LiveProductionTableProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Create a map of operation name to report for quick lookup
  const reportMap = new Map<string, DailyProductionReport>();
  reports.forEach(report => {
    reportMap.set(report.operationName, report);
  });

  // Build ordered list of reports, showing all 17 operations
  const orderedReports = ALL_OPERATIONS.map(operationName => {
    const report = reportMap.get(operationName);
    if (report) {
      return report;
    }
    // Return placeholder for missing operations
    return {
      id: BigInt(0),
      date,
      operationName,
      todayProduction: BigInt(0),
      totalCompleted: BigInt(0),
      dispatched: BigInt(0),
      inHand: BigInt(0),
    } as DailyProductionReport;
  });

  return (
    <Card className="glass-card metallic-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Daily Production by Operation
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {formattedDate}
            </div>
            {reports.length === 17 && (
              <CheckCircle2 className="h-5 w-5 text-success" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((i) => (
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
                  <TableHead className="text-right">Dispatched</TableHead>
                  <TableHead className="text-right">In Hand</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderedReports.map((report, index) => {
                  const hasData = Number(report.todayProduction) > 0 || Number(report.totalCompleted) > 0;
                  return (
                    <TableRow 
                      key={`${report.operationName}-${index}`} 
                      className={`hover:bg-muted/50 transition-colors ${!hasData ? 'opacity-50' : ''}`}
                    >
                      <TableCell className="font-medium">{report.operationName}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md font-semibold animate-fade-in ${
                          Number(report.todayProduction) > 0 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {Number(report.todayProduction)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{Number(report.totalCompleted)}</TableCell>
                      <TableCell className="text-right">{Number(report.dispatched)}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 rounded-md font-medium ${
                          Number(report.inHand) > 0 
                            ? 'bg-accent' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {Number(report.inHand)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
