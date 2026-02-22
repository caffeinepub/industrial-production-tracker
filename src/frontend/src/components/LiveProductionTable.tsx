import { useGetDailyProductionReportsByDate, useContainerTypes, useContainerSizes } from '../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Circle } from 'lucide-react';
import { useMemo } from 'react';

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

interface LiveProductionTableProps {
  date: string;
  containerTypeId?: bigint | null;
  containerSizeId?: bigint | null;
}

export default function LiveProductionTable({ date, containerTypeId, containerSizeId }: LiveProductionTableProps) {
  const { data: reports, isLoading } = useGetDailyProductionReportsByDate(date, containerTypeId, containerSizeId);
  const { data: containerTypes } = useContainerTypes();
  const { data: containerSizes } = useContainerSizes();

  const typeMap = useMemo(
    () => new Map(containerTypes?.map((type) => [type.id, type.container_type_name])),
    [containerTypes]
  );
  const sizeMap = useMemo(
    () => new Map(containerSizes?.map((size) => [size.id, size.container_size])),
    [containerSizes]
  );

  const tableData = useMemo(() => {
    const reportMap = new Map(reports?.map((r) => [r.operationName, r]));

    return ALL_OPERATIONS.map((operation) => {
      const report = reportMap.get(operation);
      return {
        operation,
        hasData: !!report,
        containerType: report ? typeMap.get(report.container_type_id) || '-' : containerTypeId ? typeMap.get(containerTypeId) || 'All' : 'All',
        containerSize: report ? sizeMap.get(report.container_size_id) || '-' : containerSizeId ? sizeMap.get(containerSizeId) || 'All' : 'All',
        todayProduction: report ? Number(report.todayProduction) : 0,
        totalCompleted: report ? Number(report.totalCompleted) : 0,
        dispatched: report ? Number(report.dispatched) : 0,
        inHand: report ? Number(report.inHand) : 0,
      };
    });
  }, [reports, containerTypeId, containerSizeId, typeMap, sizeMap]);

  if (isLoading) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="glass-card metallic-border rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Production Details - {date}</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Operation</TableHead>
              <TableHead>Container Type</TableHead>
              <TableHead>Container Size</TableHead>
              <TableHead className="text-right">Today's Production</TableHead>
              <TableHead className="text-right">Total Completed</TableHead>
              <TableHead className="text-right">Dispatched</TableHead>
              <TableHead className="text-right">In Hand</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow
                key={row.operation}
                className={`${row.hasData ? 'animate-fade-in' : 'opacity-50'} hover:bg-muted/50 transition-colors`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TableCell>
                  {row.hasData ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{row.operation}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.containerType}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.containerSize}</TableCell>
                <TableCell className="text-right font-semibold text-primary">{row.todayProduction}</TableCell>
                <TableCell className="text-right">{row.totalCompleted}</TableCell>
                <TableCell className="text-right text-success">{row.dispatched}</TableCell>
                <TableCell className="text-right text-warning">{row.inHand}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
