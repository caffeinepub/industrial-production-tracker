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
export interface DispatchEntry {
    destination: string;
    createdAt: Time;
    dispatchId: bigint;
    dispatchDate: Time;
    deliveryStatus: string;
    containerType: ContainerType;
    quantity: bigint;
}
export interface OperationStatus {
    pendingCount: bigint;
    operation: string;
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
export interface UserProfile {
    name: string;
    role: UserRole;
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
    Viewer = "Viewer",
    Admin = "Admin"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createDailyProductionReport(date: string, operationName: string, todayProduction: bigint, totalCompleted: bigint, despatched: bigint, inHand: bigint): Promise<bigint>;
    createDispatchEntry(containerType: ContainerType, quantity: bigint, dispatchDate: Time, destination: string, deliveryStatus: string): Promise<bigint>;
    createProductionEntry(containerType: ContainerType, shiftDetail: Shift, status: ContainerStatus, totalQty: bigint): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getContainerStatuses(): Promise<Array<[ContainerType, ContainerStatus]>>;
    getDailyProductionByStatus(): Promise<Array<[ContainerType, ContainerStatus, bigint]>>;
    getDailyProductionReportsByDate(date: string): Promise<Array<DailyProductionReport>>;
    getDailyProductionReportsByDateRange(startDate: string, endDate: string): Promise<Array<DailyProductionReport>>;
    getDailyProductionReportsByOperation(operationName: string): Promise<Array<DailyProductionReport>>;
    getDispatchEntriesByDate(_rangeStart: Time, _rangeEnd: Time): Promise<Array<DispatchEntry>>;
    getFilteredProductionEntries(containerType: ContainerType | null, status: ContainerStatus | null): Promise<Array<ProductionEntry>>;
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
    updateProductionStatus(entryId: bigint, newStatus: ContainerStatus): Promise<void>;
}
