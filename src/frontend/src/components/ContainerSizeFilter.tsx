import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useContainerSizes } from '../hooks/useQueries';

interface ContainerSizeFilterProps {
  value: bigint | null;
  onChange: (value: bigint | null) => void;
}

export default function ContainerSizeFilter({ value, onChange }: ContainerSizeFilterProps) {
  const { data: containerSizes, isLoading, isError } = useContainerSizes();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (isError) {
    return (
      <div className="glass-card metallic-border rounded-lg p-3 text-sm text-destructive">
        Failed to load container sizes
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Container Size</label>
      <Select
        value={value?.toString() ?? 'all'}
        onValueChange={(val) => onChange(val === 'all' ? null : BigInt(val))}
      >
        <SelectTrigger className="glass-card metallic-border h-11 text-sm md:text-base">
          <SelectValue placeholder="All Sizes" />
        </SelectTrigger>
        <SelectContent className="glass-card metallic-border">
          <SelectItem value="all" className="text-sm md:text-base">
            All Sizes
          </SelectItem>
          {containerSizes?.map((size) => (
            <SelectItem key={size.id.toString()} value={size.id.toString()} className="text-sm md:text-base">
              {size.container_size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
