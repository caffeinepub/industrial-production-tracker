import { useState } from 'react';
import { useGetDispatchEntries, useUpdateDispatchStatus } from '../hooks/useQueries';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContainerType } from '../backend';

interface DispatchHistoryTableProps {
  isAdmin: boolean;
}

export default function DispatchHistoryTable({ isAdmin }: DispatchHistoryTableProps) {
  const { data: dispatches = [], isLoading } = useGetDispatchEntries();
  const updateStatus = useUpdateDispatchStatus();
  const [selectedDispatch, setSelectedDispatch] = useState<bigint | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleUpdateStatus = () => {
    if (selectedDispatch !== null && newStatus.trim()) {
      updateStatus.mutate(
        { dispatchId: selectedDispatch, newStatus: newStatus.trim() },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setNewStatus('');
            setSelectedDispatch(null);
          },
        }
      );
    }
  };

  const getContainerTypeLabel = (type: ContainerType): string => {
    switch (type) {
      case ContainerType.fullContainer:
        return 'Full Container';
      case ContainerType.flatPack:
        return 'Flat Pack';
      case ContainerType.insulated:
        return 'Insulated';
      default:
        return String(type);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dispatch History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">Loading dispatch records...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispatch History</CardTitle>
      </CardHeader>
      <CardContent>
        {dispatches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No dispatch records found</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispatch ID</TableHead>
                  <TableHead>Container Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Dispatch Date</TableHead>
                  <TableHead>Status</TableHead>
                  {isAdmin && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {dispatches.map((dispatch) => (
                  <TableRow key={dispatch.dispatchId.toString()}>
                    <TableCell className="font-medium">{dispatch.dispatchId.toString()}</TableCell>
                    <TableCell>{getContainerTypeLabel(dispatch.containerType)}</TableCell>
                    <TableCell>{dispatch.quantity.toString()}</TableCell>
                    <TableCell>{dispatch.destination}</TableCell>
                    <TableCell>
                      {new Date(Number(dispatch.dispatchDate) / 1000000).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{dispatch.deliveryStatus}</Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Dialog open={dialogOpen && selectedDispatch === dispatch.dispatchId} onOpenChange={setDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDispatch(dispatch.dispatchId);
                                setNewStatus(dispatch.deliveryStatus);
                                setDialogOpen(true);
                              }}
                            >
                              Update Status
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Delivery Status</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="status">New Status</Label>
                                <Input
                                  id="status"
                                  value={newStatus}
                                  onChange={(e) => setNewStatus(e.target.value)}
                                  placeholder="e.g., In Transit, Delivered"
                                />
                              </div>
                              <Button
                                onClick={handleUpdateStatus}
                                disabled={!newStatus.trim() || updateStatus.isPending}
                                className="w-full"
                              >
                                {updateStatus.isPending ? 'Updating...' : 'Update Status'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
