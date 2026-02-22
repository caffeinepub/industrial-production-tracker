import { useState } from 'react';
import { useGetFilteredProductionEntries } from '../hooks/useQueries';
import { ContainerType, ContainerStatus } from '../backend';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductionHistoryTable() {
  const [containerTypeFilter, setContainerTypeFilter] = useState<ContainerType | null>(null);
  const [statusFilter, setStatusFilter] = useState<ContainerStatus | null>(null);

  const { data: entries, isLoading } = useGetFilteredProductionEntries(containerTypeFilter, statusFilter);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadge = (status: ContainerStatus) => {
    const variants: Record<ContainerStatus, { label: string; className: string }> = {
      [ContainerStatus.readyForDispatch]: { label: 'Ready for Dispatch', className: 'bg-green-600 hover:bg-green-700' },
      [ContainerStatus.pendingOperations]: { label: 'Pending Operations', className: 'bg-amber-600 hover:bg-amber-700' },
      [ContainerStatus.underTesting]: { label: 'Under Testing', className: 'bg-blue-600 hover:bg-blue-700' },
    };
    const config = variants[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatContainerType = (type: ContainerType) => {
    const labels: Record<ContainerType, string> = {
      [ContainerType.fullContainer]: 'Full Container',
      [ContainerType.flatPack]: 'Flat Pack',
      [ContainerType.insulated]: 'Insulated',
    };
    return labels[type];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Production History</CardTitle>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          <div className="space-y-2">
            <Label>Filter by Container Type</Label>
            <Select
              value={containerTypeFilter || 'all'}
              onValueChange={(value) => setContainerTypeFilter(value === 'all' ? null : (value as ContainerType))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={ContainerType.fullContainer}>Full Container</SelectItem>
                <SelectItem value={ContainerType.flatPack}>Flat Pack</SelectItem>
                <SelectItem value={ContainerType.insulated}>Insulated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Filter by Status</Label>
            <Select
              value={statusFilter || 'all'}
              onValueChange={(value) => setStatusFilter(value === 'all' ? null : (value as ContainerStatus))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={ContainerStatus.pendingOperations}>Pending Operations</SelectItem>
                <SelectItem value={ContainerStatus.underTesting}>Under Testing</SelectItem>
                <SelectItem value={ContainerStatus.readyForDispatch}>Ready for Dispatch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entry ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Container Type</TableHead>
                  <TableHead>Total Qty</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries && entries.length > 0 ? (
                  entries.map((entry) => (
                    <TableRow key={Number(entry.entryId)}>
                      <TableCell className="font-medium">#{Number(entry.entryId)}</TableCell>
                      <TableCell className="text-sm">{formatDate(entry.createdAt)}</TableCell>
                      <TableCell>{formatContainerType(entry.containerType)}</TableCell>
                      <TableCell>{Number(entry.totalQty)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{entry.shiftDetail.name}</div>
                          <div className="text-muted-foreground">ID: {Number(entry.shiftDetail.shiftId)}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No production entries found
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
