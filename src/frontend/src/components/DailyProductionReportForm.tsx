import { useState, useEffect } from 'react';
import { useSubmitOrUpdateDailyReport } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
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

  // Auto-calculate In Hand whenever Total Completed or Despatched changes
  useEffect(() => {
    const total = parseInt(totalCompleted) || 0;
    const desp = parseInt(despatched) || 0;
    setInHand(total - desp);
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
          // Reset form
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
    <Card>
      <CardHeader>
        <CardTitle>Admin Production Update Panel</CardTitle>
        <CardDescription>Update daily production metrics for manufacturing operations</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
              <Label htmlFor="operationName">Operation Name *</Label>
              <Select value={operationName} onValueChange={setOperationName}>
                <SelectTrigger id="operationName">
                  <SelectValue placeholder="Select operation" />
                </SelectTrigger>
                <SelectContent>
                  {OPERATIONS.map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="todayProduction">Today's Production *</Label>
              <Input
                id="todayProduction"
                type="number"
                min="0"
                value={todayProduction}
                onChange={(e) => setTodayProduction(e.target.value)}
                placeholder="Enter today's production"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalCompleted">Total Completed *</Label>
              <Input
                id="totalCompleted"
                type="number"
                min="0"
                value={totalCompleted}
                onChange={(e) => setTotalCompleted(e.target.value)}
                placeholder="Enter total completed"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="despatched">Despatched Quantity *</Label>
              <Input
                id="despatched"
                type="number"
                min="0"
                value={despatched}
                onChange={(e) => setDespatched(e.target.value)}
                placeholder="Enter despatched quantity"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="inHand">In Hand (Auto-calculated)</Label>
              <Input
                id="inHand"
                type="number"
                value={inHand}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto" disabled={submitOrUpdateReport.isPending}>
            {submitOrUpdateReport.isPending ? 'Saving...' : 'Submit / Update Report'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
