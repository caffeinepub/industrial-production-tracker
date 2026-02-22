import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Filter } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onChange: (startDate: string, endDate: string) => void;
}

export default function DateRangeFilter({ startDate, endDate, onChange }: DateRangeFilterProps) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(startDate, e.target.value);
  };

  return (
    <Card className="border-primary/20 bg-card/50">
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="h-4 w-4 text-primary" />
            <span>Filter by Date Range</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="flex-1 space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                max={endDate}
                className="w-full"
              />
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-1.5 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate}
                className="w-full"
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Showing {startDate} to {endDate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
