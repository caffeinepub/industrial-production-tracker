import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useSubmitOrUpdateDailyReport, useSubmitDailyReportBatch, useUpdateMasterOrderStatus, useContainerTypes, useContainerSizes } from '../hooks/useQueries';
import { Loader2, Save, Package, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface OperationData {
  operationName: string;
  todayProduction: string;
  totalCompleted: string;
  dispatched: string;
  inHand: string;
}

export default function DailyProductionReportForm() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [containerTypeId, setContainerTypeId] = useState<string>('');
  const [containerSizeId, setContainerSizeId] = useState<string>('');
  const [selectedOperation, setSelectedOperation] = useState('');
  const [todayProduction, setTodayProduction] = useState('');
  const [totalCompleted, setTotalCompleted] = useState('');
  const [dispatched, setDispatched] = useState('');
  const [inHand, setInHand] = useState('');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchData, setBatchData] = useState<OperationData[]>([]);
  const [updateMasterOrder, setUpdateMasterOrder] = useState(false);
  const [masterOrderManufactured, setMasterOrderManufactured] = useState('');
  const [masterOrderDispatched, setMasterOrderDispatched] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ containerType?: string; containerSize?: string }>({});

  const submitMutation = useSubmitOrUpdateDailyReport();
  const batchMutation = useSubmitDailyReportBatch();
  const updateMasterOrderMutation = useUpdateMasterOrderStatus();
  const { data: containerTypes, isLoading: typesLoading, isError: typesError } = useContainerTypes();
  const { data: containerSizes, isLoading: sizesLoading, isError: sizesError } = useContainerSizes();

  useEffect(() => {
    if (isBatchMode) {
      const initialBatchData = OPERATIONS.map((op) => ({
        operationName: op,
        todayProduction: '0',
        totalCompleted: '0',
        dispatched: '0',
        inHand: '0',
      }));
      setBatchData(initialBatchData);
    }
  }, [isBatchMode]);

  useEffect(() => {
    const today = Number(todayProduction) || 0;
    const completed = Number(totalCompleted) || 0;
    const dispatchedVal = Number(dispatched) || 0;
    const calculatedInHand = Math.max(0, completed - dispatchedVal);
    setInHand(calculatedInHand.toString());
  }, [todayProduction, totalCompleted, dispatched]);

  const handleBatchInputChange = (index: number, field: keyof OperationData, value: string) => {
    const updatedBatch = [...batchData];
    updatedBatch[index] = { ...updatedBatch[index], [field]: value };

    if (field === 'totalCompleted' || field === 'dispatched') {
      const completed = Number(updatedBatch[index].totalCompleted) || 0;
      const dispatchedVal = Number(updatedBatch[index].dispatched) || 0;
      updatedBatch[index].inHand = Math.max(0, completed - dispatchedVal).toString();
    }

    setBatchData(updatedBatch);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    // Validate container type and size
    const errors: { containerType?: string; containerSize?: string } = {};
    
    if (!containerTypeId) {
      errors.containerType = 'Please select a container type';
    }

    if (!containerSizeId) {
      errors.containerSize = 'Please select a container size';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (isBatchMode) {
      const operations = batchData.map((op) => ({
        date,
        operationName: op.operationName,
        todayProduction: BigInt(op.todayProduction || 0),
        totalCompleted: BigInt(op.totalCompleted || 0),
        dispatched: BigInt(op.dispatched || 0),
        inHand: BigInt(op.inHand || 0),
      }));

      await batchMutation.mutateAsync({ date, operations });

      if (updateMasterOrder) {
        await updateMasterOrderMutation.mutateAsync({
          totalManufactured: BigInt(masterOrderManufactured || 0),
          totalDispatched: BigInt(masterOrderDispatched || 0),
        });
      }

      const initialBatchData = OPERATIONS.map((op) => ({
        operationName: op,
        todayProduction: '0',
        totalCompleted: '0',
        dispatched: '0',
        inHand: '0',
      }));
      setBatchData(initialBatchData);
      setUpdateMasterOrder(false);
      setMasterOrderManufactured('');
      setMasterOrderDispatched('');
    } else {
      if (!selectedOperation) {
        alert('Please select an operation');
        return;
      }

      await submitMutation.mutateAsync({
        date,
        operationName: selectedOperation,
        containerTypeId: BigInt(containerTypeId),
        containerSizeId: BigInt(containerSizeId),
        todayProduction: BigInt(todayProduction || 0),
        totalCompleted: BigInt(totalCompleted || 0),
        dispatched: BigInt(dispatched || 0),
        inHand: BigInt(inHand || 0),
      });

      setSelectedOperation('');
      setTodayProduction('');
      setTotalCompleted('');
      setDispatched('');
      setInHand('');
    }
  };

  const isLoading = typesLoading || sizesLoading;
  const isSubmitting = submitMutation.isPending || batchMutation.isPending || updateMasterOrderMutation.isPending;
  const hasDataError = typesError || sizesError;

  if (isLoading) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (hasDataError) {
    return (
      <div className="glass-card metallic-border rounded-lg p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load container types and sizes. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasContainerTypes = containerTypes && containerTypes.length > 0;
  const hasContainerSizes = containerSizes && containerSizes.length > 0;

  return (
    <div className="glass-card metallic-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Daily Production Report</h2>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="batch-mode" className="text-sm font-medium">
            Batch Mode
          </Label>
          <Switch id="batch-mode" checked={isBatchMode} onCheckedChange={setIsBatchMode} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="glass-card metallic-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="containerType">
              Container Type <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={containerTypeId} 
              onValueChange={(value) => {
                setContainerTypeId(value);
                setValidationErrors(prev => ({ ...prev, containerType: undefined }));
              }} 
              required
            >
              <SelectTrigger 
                id="containerType" 
                className={`glass-card metallic-border ${validationErrors.containerType ? 'border-destructive' : ''}`}
              >
                <SelectValue placeholder="Select container type" />
              </SelectTrigger>
              <SelectContent className="glass-card metallic-border">
                {!hasContainerTypes ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No container types available
                  </div>
                ) : (
                  containerTypes.map((type) => (
                    <SelectItem key={type.id.toString()} value={type.id.toString()}>
                      {type.container_type_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {validationErrors.containerType && (
              <p className="text-sm text-destructive">{validationErrors.containerType}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="containerSize">
              Container Size <span className="text-destructive">*</span>
            </Label>
            <Select 
              value={containerSizeId} 
              onValueChange={(value) => {
                setContainerSizeId(value);
                setValidationErrors(prev => ({ ...prev, containerSize: undefined }));
              }} 
              required
            >
              <SelectTrigger 
                id="containerSize" 
                className={`glass-card metallic-border ${validationErrors.containerSize ? 'border-destructive' : ''}`}
              >
                <SelectValue placeholder="Select container size" />
              </SelectTrigger>
              <SelectContent className="glass-card metallic-border">
                {!hasContainerSizes ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No container sizes available
                  </div>
                ) : (
                  containerSizes.map((size) => (
                    <SelectItem key={size.id.toString()} value={size.id.toString()}>
                      {size.container_size}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {validationErrors.containerSize && (
              <p className="text-sm text-destructive">{validationErrors.containerSize}</p>
            )}
          </div>
        </div>

        {!isBatchMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="operation">Operation</Label>
              <Select value={selectedOperation} onValueChange={setSelectedOperation} required>
                <SelectTrigger id="operation" className="glass-card metallic-border">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent className="glass-card metallic-border">
                  {OPERATIONS.map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="todayProduction">Today's Production</Label>
              <Input
                id="todayProduction"
                type="number"
                min="0"
                value={todayProduction}
                onChange={(e) => setTodayProduction(e.target.value)}
                required
                className="glass-card metallic-border"
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
                className="glass-card metallic-border"
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
                className="glass-card metallic-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inHand">In Hand (Auto-calculated)</Label>
              <Input
                id="inHand"
                type="number"
                value={inHand}
                readOnly
                className="glass-card metallic-border bg-muted/50"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 font-semibold">Operation</th>
                    <th className="text-left p-2 font-semibold">Today's Production</th>
                    <th className="text-left p-2 font-semibold">Total Completed</th>
                    <th className="text-left p-2 font-semibold">Dispatched</th>
                    <th className="text-left p-2 font-semibold">In Hand</th>
                  </tr>
                </thead>
                <tbody>
                  {batchData.map((op, index) => (
                    <tr key={op.operationName} className="border-b border-border/50">
                      <td className="p-2 font-medium">{op.operationName}</td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          value={op.todayProduction}
                          onChange={(e) => handleBatchInputChange(index, 'todayProduction', e.target.value)}
                          className="glass-card metallic-border h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          value={op.totalCompleted}
                          onChange={(e) => handleBatchInputChange(index, 'totalCompleted', e.target.value)}
                          className="glass-card metallic-border h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          value={op.dispatched}
                          onChange={(e) => handleBatchInputChange(index, 'dispatched', e.target.value)}
                          className="glass-card metallic-border h-8 text-sm"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={op.inHand}
                          readOnly
                          className="glass-card metallic-border h-8 text-sm bg-muted/50"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="glass-card metallic-border rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="update-master-order"
                  checked={updateMasterOrder}
                  onCheckedChange={setUpdateMasterOrder}
                />
                <Label htmlFor="update-master-order" className="text-sm font-medium">
                  Update Master Order Status
                </Label>
              </div>

              {updateMasterOrder && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="masterOrderManufactured">Total Manufactured</Label>
                    <Input
                      id="masterOrderManufactured"
                      type="number"
                      min="0"
                      value={masterOrderManufactured}
                      onChange={(e) => setMasterOrderManufactured(e.target.value)}
                      required={updateMasterOrder}
                      className="glass-card metallic-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="masterOrderDispatched">Total Dispatched</Label>
                    <Input
                      id="masterOrderDispatched"
                      type="number"
                      min="0"
                      value={masterOrderDispatched}
                      onChange={(e) => setMasterOrderDispatched(e.target.value)}
                      required={updateMasterOrder}
                      className="glass-card metallic-border"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || !containerTypeId || !containerSizeId || !hasContainerTypes || !hasContainerSizes}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isBatchMode ? 'Submit All Operations' : 'Submit Report'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
