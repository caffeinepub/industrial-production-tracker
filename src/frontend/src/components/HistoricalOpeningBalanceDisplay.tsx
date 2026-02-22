import { Lock, Calendar, Factory, Truck, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { HistoricalOpeningBalance } from '../backend';

interface HistoricalOpeningBalanceDisplayProps {
  openingBalance: HistoricalOpeningBalance;
}

export default function HistoricalOpeningBalanceDisplay({ openingBalance }: HistoricalOpeningBalanceDisplayProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="glass-card metallic-border p-8 rounded-lg space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Historical Opening Balance
          </h2>
          <p className="text-muted-foreground mt-2">
            Production baseline from before system go-live
          </p>
        </div>
        <Badge className="bg-warning/20 text-warning border-warning/30 px-4 py-2">
          <Lock className="w-4 h-4 mr-2" />
          Locked
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Manufacturing Start Date</span>
          </div>
          <p className="text-lg font-semibold">{formatDate(openingBalance.manufacturingStartDate)}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">System Go-Live Date</span>
          </div>
          <p className="text-lg font-semibold">{formatDate(openingBalance.systemGoLiveDate)}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Opening Balance Date</span>
          </div>
          <p className="text-lg font-semibold">{formatDate(openingBalance.openingDate)}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Factory className="w-4 h-4" />
            <span className="text-sm font-medium">Manufactured Before System</span>
          </div>
          <p className="text-2xl font-bold text-primary">
            {Number(openingBalance.manufacturedBeforeSystem).toLocaleString()}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="w-4 h-4" />
            <span className="text-sm font-medium">Dispatched Before System</span>
          </div>
          <p className="text-2xl font-bold text-success">
            {Number(openingBalance.dispatchedBeforeSystem).toLocaleString()}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-sm font-medium">Entry Type</span>
          </div>
          <p className="text-sm font-medium text-foreground">{openingBalance.entryType}</p>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Lock className="w-4 h-4" />
          This entry is locked and cannot be modified. It serves as the baseline for all production calculations.
        </p>
      </div>
    </div>
  );
}
