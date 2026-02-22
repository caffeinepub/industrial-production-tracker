import { useState, useEffect } from 'react';
import { useSubmitOrUpdateDailyReport } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [date, setDate] = useState<Date>();
  const [operationName, setOperationName] = useState('');
  const [todayProduction, setTodayProduction] = useState('');
  const [totalCompleted, setTotalCompleted] = useState('');
  const [despatched, setDespatched] = useState('');
  const [inHand, setInHand] = useState(0);

  const submitOrUpdateReport = useSubmitOrUpdateDailyReport();

  useEffect(() => {
    const total = parseInt(totalCompleted) || 0;
    const desp = parseInt(despatched) || 0;
    const calculated = total - desp;
    setInHand(calculated);
  }, [totalCompleted, despatched]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !operationName || !todayProduction || !totalCompleted || !despatched) {
      return;
    }

    const formattedDate = format(date, 'yyyy-MM-dd');

    submitOrUpdateReport.mutate(
      {
        date: formattedDate,
        operationName,
        todayProduction: BigInt(todayProduction),
        totalCompleted: BigInt(totalCompleted),
        despatched: BigInt(despatched),
        inHand: BigInt(inHand),
      },
      {
        onSuccess: () => {
          setDate(undefined);
          setOperationName('');
          setTodayProduction('');
          setTotalCompleted('');
          setDespatched('');
          setInHand(0);
        },
      }
    );
  };

  return (
    <div className="glass-card metallic-border rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Admin Production Update Panel</h2>
        <p className="text-sm text-muted-foreground mt-1">Update daily production metrics for manufacturing operations</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2 relative">
            <Label htmlFor="date" className={cn("transition-all duration-200", date && "text-primary text-xs")}>
              Date *
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal transition-all duration-300 focus-within:ring-2 focus-within:ring-primary',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-card" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="operationName" className={cn("transition-all duration-200", operationName && "text-primary text-xs")}>
              Operation Name *
            </Label>
            <Select value={operationName} onValueChange={setOperationName}>
              <SelectTrigger id="operationName" className="transition-all duration-300 focus:ring-2 focus:ring-primary">
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent className="glass-card">
                {OPERATIONS.map((op) => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="todayProduction" className={cn("transition-all duration-200", todayProduction && "text-primary text-xs")}>
              Today's Production *
            </Label>
            <Input
              id="todayProduction"
              type="number"
              min="0"
              value={todayProduction}
              onChange={(e) => setTodayProduction(e.target.value)}
              placeholder="Enter today's production"
              className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalCompleted" className={cn("transition-all duration-200", totalCompleted && "text-primary text-xs")}>
              Total Completed *
            </Label>
            <Input
              id="totalCompleted"
              type="number"
              min="0"
              value={totalCompleted}
              onChange={(e) => setTotalCompleted(e.target.value)}
              placeholder="Enter total completed"
              className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="despatched" className={cn("transition-all duration-200", despatched && "text-primary text-xs")}>
              Despatched Quantity *
            </Label>
            <Input
              id="despatched"
              type="number"
              min="0"
              value={despatched}
              onChange={(e) => setDespatched(e.target.value)}
              placeholder="Enter despatched quantity"
              className="transition-all duration-300 focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inHand">In Hand (Auto-calculated)</Label>
            <div className="relative">
              <Input
                id="inHand"
                type="number"
                value={inHand}
                readOnly
                className="bg-accent/20 transition-all duration-300"
              />
              <div className={cn(
                "absolute inset-0 pointer-events-none rounded-md transition-all duration-300",
                inHand > 0 && "ring-2 ring-success/50"
              )} />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitOrUpdateReport.isPending}
          className="w-full md:w-auto btn-glow ripple"
          size="lg"
        >
          {submitOrUpdateReport.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Production Report'
          )}
        </Button>
      </form>
    </div>
  );
}
