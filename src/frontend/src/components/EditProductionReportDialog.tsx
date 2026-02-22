import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateProductionHistoryEntry, useContainerTypes, useContainerSizes } from '../hooks/useQueries';
import { Loader2, Save } from 'lucide-react';
import type { DailyProductionReport } from '../backend';

interface EditProductionReportDialogProps {
  report: DailyProductionReport;
  open: boolean;
  onClose: () => void;
}

export default function EditProductionReportDialog({
  report,
  open,
  onClose,
}: EditProductionReportDialogProps) {
  const [todayProduction, setTodayProduction] = useState(Number(report.todayProduction).toString());
  const [totalCompleted, setTotalCompleted] = useState(Number(report.totalCompleted).toString());
  const [dispatched, setDispatched] = useState(Number(report.dispatched).toString());
  const [inHand, setInHand] = useState(Number(report.inHand).toString());

  const updateMutation = useUpdateProductionHistoryEntry();
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

  useEffect(() => {
    const completed = Number(totalCompleted) || 0;
    const dispatchedVal = Number(dispatched) || 0;
    const calculatedInHand = Math.max(0, completed - dispatchedVal);
    setInHand(calculatedInHand.toString());
  }, [totalCompleted, dispatched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateMutation.mutateAsync({
      reportId: report.id,
      todayProduction: BigInt(todayProduction || 0),
      totalCompleted: BigInt(totalCompleted || 0),
      dispatched: BigInt(dispatched || 0),
      inHand: BigInt(inHand || 0),
    });

    onClose();
  };

  const containerTypeName = typeMap.get(report.container_type_id) || `Type ${report.container_type_id}`;
  const containerSizeName = sizeMap.get(report.container_size_id) || `Size ${report.container_size_id}`;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card metallic-border sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Production Report</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Input value={report.date} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Operation</Label>
              <Input value={report.operationName} disabled className="bg-muted/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Container Type</Label>
              <Input value={containerTypeName} disabled className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label>Container Size</Label>
              <Input value={containerSizeName} disabled className="bg-muted/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-todayProduction">Today's Production</Label>
            <Input
              id="edit-todayProduction"
              type="number"
              min="0"
              value={todayProduction}
              onChange={(e) => setTodayProduction(e.target.value)}
              required
              className="glass-card metallic-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-totalCompleted">Total Completed</Label>
            <Input
              id="edit-totalCompleted"
              type="number"
              min="0"
              value={totalCompleted}
              onChange={(e) => setTotalCompleted(e.target.value)}
              required
              className="glass-card metallic-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-dispatched">Dispatched</Label>
            <Input
              id="edit-dispatched"
              type="number"
              min="0"
              value={dispatched}
              onChange={(e) => setDispatched(e.target.value)}
              required
              className="glass-card metallic-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-inHand">In Hand (Auto-calculated)</Label>
            <Input
              id="edit-inHand"
              type="number"
              value={inHand}
              readOnly
              className="glass-card metallic-border bg-muted/50"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
