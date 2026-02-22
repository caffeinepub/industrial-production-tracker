import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useContainerTypes } from '../hooks/useQueries';

interface ContainerTypeFilterProps {
  value: bigint | null;
  onChange: (value: bigint | null) => void;
}

export default function ContainerTypeFilter({ value, onChange }: ContainerTypeFilterProps) {
  const { data: containerTypes, isLoading, isError } = useContainerTypes();

  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  if (isError) {
    return (
      <div className="glass-card metallic-border rounded-lg p-3 text-sm text-destructive">
        Failed to load container types
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Container Type</label>
      <Select
        value={value?.toString() ?? 'all'}
        onValueChange={(val) => onChange(val === 'all' ? null : BigInt(val))}
      >
        <SelectTrigger className="glass-card metallic-border h-11 text-sm md:text-base">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent className="glass-card metallic-border">
          <SelectItem value="all" className="text-sm md:text-base">
            All Types
          </SelectItem>
          {containerTypes?.map((type) => (
            <SelectItem key={type.id.toString()} value={type.id.toString()} className="text-sm md:text-base">
              {type.container_type_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
