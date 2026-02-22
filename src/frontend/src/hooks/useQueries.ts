import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ProductionEntry, DispatchEntry, ContainerType, ContainerStatus, Shift, DailyProductionReport, MonthlyProductionTotals } from '../backend';
import { toast } from 'sonner';

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useCreateProductionEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      containerType: ContainerType;
      shiftDetail: Shift;
      status: ContainerStatus;
      totalQty: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createProductionEntry(
        data.containerType,
        data.shiftDetail,
        data.status,
        data.totalQty
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productionEntries'] });
      queryClient.invalidateQueries({ queryKey: ['productionStats'] });
      queryClient.invalidateQueries({ queryKey: ['containerStatuses'] });
      toast.success('Production entry created successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Admin role required')) {
        toast.error('Access denied: Only admins can create production entries');
      } else {
        toast.error(`Failed to create entry: ${errorMessage}`);
      }
    },
  });
}

export function useGetProductionStats() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['productionStats'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyProductionByStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useGetContainerStatuses() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['containerStatuses'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getContainerStatuses();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetFilteredProductionEntries(
  containerType: ContainerType | null,
  status: ContainerStatus | null
) {
  const { actor, isFetching } = useActor();

  return useQuery<ProductionEntry[]>({
    queryKey: ['productionEntries', containerType, status],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFilteredProductionEntries(containerType, status);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateDispatchEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      containerType: ContainerType;
      quantity: bigint;
      dispatchDate: bigint;
      destination: string;
      deliveryStatus: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDispatchEntry(
        data.containerType,
        data.quantity,
        data.dispatchDate,
        data.destination,
        data.deliveryStatus
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatchEntries'] });
      toast.success('Dispatch entry created successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Admin role required')) {
        toast.error('Access denied: Only admins can create dispatch entries');
      } else {
        toast.error(`Failed to create dispatch: ${errorMessage}`);
      }
    },
  });
}

export function useGetDispatchEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<DispatchEntry[]>({
    queryKey: ['dispatchEntries'],
    queryFn: async () => {
      if (!actor) return [];
      // Using 0 for start and a large number for end to get all entries
      return actor.getDispatchEntriesByDate(BigInt(0), BigInt(Date.now() * 1000000));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateDispatchStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { dispatchId: bigint; newStatus: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDispatchStatus(data.dispatchId, data.newStatus);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatchEntries'] });
      toast.success('Dispatch status updated successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Admin role required')) {
        toast.error('Access denied: Only admins can update dispatch status');
      } else {
        toast.error(`Failed to update status: ${errorMessage}`);
      }
    },
  });
}

export function useGetOperationWorkload() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['operationWorkload'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOperationWorkloadSummary();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetDailyProductionReportsByDate(date: string) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyProductionReport[]>({
    queryKey: ['dailyProductionReports', date],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyProductionReportsByDate(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useGetDailyProductionReportsByOperation(operationName: string) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyProductionReport[]>({
    queryKey: ['dailyProductionReports', 'operation', operationName],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyProductionReportsByOperation(operationName);
    },
    enabled: !!actor && !isFetching && !!operationName,
  });
}

export function useProductionHistoryByDateRange(startDate: string, endDate: string) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyProductionReport[]>({
    queryKey: ['productionHistoryByDateRange', startDate, endDate],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyProductionReportsByDateRange(startDate, endDate);
    },
    enabled: !!actor && !isFetching && !!startDate && !!endDate,
  });
}

export function useCreateDailyProductionReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      date: string;
      operationName: string;
      todayProduction: bigint;
      totalCompleted: bigint;
      despatched: bigint;
      inHand: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDailyProductionReport(
        data.date,
        data.operationName,
        data.todayProduction,
        data.totalCompleted,
        data.despatched,
        data.inHand
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyProductionReports'] });
      toast.success('Production report created successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Admin role required')) {
        toast.error('Access denied: Only admins can create production reports');
      } else {
        toast.error(`Failed to create report: ${errorMessage}`);
      }
    },
  });
}

