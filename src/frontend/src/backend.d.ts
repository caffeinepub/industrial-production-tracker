import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export type Time = bigint;
export interface MasterOrderStatus {
    id: bigint;
    totalDispatched: bigint;
    totalManufactured: bigint;
    orderName: string;
    totalOrderQuantity: bigint;
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
export interface UserProfile {
    name: string;
    department: string;
}
export interface DailyProductionReport {
    id: bigint;
    despatched: bigint;
    todayProduction: bigint;
    totalCompleted: bigint;
    date: string;
    operationName: string;
    inHand: bigint;
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
    createDailyProductionReport(date: string, operationName: string, todayProduction: bigint, totalCompleted: bigint, despatched: bigint, inHand: bigint): Promise<bigint>;
    createDispatchEntry(containerType: ContainerType, quantity: bigint, dispatchDate: Time, destination: string, deliveryStatus: string): Promise<bigint>;
    createHistoricalOpeningBalance(openingDate: string, manufacturedBeforeSystem: bigint, dispatchedBeforeSystem: bigint, manufacturingStartDate: string, systemGoLiveDate: string): Promise<void>;
    createProductionEntry(containerType: ContainerType, shiftDetail: Shift, status: ContainerStatus, totalQty: bigint): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContainerStatuses(): Promise<Array<[ContainerType, ContainerStatus]>>;
    getDailyProductionByStatus(): Promise<Array<[ContainerType, ContainerStatus, bigint]>>;
    getDailyProductionReportsByDate(date: string): Promise<Array<DailyProductionReport>>;
    getDailyProductionReportsByDateRange(startDate: string, endDate: string): Promise<Array<DailyProductionReport>>;
    getDailyProductionReportsByOperation(operationName: string): Promise<Array<DailyProductionReport>>;
    getDispatchEntriesByDate(_rangeStart: Time, _rangeEnd: Time): Promise<Array<DispatchEntry>>;
    getFilteredProductionEntries(containerType: ContainerType | null, status: ContainerStatus | null): Promise<Array<ProductionEntry>>;
    getHistoricalOpeningBalance(): Promise<HistoricalOpeningBalance | null>;
    getMasterOrderStatus(): Promise<MasterOrderStatus>;
    getMonthlyProductionTotals(year: bigint, month: bigint): Promise<MonthlyProductionTotals>;
    getOperationWorkloadSummary(): Promise<Array<OperationStatus>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeProductionReports(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitOrUpdateDailyReport(date: string, operationName: string, todayProduction: bigint, totalCompleted: bigint, despatched: bigint, inHand: bigint): Promise<bigint>;
    updateDailyProductionReport(_id: bigint, _todayProduction: bigint, _totalCompleted: bigint, _despatched: bigint, _inHand: bigint): Promise<void>;
    updateDailyProductionReportById(reportId: bigint, todayProduction: bigint, totalCompleted: bigint, despatched: bigint, inHand: bigint): Promise<void>;
    updateDispatchStatus(dispatchId: bigint, newStatus: string): Promise<void>;
    updateMasterOrderStatus(totalManufactured: bigint, totalDispatched: bigint): Promise<void>;
    updateProductionStatus(entryId: bigint, newStatus: ContainerStatus): Promise<void>;
}
