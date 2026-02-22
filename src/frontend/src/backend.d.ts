import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface FrontendContainerSizes {
    id: bigint;
    container_size: string;
    is_high_cube: boolean;
    length_ft: bigint;
    height_ft: number;
    width_ft: bigint;
    is_active: boolean;
}
export interface ContainerTypes {
    id: bigint;
    description: string;
    container_type_name: string;
    is_active: boolean;
}
export type Time = bigint;
export interface EnhancedMasterOrderStatus {
    id: bigint;
    totalDispatched: bigint;
    totalManufactured: bigint;
    completionPercentage: number;
    orderName: string;
    remainingToProduce: bigint;
    totalOrderQuantity: bigint;
    finishedStock: bigint;
}
export interface Shift {
    name: string;
    containerQty: bigint;
    shiftId: bigint;
}
export interface MonthlyProductionTotals {
    month: bigint;
    year: bigint;
    totalContainers: bigint;
}
export interface HistoricalOpeningBalance {
    id: bigint;
    manufacturingStartDate: string;
    dispatchedBeforeSystem: bigint;
    systemGoLiveDate: string;
    entryType: string;
    openingDate: string;
    manufacturedBeforeSystem: bigint;
    isLocked: boolean;
}
export interface OperationStatus {
    pendingCount: bigint;
    operation: string;
}
export interface DispatchEntry {
    destination: string;
    createdAt: Time;
    dispatchId: bigint;
    dispatchDate: Time;
    deliveryStatus: string;
    containerType: ContainerType;
    quantity: bigint;
}
export interface ProductionEntry {
    status: ContainerStatus;
    modifiedAt: Time;
    createdAt: Time;
    totalQty: bigint;
    entryId: bigint;
    containerType: ContainerType;
    statusTime: Time;
    shiftDetail: Shift;
}
export interface DailyReportBatchEntry {
    todayProduction: bigint;
    totalCompleted: bigint;
    date: string;
    operationName: string;
    dispatched: bigint;
    inHand: bigint;
}
export interface MasterOrderStatus {
    id: bigint;
    totalDispatched: bigint;
    totalManufactured: bigint;
    orderName: string;
    totalOrderQuantity: bigint;
}
export interface DailyProductionReport {
    id: bigint;
    container_type_id: bigint;
    todayProduction: bigint;
    totalCompleted: bigint;
    container_size_id: bigint;
    date: string;
    operationName: string;
    dispatched: bigint;
    inHand: bigint;
}
export interface UserProfile {
    name: string;
    department: string;
}
export enum ContainerStatus {
    readyForDispatch = "readyForDispatch",
    pendingOperations = "pendingOperations",
    underTesting = "underTesting"
}
export enum ContainerType {
    flatPack = "flatPack",
    fullContainer = "fullContainer",
    insulated = "insulated"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    batchUpdateDailyProductionReport(date: string, operations: Array<DailyReportBatchEntry>): Promise<void>;
    createDailyProductionReport(date: string, operationName: string, containerTypeId: bigint, containerSizeId: bigint, todayProduction: bigint, totalCompleted: bigint, dispatched: bigint, inHand: bigint): Promise<bigint>;
    createDispatchEntry(containerType: ContainerType, quantity: bigint, dispatchDate: Time, destination: string, deliveryStatus: string): Promise<bigint>;
    createHistoricalOpeningBalance(openingDate: string, manufacturedBeforeSystem: bigint, dispatchedBeforeSystem: bigint, manufacturingStartDate: string, systemGoLiveDate: string): Promise<void>;
    createProductionEntry(containerType: ContainerType, shiftDetail: Shift, status: ContainerStatus, totalQty: bigint): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContainerSizes(): Promise<Array<FrontendContainerSizes>>;
    getContainerStatuses(): Promise<Array<[ContainerType, ContainerStatus]>>;
    getContainerTypes(): Promise<Array<ContainerTypes>>;
    getDailyProductionByStatus(): Promise<Array<[ContainerType, ContainerStatus, bigint]>>;
    getDailyProductionReportsByDate(date: string): Promise<Array<DailyProductionReport>>;
    getDailyProductionReportsByDateRange(startDate: string, endDate: string, containerFilters: [bigint | null, bigint | null]): Promise<Array<DailyProductionReport>>;
    getDailyProductionReportsByOperation(operationName: string): Promise<Array<DailyProductionReport>>;
    getDispatchEntriesByDate(_rangeStart: Time, _rangeEnd: Time): Promise<Array<DispatchEntry>>;
    getEnhancedMasterOrderStatus(): Promise<EnhancedMasterOrderStatus>;
    getFilteredProductionEntries(containerType: ContainerType | null, status: ContainerStatus | null): Promise<Array<ProductionEntry>>;
    getHistoricalOpeningBalance(): Promise<HistoricalOpeningBalance | null>;
    getMasterOrderStatus(): Promise<MasterOrderStatus>;
    getMonthlyProductionTotals(year: bigint, month: bigint): Promise<MonthlyProductionTotals>;
    getOperationWorkloadSummary(): Promise<Array<OperationStatus>>;
    getProductionSummaryByType(startDate: string, endDate: string, containerFilters: [bigint | null, bigint | null]): Promise<Array<[bigint, bigint, bigint, bigint, bigint]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeContainerTypesAndSizes(): Promise<void>;
    initializeProductionReports(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitOrUpdateDailyReport(date: string, operationName: string, containerTypeId: bigint, containerSizeId: bigint, todayProduction: bigint, totalCompleted: bigint, dispatched: bigint, inHand: bigint): Promise<bigint>;
    updateDailyProductionReport(_id: bigint, _todayProduction: bigint, _totalCompleted: bigint, _dispatched: bigint, _inHand: bigint): Promise<void>;
    updateDailyProductionReportById(reportId: bigint, containerFilters: [bigint | null, bigint | null], todayProduction: bigint, totalCompleted: bigint, dispatched: bigint, inHand: bigint): Promise<void>;
    updateDispatchStatus(dispatchId: bigint, newStatus: string): Promise<void>;
    updateMasterOrderStatus(totalManufactured: bigint, totalDispatched: bigint): Promise<void>;
    updateProductionStatus(entryId: bigint, newStatus: ContainerStatus): Promise<void>;
}
