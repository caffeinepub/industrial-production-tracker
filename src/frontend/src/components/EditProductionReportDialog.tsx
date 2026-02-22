import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProductionHistoryEntry } from '../hooks/useQueries';
import { Loader2 } from 'lucide-react';
import type { DailyProductionReport } from '../backend';

interface EditProductionReportDialogProps {
  open: boolean;
  entry: DailyProductionReport;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditProductionReportDialog({
  open,
  entry,
  onSuccess,
  onCancel,
}: EditProductionReportDialogProps) {
  const [todayProduction, setTodayProduction] = useState('0');
  const [totalCompleted, setTotalCompleted] = useState('0');
  const [dispatched, setDispatched] = useState('0');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateMutation = useUpdateProductionHistoryEntry();

  // Pre-populate form with entry values
  useEffect(() => {
    if (entry) {
      setTodayProduction(entry.todayProduction.toString());
      setTotalCompleted(entry.totalCompleted.toString());
      setDispatched(entry.dispatched.toString());
      setErrors({});
    }
  }, [entry]);

  // Calculate in-hand value
  const inHand = Math.max(0, Number(totalCompleted) - Number(dispatched));

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};

    const todayProd = Number(todayProduction);
    const totalComp = Number(totalCompleted);
    const disp = Number(dispatched);

    if (isNaN(todayProd) || todayProd < 0) {
      newErrors.todayProduction = "Must be a non-negative number";
    }

    if (isNaN(totalComp) || totalComp < 0) {
      newErrors.totalCompleted = "Must be a non-negative number";
    }

    if (isNaN(disp) || disp < 0) {
      newErrors.dispatched = "Must be a non-negative number";
    }

    if (totalComp < disp) {
      newErrors.dispatched = "Cannot exceed total completed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        reportId: entry.id,
        todayProduction: BigInt(todayProduction),
        totalCompleted: BigInt(totalCompleted),
        dispatched: BigInt(dispatched),
        inHand: BigInt(inHand),
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update production report:', error);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  const isFormValid = Object.keys(errors).length === 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Production Report</DialogTitle>
          <DialogDescription>
            Update production metrics for this entry. All fields must be non-negative numbers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Read-only fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Date</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
                {entry.date || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Operation</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
                {entry.operationName}
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-2">
            <Label htmlFor="todayProduction">
              Today's Production <span className="text-destructive">*</span>
            </Label>
            <Input
              id="todayProduction"
              type="number"
              min="0"
              value={todayProduction}
              onChange={(e) => {
                setTodayProduction(e.target.value);
                setErrors((prev) => ({ ...prev, todayProduction: '' }));
              }}
              onBlur={validate}
              className={errors.todayProduction ? 'border-destructive' : ''}
            />
            {errors.todayProduction && (
              <p className="text-xs text-destructive">{errors.todayProduction}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalCompleted">
              Total Completed <span className="text-destructive">*</span>
            </Label>
            <Input
              id="totalCompleted"
              type="number"
              min="0"
              value={totalCompleted}
              onChange={(e) => {
                setTotalCompleted(e.target.value);
                setErrors((prev) => ({ ...prev, totalCompleted: '' }));
              }}
              onBlur={validate}
              className={errors.totalCompleted ? 'border-destructive' : ''}
            />
            {errors.totalCompleted && (
              <p className="text-xs text-destructive">{errors.totalCompleted}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispatched">
              Dispatched <span className="text-destructive">*</span>
            </Label>
            <Input
              id="dispatched"
              type="number"
              min="0"
              value={dispatched}
              onChange={(e) => {
                setDispatched(e.target.value);
                setErrors((prev) => ({ ...prev, dispatched: '' }));
              }}
              onBlur={validate}
              className={errors.dispatched ? 'border-destructive' : ''}
            />
            {errors.dispatched && (
              <p className="text-xs text-destructive">{errors.dispatched}</p>
            )}
          </div>

          {/* Auto-calculated field */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">In Hand (Auto-calculated)</Label>
            <div className="px-3 py-2 bg-primary/5 border border-primary/20 rounded-md text-sm font-semibold text-primary">
              {inHand}
            </div>
            <p className="text-xs text-muted-foreground">
              Calculated as: Total Completed - Dispatched
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={updateMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFormValid || updateMutation.isPending}
          >
            {updateMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
