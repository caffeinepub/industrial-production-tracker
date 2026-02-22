import { useState } from 'react';
import { useCreateProductionEntry } from '../hooks/useQueries';
import { ContainerType, ContainerStatus } from '../backend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductionEntryForm() {
  const [containerType, setContainerType] = useState<ContainerType>(ContainerType.fullContainer);
  const [totalQty, setTotalQty] = useState('');
  const [shiftName, setShiftName] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [containerQty, setContainerQty] = useState('');
  const [status, setStatus] = useState<ContainerStatus>(ContainerStatus.pendingOperations);

  const createEntry = useCreateProductionEntry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!totalQty || !shiftName || !shiftId || !containerQty) {
      return;
    }

    createEntry.mutate(
      {
        containerType,
        shiftDetail: {
          name: shiftName,
          shiftId: BigInt(shiftId),
          containerQty: BigInt(containerQty),
        },
        status,
        totalQty: BigInt(totalQty),
      },
      {
        onSuccess: () => {
          // Reset form
          setTotalQty('');
          setShiftName('');
          setShiftId('');
          setContainerQty('');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Production Entry</CardTitle>
        <CardDescription>Record daily production data for container manufacturing</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="containerType">Container Type *</Label>
              <Select value={containerType} onValueChange={(value) => setContainerType(value as ContainerType)}>
                <SelectTrigger id="containerType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContainerType.fullContainer}>Full Container</SelectItem>
                  <SelectItem value={ContainerType.flatPack}>Flat Pack</SelectItem>
                  <SelectItem value={ContainerType.insulated}>Insulated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalQty">Total Quantity *</Label>
              <Input
                id="totalQty"
                type="number"
                min="1"
                value={totalQty}
                onChange={(e) => setTotalQty(e.target.value)}
                placeholder="Enter total quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftName">Shift Name *</Label>
              <Input
                id="shiftName"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                placeholder="e.g., Morning Shift"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shiftId">Shift ID *</Label>
              <Input
                id="shiftId"
                type="number"
                min="1"
                value={shiftId}
                onChange={(e) => setShiftId(e.target.value)}
                placeholder="Enter shift ID"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="containerQty">Shift Container Quantity *</Label>
              <Input
                id="containerQty"
                type="number"
                min="1"
                value={containerQty}
                onChange={(e) => setContainerQty(e.target.value)}
                placeholder="Containers in this shift"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Operation Status *</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as ContainerStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContainerStatus.pendingOperations}>Pending Operations</SelectItem>
                  <SelectItem value={ContainerStatus.underTesting}>Under Testing</SelectItem>
                  <SelectItem value={ContainerStatus.readyForDispatch}>Ready for Dispatch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto" disabled={createEntry.isPending}>
            {createEntry.isPending ? 'Creating...' : 'Create Production Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
