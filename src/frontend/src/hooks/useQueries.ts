import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, ProductionEntry, DispatchEntry, ContainerType, ContainerStatus, Shift, DailyProductionReport, MonthlyProductionTotals, MasterOrderStatus, HistoricalOpeningBalance, DailyReportBatchEntry, ContainerTypes, FrontendContainerSizes } from '../backend';
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

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useContainerTypes() {
  const { actor, isFetching } = useActor();

  return useQuery<ContainerTypes[]>({
    queryKey: ['containerTypes'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const types = await actor.getContainerTypes();
      return types;
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes - master data doesn't change often
    retry: 3,
  });
}

export function useContainerSizes() {
  const { actor, isFetching } = useActor();

  return useQuery<FrontendContainerSizes[]>({
    queryKey: ['containerSizes'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const sizes = await actor.getContainerSizes();
      return sizes;
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000, // 5 minutes - master data doesn't change often
    retry: 3,
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
    refetchInterval: 30000,
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

export function useGetDailyProductionReportsByDate(
  date: string,
  containerTypeId?: bigint | null,
  containerSizeId?: bigint | null
) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyProductionReport[]>({
    queryKey: ['dailyProductionReports', date, containerTypeId?.toString(), containerSizeId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const reports = await actor.getDailyProductionReportsByDate(date);
      
      // Apply client-side filtering if needed
      return reports.filter(report => {
        const typeMatches = containerTypeId ? report.container_type_id === containerTypeId : true;
        const sizeMatches = containerSizeId ? report.container_size_id === containerSizeId : true;
        return typeMatches && sizeMatches;
      });
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

export function useProductionHistoryByDateRange(
  startDate: string,
  endDate: string,
  containerTypeId?: bigint | null,
  containerSizeId?: bigint | null
) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyProductionReport[]>({
    queryKey: ['productionHistoryByDateRange', startDate, endDate, containerTypeId?.toString(), containerSizeId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyProductionReportsByDateRange(
        startDate,
        endDate,
        [containerTypeId ?? null, containerSizeId ?? null]
      );
    },
    enabled: !!actor && !isFetching && !!startDate && !!endDate,
  });
}

export function useProductionSummaryByType(
  startDate: string,
  endDate: string,
  containerSizeId?: bigint | null
) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[bigint, bigint, bigint, bigint, bigint]>>({
    queryKey: ['productionSummaryByType', startDate, endDate, containerSizeId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductionSummaryByType(
        startDate,
        endDate,
        [null, containerSizeId ?? null]
      );
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
      containerTypeId: bigint;
      containerSizeId: bigint;
      todayProduction: bigint;
      totalCompleted: bigint;
      dispatched: bigint;
      inHand: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createDailyProductionReport(
        data.date,
        data.operationName,
        data.containerTypeId,
        data.containerSizeId,
        data.todayProduction,
        data.totalCompleted,
        data.dispatched,
        data.inHand
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyProductionReports'] });
      queryClient.invalidateQueries({ queryKey: ['productionHistoryByDateRange'] });
      queryClient.invalidateQueries({ queryKey: ['productionSummaryByType'] });
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

export function useUpdateProductionHistoryEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      reportId: bigint;
      todayProduction: bigint;
      totalCompleted: bigint;
      dispatched: bigint;
      inHand: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateDailyProductionReportById(
        data.reportId,
        [null, null],
        data.todayProduction,
        data.totalCompleted,
        data.dispatched,
        data.inHand
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productionHistoryByDateRange'] });
      queryClient.invalidateQueries({ queryKey: ['dailyProductionReports'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyProductionSummary'] });
      queryClient.invalidateQueries({ queryKey: ['productionTrendData'] });
      queryClient.invalidateQueries({ queryKey: ['operationComparisonData'] });
      queryClient.invalidateQueries({ queryKey: ['productionSummaryByType'] });
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
      containerTypeId: bigint;
      containerSizeId: bigint;
      todayProduction: bigint;
      totalCompleted: bigint;
      dispatched: bigint;
      inHand: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.submitOrUpdateDailyReport(
        data.date,
        data.operationName,
        data.containerTypeId,
        data.containerSizeId,
        data.todayProduction,
        data.totalCompleted,
        data.dispatched,
        data.inHand
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyProductionReports'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyProductionSummary'] });
      queryClient.invalidateQueries({ queryKey: ['productionTrendData'] });
      queryClient.invalidateQueries({ queryKey: ['operationComparisonData'] });
      queryClient.invalidateQueries({ queryKey: ['productionHistoryByDateRange'] });
      queryClient.invalidateQueries({ queryKey: ['productionSummaryByType'] });
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

export function useSubmitDailyReportBatch() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { date: string; operations: DailyReportBatchEntry[] }) => {
      if (!actor) throw new Error('Actor not available');
      
      await actor.batchUpdateDailyProductionReport(data.date, data.operations);
      
      return { count: data.operations.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['dailyProductionReports'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyProductionSummary'] });
      queryClient.invalidateQueries({ queryKey: ['productionTrendData'] });
      queryClient.invalidateQueries({ queryKey: ['operationComparisonData'] });
      queryClient.invalidateQueries({ queryKey: ['productionHistoryByDateRange'] });
      queryClient.invalidateQueries({ queryKey: ['masterOrderStatus'] });
      queryClient.invalidateQueries({ queryKey: ['enhancedMasterOrderStatus'] });
      queryClient.invalidateQueries({ queryKey: ['productionSummaryByType'] });
      
      toast.success(`Successfully submitted ${result.count} production reports`);
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Admin role required')) {
        toast.error('Access denied: Only admins can submit batch production reports');
      } else {
        toast.error(`Failed to submit batch reports: ${errorMessage}`);
      }
    },
  });
}

export function useUpdateMasterOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      totalManufactured: bigint;
      totalDispatched: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMasterOrderStatus(
        data.totalManufactured,
        data.totalDispatched
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterOrderStatus'] });
      queryClient.invalidateQueries({ queryKey: ['enhancedMasterOrderStatus'] });
      toast.success('Master order status updated successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Admin role required')) {
        toast.error('Access denied: Only admins can update master order status');
      } else {
        toast.error(`Failed to update master order status: ${errorMessage}`);
      }
    },
  });
}

export function useMonthlyProductionSummary() {
  const { actor, isFetching } = useActor();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const currentDay = now.getDate();

  return useQuery({
    queryKey: ['monthlyProductionSummary', year, month],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const data = await actor.getMonthlyProductionTotals(BigInt(year), BigInt(month));
      return {
        ...data,
        averagePerDay: currentDay > 0 ? Number(data.totalContainers) / currentDay : 0,
      };
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMasterOrderStatus() {
  const { actor, isFetching } = useActor();

  return useQuery<MasterOrderStatus>({
    queryKey: ['masterOrderStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMasterOrderStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetEnhancedMasterOrderStatus() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['enhancedMasterOrderStatus'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEnhancedMasterOrderStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useGetHistoricalOpeningBalance() {
  const { actor, isFetching } = useActor();

  return useQuery<HistoricalOpeningBalance | null>({
    queryKey: ['historicalOpeningBalance'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getHistoricalOpeningBalance();
    },
    enabled: !!actor && !isFetching,
  });
}

// Alias for backward compatibility
export const useHistoricalOpeningBalance = useGetHistoricalOpeningBalance;

export function useCreateHistoricalOpeningBalance() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      openingDate: string;
      manufacturedBeforeSystem: bigint;
      dispatchedBeforeSystem: bigint;
      manufacturingStartDate: string;
      systemGoLiveDate: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createHistoricalOpeningBalance(
        data.openingDate,
        data.manufacturedBeforeSystem,
        data.dispatchedBeforeSystem,
        data.manufacturingStartDate,
        data.systemGoLiveDate
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['historicalOpeningBalance'] });
      toast.success('Historical opening balance created successfully');
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Admin role required')) {
        toast.error('Access denied: Only admins can create historical opening balance');
      } else if (errorMessage.includes('already exists')) {
        toast.error('Historical opening balance already exists');
      } else {
        toast.error(`Failed to create opening balance: ${errorMessage}`);
      }
    },
  });
}

// Production Trend Data Hook
export function useProductionTrendData(
  containerTypeId?: bigint | null,
  containerSizeId?: bigint | null
) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<{ date: string; totalProduction: number }>>({
    queryKey: ['productionTrendData', containerTypeId?.toString(), containerSizeId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      
      // Get last 30 days of data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const formatDate = (date: Date) => date.toISOString().split('T')[0];
      
      const reports = await actor.getDailyProductionReportsByDateRange(
        formatDate(startDate),
        formatDate(endDate),
        [containerTypeId ?? null, containerSizeId ?? null]
      );
      
      // Group by date and sum totalCompleted
      const dateMap = new Map<string, number>();
      
      reports.forEach(report => {
        if (report.date) {
          const current = dateMap.get(report.date) || 0;
          dateMap.set(report.date, current + Number(report.totalCompleted));
        }
      });
      
      // Convert to array and sort by date
      const result = Array.from(dateMap.entries())
        .map(([date, totalProduction]) => ({ date, totalProduction }))
        .sort((a, b) => a.date.localeCompare(b.date));
      
      return result;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000, // Refetch every minute
  });
}

// Operation Comparison Data Hook
export function useOperationComparisonData(
  containerTypeId?: bigint | null,
  containerSizeId?: bigint | null
) {
  const { actor, isFetching } = useActor();

  return useQuery<Array<{ operation: string; production: number }>>({
    queryKey: ['operationComparisonData', containerTypeId?.toString(), containerSizeId?.toString()],
    queryFn: async () => {
      if (!actor) return [];
      
      // Get current date
      const today = new Date().toISOString().split('T')[0];
      
      const reports = await actor.getDailyProductionReportsByDate(today);
      
      // Filter by container type and size if provided
      const filteredReports = reports.filter(report => {
        const typeMatches = containerTypeId ? report.container_type_id === containerTypeId : true;
        const sizeMatches = containerSizeId ? report.container_size_id === containerSizeId : true;
        return typeMatches && sizeMatches;
      });
      
      // Map to chart data format
      const result = filteredReports.map(report => ({
        operation: report.operationName,
        production: Number(report.totalCompleted),
      }));
      
      return result;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 60000, // Refetch every minute
  });
}
