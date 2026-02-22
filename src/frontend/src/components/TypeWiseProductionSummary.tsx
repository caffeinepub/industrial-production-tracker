import { useProductionSummaryByType, useContainerTypes } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TypeWiseProductionSummaryProps {
  startDate: string;
  endDate: string;
  containerSizeId?: bigint | null;
}

export default function TypeWiseProductionSummary({
  startDate,
  endDate,
  containerSizeId,
}: TypeWiseProductionSummaryProps) {
  const { data: summaryData, isLoading: summaryLoading } = useProductionSummaryByType(
    startDate,
    endDate,
    containerSizeId
  );
  const { data: containerTypes, isLoading: typesLoading } = useContainerTypes();

  const isLoading = summaryLoading || typesLoading;

  // Create a map for quick type lookup
  const typeMap = new Map(containerTypes?.map((type) => [type.id, type.container_type_name]));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (!summaryData || summaryData.length === 0) {
    return (
      <div className="glass-card metallic-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No production data available for the selected filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {summaryData.map(([typeId, todayProd, totalComp, dispatched, inHand]) => {
        const typeName = typeMap.get(typeId) || `Type ${typeId}`;
        
        return (
          <TypeSummaryCard
            key={typeId.toString()}
            typeName={typeName}
            todayProduction={Number(todayProd)}
            totalCompleted={Number(totalComp)}
            dispatched={Number(dispatched)}
            inHand={Number(inHand)}
          />
        );
      })}
    </div>
  );
}

interface TypeSummaryCardProps {
  typeName: string;
  todayProduction: number;
  totalCompleted: number;
  dispatched: number;
  inHand: number;
}

function TypeSummaryCard({
  typeName,
  todayProduction,
  totalCompleted,
  dispatched,
  inHand,
}: TypeSummaryCardProps) {
  const [displayTodayProd, setDisplayTodayProd] = useState(0);
  const [displayTotalComp, setDisplayTotalComp] = useState(0);
  const [displayDispatched, setDisplayDispatched] = useState(0);
  const [displayInHand, setDisplayInHand] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setDisplayTodayProd(Math.floor(todayProduction * progress));
      setDisplayTotalComp(Math.floor(totalCompleted * progress));
      setDisplayDispatched(Math.floor(dispatched * progress));
      setDisplayInHand(Math.floor(inHand * progress));

      if (currentStep >= steps) {
        setDisplayTodayProd(todayProduction);
        setDisplayTotalComp(totalCompleted);
        setDisplayDispatched(dispatched);
        setDisplayInHand(inHand);
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [todayProduction, totalCompleted, dispatched, inHand]);

  return (
    <div className="glass-card metallic-border rounded-lg p-5 hover:shadow-glow transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-full bg-primary/10">
          <Package className="h-5 w-5 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">{typeName}</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Today's Production</span>
          <span className="text-lg font-bold text-primary">{displayTodayProd}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Completed</span>
          <span className="text-lg font-bold text-foreground">{displayTotalComp}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Dispatched</span>
          <span className="text-lg font-bold text-success">{displayDispatched}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">In Hand</span>
          <span className="text-lg font-bold text-warning">{displayInHand}</span>
        </div>
      </div>
    </div>
  );
}