export function useUpdateDailyProductionReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      todayProduction: bigint;
      totalCompleted: bigint;
      despatched: bigint;
      inHand: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDailyProductionReport(
        data.id,
        data.todayProduction,
        data.totalCompleted,
        data.despatched,
        data.inHand
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyProductionReports'] });
      toast.success('Production report updated successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Admin role required')) {
        toast.error('Access denied: Only admins can update production reports');
      } else {
        toast.error(`Failed to update report: ${errorMessage}`);
      }
    },
  });
}

export function useUpdateProductionHistoryEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      reportId: bigint;
      todayProduction: bigint;
      totalCompleted: bigint;
      despatched: bigint;
      inHand: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDailyProductionReportById(
        data.reportId,
        data.todayProduction,
        data.totalCompleted,
        data.despatched,
        data.inHand
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productionHistoryByDateRange'] });
      queryClient.invalidateQueries({ queryKey: ['dailyProductionReports'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyProductionSummary'] });
      queryClient.invalidateQueries({ queryKey: ['productionTrendData'] });
      queryClient.invalidateQueries({ queryKey: ['operationComparisonData'] });
      toast.success('Production report updated successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Admin role required')) {
        toast.error('Access denied: Only admins can update production reports');
      } else {
        toast.error(`Failed to update report: ${errorMessage}`);
      }
    },
  });
}

export function useSubmitOrUpdateDailyReport() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      date: string;
      operationName: string;
      todayProduction: bigint;
      totalCompleted: bigint;
      despatched: bigint;
      inHand: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitOrUpdateDailyReport(
        data.date,
        data.operationName,
        data.todayProduction,
        data.totalCompleted,
        data.despatched,
        data.inHand
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyProductionReports'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyProductionSummary'] });
      queryClient.invalidateQueries({ queryKey: ['productionTrendData'] });
      queryClient.invalidateQueries({ queryKey: ['operationComparisonData'] });
      queryClient.invalidateQueries({ queryKey: ['productionHistoryByDateRange'] });
      toast.success('Production report saved successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Admin role required')) {
        toast.error('Access denied: Only admins can submit production reports');
      } else {
        toast.error(`Failed to save report: ${errorMessage}`);
      }
    },
  });
}

export function useMonthlyProductionSummary() {
  const { actor, isFetching } = useActor();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  const currentDay = now.getDate();

  return useQuery({
    queryKey: ['monthlyProductionSummary', year, month],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      const data: MonthlyProductionTotals = await actor.getMonthlyProductionTotals(
        BigInt(year),
        BigInt(month)
      );

      const totalProduced = Number(data.totalContainers);
      const monthlyTarget = 100;
      const remainingToTarget = Math.max(0, monthlyTarget - totalProduced);
      const completionPercentage = Math.min(100, (totalProduced / monthlyTarget) * 100);
      const dailyAverage = currentDay > 0 ? totalProduced / currentDay : 0;

      return {
        totalProduced,
        remainingToTarget,
        completionPercentage,
        dailyAverage,
        monthlyTarget,
      };
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useProductionTrendData() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['productionTrendData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Fetch all production reports across all operations
      const allOperations = [
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

      const allReports: DailyProductionReport[] = [];
      for (const operation of allOperations) {
        const reports = await actor.getDailyProductionReportsByOperation(operation);
        allReports.push(...reports);
      }

      // Aggregate by date
      const dateMap = new Map<string, number>();
      allReports.forEach((report) => {
        if (report.date && report.date !== '') {
          const currentTotal = dateMap.get(report.date) || 0;
          dateMap.set(report.date, currentTotal + Number(report.todayProduction));
        }
      });

      // Convert to array and sort by date
      const trendData = Array.from(dateMap.entries())
        .map(([date, totalProduction]) => ({
          date,
          totalProduction,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return trendData;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useOperationComparisonData() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['operationComparisonData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      const allOperations = [
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

      const comparisonData: Array<{ operation: string; totalProduction: number }> = [];

      for (const operation of allOperations) {
        const reports = await actor.getDailyProductionReportsByOperation(operation);
        
        // Sum up total production for this operation
        const totalProduction = reports.reduce(
          (sum, report) => sum + Number(report.todayProduction),
          0
        );

        comparisonData.push({
          operation,
          totalProduction,
        });
      }

      return comparisonData;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}
