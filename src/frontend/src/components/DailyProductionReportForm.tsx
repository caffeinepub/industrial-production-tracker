import { useState } from 'react';
import { useSubmitOrUpdateDailyReport, useSubmitDailyReportBatch, useUpdateMasterOrderStatus } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import type { DailyReportBatchEntry } from '../backend';

const OPERATIONS = [
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

export default function DailyProductionReportForm() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [operationName, setOperationName] = useState('Boxing');
  const [todayProduction, setTodayProduction] = useState('');
  const [totalCompleted, setTotalCompleted] = useState('');
  const [dispatched, setDispatched] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [batchData, setBatchData] = useState<Record<string, { today: string; total: string; dispatch: string }>>({});
  const [masterOrderData, setMasterOrderData] = useState({ totalManufactured: '', totalDispatched: '' });

  const submitMutation = useSubmitOrUpdateDailyReport();
  const batchMutation = useSubmitDailyReportBatch();
  const updateMasterOrderMutation = useUpdateMasterOrderStatus();

  const inHand = totalCompleted && dispatched ? (Number(totalCompleted) - Number(dispatched)).toString() : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !operationName || !todayProduction || !totalCompleted || !dispatched) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await submitMutation.mutateAsync({
        date,
        operationName,
        todayProduction: BigInt(todayProduction),
        totalCompleted: BigInt(totalCompleted),
        dispatched: BigInt(dispatched),
        inHand: BigInt(inHand),
      });

      // Reset form
      setTodayProduction('');
      setTotalCompleted('');
      setDispatched('');
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const entries: DailyReportBatchEntry[] = [];
    
    for (const operation of OPERATIONS) {
      const data = batchData[operation];
      if (data && data.today && data.total && data.dispatch) {
        const calculatedInHand = Number(data.total) - Number(data.dispatch);
        entries.push({
          date,
          operationName: operation,
          todayProduction: BigInt(data.today),
          totalCompleted: BigInt(data.total),
          dispatched: BigInt(data.dispatch),
          inHand: BigInt(calculatedInHand),
        });
      }
    }

    if (entries.length === 0) {
      toast.error('Please fill in at least one operation');
      return;
    }

    try {
      await batchMutation.mutateAsync({ date, operations: entries });
      
      // Update master order status if provided
      if (masterOrderData.totalManufactured && masterOrderData.totalDispatched) {
        await updateMasterOrderMutation.mutateAsync({
          totalManufactured: BigInt(masterOrderData.totalManufactured),
          totalDispatched: BigInt(masterOrderData.totalDispatched),
        });
      }

      // Reset form
      setBatchData({});
      setMasterOrderData({ totalManufactured: '', totalDispatched: '' });
    } catch (error) {
      console.error('Failed to submit batch reports:', error);
    }
  };

  const updateBatchData = (operation: string, field: 'today' | 'total' | 'dispatch', value: string) => {
    setBatchData(prev => ({
      ...prev,
      [operation]: {
        ...prev[operation],
        [field]: value,
      },
    }));
  };

  const isSubmitting = submitMutation.isPending || batchMutation.isPending || updateMasterOrderMutation.isPending;

  return (
    <Card className="glass-card metallic-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {batchMode ? <Upload className="h-5 w-5" /> : <Save className="h-5 w-5" />}
            {batchMode ? 'Batch Production Entry' : 'Daily Production Report'}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="batch-mode" className="text-sm">Batch Mode</Label>
            <Switch
              id="batch-mode"
              checked={batchMode}
              onCheckedChange={setBatchMode}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!batchMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="glass-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="operation">Operation Name</Label>
              <select
                id="operation"
                value={operationName}
                onChange={(e) => setOperationName(e.target.value)}
                className="w-full px-3 py-2 glass-input rounded-md"
                required
              >
                {OPERATIONS.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="todayProduction">Today's Production</Label>
                <Input
                  id="todayProduction"
                  type="number"
                  min="0"
                  value={todayProduction}
                  onChange={(e) => setTodayProduction(e.target.value)}
                  required
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalCompleted">Total Completed</Label>
                <Input
                  id="totalCompleted"
                  type="number"
                  min="0"
                  value={totalCompleted}
                  onChange={(e) => setTotalCompleted(e.target.value)}
                  required
                  className="glass-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dispatched">Dispatched</Label>
                <Input
                  id="dispatched"
                  type="number"
                  min="0"
                  value={dispatched}
                  onChange={(e) => setDispatched(e.target.value)}
                  required
                  className="glass-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inHand">In Hand (Auto-calculated)</Label>
              <Input
                id="inHand"
                type="number"
                value={inHand}
                readOnly
                className="glass-input bg-accent/20 font-semibold"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleBatchSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="batch-date">Date</Label>
              <Input
                id="batch-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="glass-input"
              />
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              <h3 className="font-semibold text-lg">Operations Data</h3>
              {OPERATIONS.map((operation) => (
                <div key={operation} className="p-4 glass-card rounded-lg space-y-3">
                  <h4 className="font-medium text-primary">{operation}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Today</Label>
                      <Input
                        type="number"
                        min="0"
                        value={batchData[operation]?.today || ''}
                        onChange={(e) => updateBatchData(operation, 'today', e.target.value)}
                        className="glass-input h-9"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Total</Label>
                      <Input
                        type="number"
                        min="0"
                        value={batchData[operation]?.total || ''}
                        onChange={(e) => updateBatchData(operation, 'total', e.target.value)}
                        className="glass-input h-9"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Dispatch</Label>
                      <Input
                        type="number"
                        min="0"
                        value={batchData[operation]?.dispatch || ''}
                        onChange={(e) => updateBatchData(operation, 'dispatch', e.target.value)}
                        className="glass-input h-9"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">In Hand</Label>
                      <Input
                        type="number"
                        value={
                          batchData[operation]?.total && batchData[operation]?.dispatch
                            ? Math.max(0, Number(batchData[operation].total) - Number(batchData[operation].dispatch))
                            : 0
                        }
                        readOnly
                        className="glass-input h-9 bg-accent/20 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 glass-card rounded-lg space-y-4">
              <h3 className="font-semibold text-lg">Master Order Status (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalManufactured">Total Manufactured</Label>
                  <Input
                    id="totalManufactured"
                    type="number"
                    min="0"
                    value={masterOrderData.totalManufactured}
                    onChange={(e) => setMasterOrderData(prev => ({ ...prev, totalManufactured: e.target.value }))}
                    className="glass-input"
                    placeholder="Leave empty to skip"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalDispatched">Total Dispatched</Label>
                  <Input
                    id="totalDispatched"
                    type="number"
                    min="0"
                    value={masterOrderData.totalDispatched}
                    onChange={(e) => setMasterOrderData(prev => ({ ...prev, totalDispatched: e.target.value }))}
                    className="glass-input"
                    placeholder="Leave empty to skip"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit All Operations
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
