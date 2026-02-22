import { useState } from 'react';
import { useCreateDispatchEntry } from '../hooks/useQueries';
import { ContainerType } from '../backend';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DispatchEntryForm() {
  const [containerType, setContainerType] = useState<ContainerType>(ContainerType.fullContainer);
  const [quantity, setQuantity] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [destination, setDestination] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState('Pending');

  const createDispatch = useCreateDispatchEntry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantity || !dispatchDate || !destination) {
      return;
    }

    const dateTimestamp = BigInt(new Date(dispatchDate).getTime() * 1000000);

    createDispatch.mutate(
      {
        containerType,
        quantity: BigInt(quantity),
        dispatchDate: dateTimestamp,
        destination,
        deliveryStatus,
      },
      {
        onSuccess: () => {
          setQuantity('');
          setDispatchDate('');
          setDestination('');
          setDeliveryStatus('Pending');
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Dispatch Entry</CardTitle>
        <CardDescription>Record container dispatch information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dispatchContainerType">Container Type *</Label>
              <Select value={containerType} onValueChange={(value) => setContainerType(value as ContainerType)}>
                <SelectTrigger id="dispatchContainerType">
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
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dispatchDate">Dispatch Date *</Label>
              <Input
                id="dispatchDate"
                type="date"
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination *</Label>
              <Input
                id="destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deliveryStatus">Delivery Status *</Label>
              <Select value={deliveryStatus} onValueChange={setDeliveryStatus}>
                <SelectTrigger id="deliveryStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto" disabled={createDispatch.isPending}>
            {createDispatch.isPending ? 'Creating...' : 'Create Dispatch Entry'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
