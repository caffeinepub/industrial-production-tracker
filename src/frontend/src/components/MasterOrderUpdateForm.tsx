import { useState, useEffect } from 'react';
import { useIsCallerAdmin, useUpdateMasterOrderStatus, useGetMasterOrderStatus } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function MasterOrderUpdateForm() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsCallerAdmin();
  const { data: masterOrder } = useGetMasterOrderStatus();
  const updateMutation = useUpdateMasterOrderStatus();

  const [totalManufactured, setTotalManufactured] = useState('');
  const [totalDispatched, setTotalDispatched] = useState('');
  const [errors, setErrors] = useState<{ manufactured?: string; dispatched?: string }>({});

  useEffect(() => {
    if (masterOrder) {
      setTotalManufactured(masterOrder.totalManufactured.toString());
      setTotalDispatched(masterOrder.totalDispatched.toString());
    }
  }, [masterOrder]);

  if (isAdminLoading) {
    return null;
  }

  if (!isAdmin) {
    return null;
  }

  const totalOrderQuantity = masterOrder ? Number(masterOrder.totalOrderQuantity) : 0;
  const manufacturedNum = parseInt(totalManufactured) || 0;
  const dispatchedNum = parseInt(totalDispatched) || 0;

  const remainingToProduce = totalOrderQuantity - manufacturedNum;
  const finishedStock = manufacturedNum - dispatchedNum;
  const completionPercentage = totalOrderQuantity > 0 ? (manufacturedNum / totalOrderQuantity) * 100 : 0;

  const validateForm = (): boolean => {
    const newErrors: { manufactured?: string; dispatched?: string } = {};

    if (manufacturedNum < 0) {
      newErrors.manufactured = 'Cannot be negative';
    }

    if (dispatchedNum < 0) {
      newErrors.dispatched = 'Cannot be negative';
    }

    if (dispatchedNum > manufacturedNum) {
      newErrors.dispatched = 'Cannot exceed manufactured quantity';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    updateMutation.mutate({
      totalManufactured: BigInt(manufacturedNum),
      totalDispatched: BigInt(dispatchedNum),
    });
  };

  return (
    <Card className="glass-card metallic-border overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
      <CardHeader className="relative z-10">
        <CardTitle className="text-2xl font-bold">Update Master Order Status</CardTitle>
        <CardDescription>Modify production and dispatch quantities for the master order</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalManufactured" className="text-sm font-semibold">
                Total Manufactured
              </Label>
              <Input
                id="totalManufactured"
                type="number"
                min="0"
                value={totalManufactured}
                onChange={(e) => setTotalManufactured(e.target.value)}
                className="glass-input"
                disabled={updateMutation.isPending}
              />
              {errors.manufactured && (
                <p className="text-xs text-destructive">{errors.manufactured}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalDispatched" className="text-sm font-semibold">
                Total Dispatched
              </Label>
              <Input
                id="totalDispatched"
                type="number"
                min="0"
                value={totalDispatched}
                onChange={(e) => setTotalDispatched(e.target.value)}
                className="glass-input"
                disabled={updateMutation.isPending}
              />
              {errors.dispatched && (
                <p className="text-xs text-destructive">{errors.dispatched}</p>
              )}
            </div>
          </div>

          {/* Real-time Calculated Fields */}
          <div className="glass-card metallic-border p-6 rounded-lg space-y-4 bg-muted/30">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Auto-Calculated Metrics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Remaining to Produce</p>
                <p className="text-2xl font-bold text-primary">{remainingToProduce}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Finished Stock</p>
                <p className="text-2xl font-bold text-primary">{finishedStock}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Completion %</p>
                <p className="text-2xl font-bold text-primary">{completionPercentage.toFixed(2)}%</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Master Order Status'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
