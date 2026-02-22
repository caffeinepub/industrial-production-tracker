import { useState } from 'react';
import { useCreateHistoricalOpeningBalance, useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AlertCircle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function HistoricalOpeningBalanceForm() {
  const { data: isAdmin } = useIsCallerAdmin();
  const createMutation = useCreateHistoricalOpeningBalance();

  // Fixed values as per requirements
  const openingDate = '2026-02-20';
  const manufacturedBeforeSystem = 344;
  const dispatchedBeforeSystem = 344;
  const manufacturingStartDate = '2025-08-25';
  const systemGoLiveDate = '2026-02-22';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createMutation.mutate({
      openingDate,
      manufacturedBeforeSystem: BigInt(manufacturedBeforeSystem),
      dispatchedBeforeSystem: BigInt(dispatchedBeforeSystem),
      manufacturingStartDate,
      systemGoLiveDate,
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="glass-card metallic-border p-8 rounded-lg space-y-6">
      <div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Create Historical Opening Balance
        </h2>
        <p className="text-muted-foreground mt-2">
          Initialize the system with production data from before go-live
        </p>
      </div>

      <Alert className="border-warning/50 bg-warning/10">
        <AlertCircle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-warning">
          <strong>Warning:</strong> This entry cannot be edited after saving. Only one opening balance entry is allowed.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="manufacturingStartDate">Manufacturing Start Date</Label>
            <Input
              id="manufacturingStartDate"
              type="text"
              value={manufacturingStartDate}
              readOnly
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemGoLiveDate">System Go-Live Date</Label>
            <Input
              id="systemGoLiveDate"
              type="text"
              value={systemGoLiveDate}
              readOnly
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="openingDate">Opening Balance Date</Label>
            <Input
              id="openingDate"
              type="text"
              value={openingDate}
              readOnly
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="manufacturedBeforeSystem">Manufactured Before System</Label>
            <Input
              id="manufacturedBeforeSystem"
              type="number"
              value={manufacturedBeforeSystem}
              readOnly
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dispatchedBeforeSystem">Dispatched Before System</Label>
            <Input
              id="dispatchedBeforeSystem"
              type="number"
              value={dispatchedBeforeSystem}
              readOnly
              className="bg-muted/50 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="px-8"
          >
            {createMutation.isPending ? (
              <>
                <Lock className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Create Opening Balance
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            This action is permanent and cannot be undone
          </p>
        </div>
      </form>
    </div>
  );
}
