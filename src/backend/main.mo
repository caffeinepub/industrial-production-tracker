import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply migration on upgrade
(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    department : Text;
  };

  public type ContainerType = {
    #fullContainer;
    #flatPack;
    #insulated;
  };

  public type ContainerStatus = {
    #readyForDispatch;
    #pendingOperations;
    #underTesting;
  };

  public type Shift = {
    shiftId : Nat;
    name : Text;
    containerQty : Nat;
  };

  public type ProductionEntry = {
    entryId : Nat;
    containerType : ContainerType;
    shiftDetail : Shift;
    totalQty : Nat;
    status : ContainerStatus;
    statusTime : Time.Time;
    createdAt : Time.Time;
    modifiedAt : Time.Time;
  };

  public type DispatchEntry = {
    dispatchId : Nat;
    containerType : ContainerType;
    quantity : Nat;
    dispatchDate : Time.Time;
    destination : Text;
    deliveryStatus : Text;
    createdAt : Time.Time;
  };

  public type OperationStatus = {
    operation : Text;
    pendingCount : Nat;
  };

  public type DailyProductionReport = {
    id : Nat;
    date : Text;
    operationName : Text;
    todayProduction : Nat;
    totalCompleted : Nat;
    dispatched : Nat;
    inHand : Nat;
  };

  public type DailyReportBatchEntry = {
    date : Text;
    operationName : Text;
    todayProduction : Nat;
    totalCompleted : Nat;
    dispatched : Nat;
    inHand : Nat;
  };

  public type MonthlyProductionTotals = {
    year : Nat;
    month : Nat;
    totalContainers : Nat;
  };

  public type MasterOrderStatus = {
    id : Nat;
    orderName : Text;
    totalOrderQuantity : Nat;
    totalManufactured : Nat;
    totalDispatched : Nat;
  };

  public type EnhancedMasterOrderStatus = {
    id : Nat;
    orderName : Text;
    totalOrderQuantity : Nat;
    totalManufactured : Nat;
    totalDispatched : Nat;
    remainingToProduce : Nat;
    finishedStock : Nat;
    completionPercentage : Float;
  };

  public type HistoricalOpeningBalance = {
    id : Nat;
    openingDate : Text;
    manufacturedBeforeSystem : Nat;
    dispatchedBeforeSystem : Nat;
    isLocked : Bool;
    entryType : Text;
    manufacturingStartDate : Text;
    systemGoLiveDate : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let productionEntries = Map.empty<Nat, ProductionEntry>();
  let dispatchEntries = Map.empty<Nat, DispatchEntry>();
  let dailyProductionReports = Map.empty<Nat, DailyProductionReport>();

  var nextProductionId : Nat = 0;
  var nextDispatchId : Nat = 0;
  var nextReportId : Nat = 34;

  let initialOperations = [
    "Boxing",
    "Welding/Finishing",
    "Rear Wall",
    "Front Wall",
    "Side Wall",
    "Roof",
    "Rear Door",
    "Blasting & Primer",
    "Final Paint",
    "Gasket",
    "DLM",
    "Plywood",
    "Floor Screw",
    "Decal",
    "Data Plate",
    "Sikha",
    "Black Paint",
  ];

  var masterOrderStatus : MasterOrderStatus = {
    id = 0;
    orderName = "First Lot – 600 Units";
    totalOrderQuantity = 600;
    totalManufactured = 345;
    totalDispatched = 344;
  };

  var historicalOpeningBalance : ?HistoricalOpeningBalance = null;

  public shared ({ caller }) func initializeProductionReports() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    for ((i, operation) in initialOperations.enumerate()) {
      let report : DailyProductionReport = {
        id = i;
        date = "";
        operationName = operation;
        todayProduction = 0;
        totalCompleted = 0;
        dispatched = 0;
        inHand = 0;
      };
      dailyProductionReports.add(i, report);
    };
  };

  public shared ({ caller }) func createHistoricalOpeningBalance(
    openingDate : Text,
    manufacturedBeforeSystem : Nat,
    dispatchedBeforeSystem : Nat,
    manufacturingStartDate : Text,
    systemGoLiveDate : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (historicalOpeningBalance != null) {
      Runtime.trap("Historical opening balance already exists. Only one entry is allowed.");
    };

    let balance : HistoricalOpeningBalance = {
      id = 0;
      openingDate;
      manufacturedBeforeSystem;
      dispatchedBeforeSystem;
      isLocked = true;
      entryType = "Historical Opening Balance";
      manufacturingStartDate;
      systemGoLiveDate;
    };

    historicalOpeningBalance := ?balance;
  };

  public query ({ caller }) func getHistoricalOpeningBalance() : async ?HistoricalOpeningBalance {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    historicalOpeningBalance;
  };

  public query ({ caller }) func getDailyProductionReportsByOperation(operationName : Text) : async [DailyProductionReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    let allReports = dailyProductionReports.values().toArray();
    allReports.filter(
      func(report) {
        Text.equal(report.operationName, operationName);
      }
    );
  };

  public query ({ caller }) func getDailyProductionReportsByDate(date : Text) : async [DailyProductionReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    let allReports = dailyProductionReports.values().toArray();
    allReports.filter(
      func(report) {
        Text.equal(report.date, date);
      }
    );
  };

  public query ({ caller }) func getDailyProductionReportsByDateRange(startDate : Text, endDate : Text) : async [DailyProductionReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    let filteredReports = List.empty<DailyProductionReport>();

    for ((_, report) in dailyProductionReports.entries()) {
      if (Text.compare(report.date, startDate) != #less and Text.compare(report.date, endDate) != #greater) {
        filteredReports.add(report);
      };
    };

    let resultArray = filteredReports.toArray();

    resultArray.sort(
      func(a, b) {
        Text.compare(b.date, a.date);
      }
    );
  };

  public query ({ caller }) func getOperationWorkloadSummary() : async [OperationStatus] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    List.empty<OperationStatus>().toArray();
  };

  public query ({ caller }) func getContainerStatuses() : async [(ContainerType, ContainerStatus)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    let statuses = List.empty<(ContainerType, ContainerStatus)>();
    for ((_, entry) in productionEntries.entries()) {
      statuses.add((entry.containerType, entry.status));
    };
    statuses.toArray();
  };

  public query ({ caller }) func getDailyProductionByStatus() : async [(ContainerType, ContainerStatus, Nat)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    let results = List.empty<(ContainerType, ContainerStatus, Nat)>();
    for ((_, entry) in productionEntries.entries()) {
      results.add((entry.containerType, entry.status, entry.totalQty));
    };
    results.toArray();
  };

  public query ({ caller }) func getFilteredProductionEntries(containerType : ?ContainerType, status : ?ContainerStatus) : async [ProductionEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    let allEntries = productionEntries.values().toArray();
    let filteredEntries = allEntries.filter(
      func(entry) {
        let containerTypeMatches = switch (containerType) {
          case (?container) { entry.containerType == container };
          case (null) { true };
        };
        let statusMatches = switch (status) {
          case (?s) { entry.status == s };
          case (null) { true };
        };
        containerTypeMatches and statusMatches;
      }
    );
    filteredEntries.sort(
      func(a, b) {
        if (a.createdAt < b.createdAt) { #less } else if (a.createdAt > b.createdAt) {
          #greater;
        } else {
          #equal;
        };
      }
    );
  };

  public query ({ caller }) func getDispatchEntriesByDate(_rangeStart : Time.Time, _rangeEnd : Time.Time) : async [DispatchEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    dispatchEntries.values().toArray();
  };

  public query ({ caller }) func getMonthlyProductionTotals(year : Nat, month : Nat) : async MonthlyProductionTotals {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    { year; month; totalContainers = 0 };
  };

  public query ({ caller }) func getMasterOrderStatus() : async MasterOrderStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };
    masterOrderStatus;
  };

  public query ({ caller }) func getEnhancedMasterOrderStatus() : async EnhancedMasterOrderStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access this data");
    };

    let finishedStock = masterOrderStatus.totalManufactured - masterOrderStatus.totalDispatched;
    let completionPercentage = ((masterOrderStatus.totalManufactured.toFloat() / masterOrderStatus.totalOrderQuantity.toFloat()) * 100.0);

    {
      id = masterOrderStatus.id;
      orderName = masterOrderStatus.orderName;
      totalOrderQuantity = masterOrderStatus.totalOrderQuantity;
      totalManufactured = masterOrderStatus.totalManufactured;
      totalDispatched = masterOrderStatus.totalDispatched;
      remainingToProduce = masterOrderStatus.totalOrderQuantity - masterOrderStatus.totalManufactured;
      finishedStock;
      completionPercentage;
    };
  };

  public shared ({ caller }) func updateMasterOrderStatus(totalManufactured : Nat, totalDispatched : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    masterOrderStatus := {
      masterOrderStatus with
      totalManufactured;
      totalDispatched;
    };
  };

  public shared ({ caller }) func createProductionEntry(containerType : ContainerType, shiftDetail : Shift, status : ContainerStatus, totalQty : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let entry = {
      entryId = nextProductionId;
      containerType;
      shiftDetail;
      totalQty;
      status;
      statusTime = Time.now();
      createdAt = Time.now();
      modifiedAt = Time.now();
    };

    productionEntries.add(nextProductionId, entry);
    nextProductionId += 1;
    entry.entryId;
  };

  public shared ({ caller }) func createDispatchEntry(containerType : ContainerType, quantity : Nat, dispatchDate : Time.Time, destination : Text, deliveryStatus : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let entry = {
      dispatchId = nextDispatchId;
      containerType;
      quantity;
      dispatchDate;
      destination;
      deliveryStatus;
      createdAt = Time.now();
    };

    dispatchEntries.add(nextDispatchId, entry);
    nextDispatchId += 1;
    entry.dispatchId;
  };

  public shared ({ caller }) func updateProductionStatus(entryId : Nat, newStatus : ContainerStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (productionEntries.get(entryId)) {
      case (null) { Runtime.trap("Production entry not found") };
      case (?entry) {
        let updatedEntry = {
          entryId = entry.entryId;
          containerType = entry.containerType;
          shiftDetail = entry.shiftDetail;
          totalQty = entry.totalQty;
          status = newStatus;
          statusTime = Time.now();
          createdAt = entry.createdAt;
          modifiedAt = Time.now();
        };

        productionEntries.add(entryId, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func updateDispatchStatus(dispatchId : Nat, newStatus : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (dispatchEntries.get(dispatchId)) {
      case (null) { Runtime.trap("Dispatch entry not found") };
      case (?entry) {
        let updatedEntry = {
          dispatchId = entry.dispatchId;
          containerType = entry.containerType;
          quantity = entry.quantity;
          dispatchDate = entry.dispatchDate;
          destination = entry.destination;
          deliveryStatus = newStatus;
          createdAt = entry.createdAt;
        };
        dispatchEntries.add(dispatchId, updatedEntry);
      };
    };
  };

  public shared ({ caller }) func createDailyProductionReport(date : Text, operationName : Text, todayProduction : Nat, totalCompleted : Nat, dispatched : Nat, inHand : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let report : DailyProductionReport = {
      id = nextReportId;
      date;
      operationName;
      todayProduction;
      totalCompleted;
      dispatched;
      inHand;
    };

    dailyProductionReports.add(nextReportId, report);
    nextReportId += 1;
    report.id;
  };

  public shared ({ caller }) func updateDailyProductionReport(_id : Nat, _todayProduction : Nat, _totalCompleted : Nat, _dispatched : Nat, _inHand : Nat) : async () {
    Runtime.trap("This update function is deprecated! Please call `updateDailyProductionReportById` instead.");
  };

  public shared ({ caller }) func updateDailyProductionReportById(reportId : Nat, todayProduction : Nat, totalCompleted : Nat, dispatched : Nat, inHand : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (dailyProductionReports.get(reportId)) {
      case (null) {
        Runtime.trap("Production report with ID " # reportId.toText() # " not found");
      };
      case (?existingReport) {
        let updatedReport = {
          id = existingReport.id;
          date = existingReport.date;
          operationName = existingReport.operationName;
          todayProduction;
          totalCompleted;
          dispatched;
          inHand;
        };
        dailyProductionReports.add(reportId, updatedReport);
      };
    };
  };

  public shared ({ caller }) func submitOrUpdateDailyReport(date : Text, operationName : Text, todayProduction : Nat, totalCompleted : Nat, dispatched : Nat, inHand : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let existingReportId = findReportId(date, operationName);

    switch (existingReportId) {
      case (null) {
        let report : DailyProductionReport = {
          id = nextReportId;
          date;
          operationName;
          todayProduction;
          totalCompleted;
          dispatched;
          inHand;
        };

        dailyProductionReports.add(nextReportId, report);
        let reportId = nextReportId;
        nextReportId += 1;
        reportId;
      };
      case (?id) {
        switch (dailyProductionReports.get(id)) {
          case (null) {
            Runtime.trap("Production report with ID " # id.toText() # " not found");
          };
          case (?existingReport) {
            let updatedReport = {
              id = existingReport.id;
              date = existingReport.date;
              operationName = existingReport.operationName;
              todayProduction;
              totalCompleted;
              dispatched;
              inHand;
            };
            dailyProductionReports.add(id, updatedReport);
          };
        };
        id;
      };
    };
  };

  func findReportId(date : Text, operationName : Text) : ?Nat {
    for ((id, report) in dailyProductionReports.entries()) {
      if (Text.equal(report.date, date) and Text.equal(report.operationName, operationName)) {
        return ?id;
      };
    };
    null;
  };

  public shared ({ caller }) func batchUpdateDailyProductionReport(date : Text, operations : [DailyReportBatchEntry]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    for (operation in operations.values()) {
      let existingReportId = findReportId(date, operation.operationName);
      let inHand = if (operation.totalCompleted >= operation.dispatched) {
        operation.totalCompleted - operation.dispatched;
      } else { 0 };

      switch (existingReportId) {
        case (null) {
          let report : DailyProductionReport = {
            id = nextReportId;
            date;
            operationName = operation.operationName;
            todayProduction = operation.todayProduction;
            totalCompleted = operation.totalCompleted;
            dispatched = operation.dispatched;
            inHand;
          };
          dailyProductionReports.add(nextReportId, report);
          nextReportId += 1;
        };
        case (?id) {
          switch (dailyProductionReports.get(id)) {
            case (null) {
              Runtime.trap("Production report with ID " # id.toText() # " not found");
            };
            case (?existingReport) {
              let updatedReport = {
                id = existingReport.id;
                date = existingReport.date;
                operationName = existingReport.operationName;
                todayProduction = operation.todayProduction;
                totalCompleted = operation.totalCompleted;
                dispatched = operation.dispatched;
                inHand;
              };
              dailyProductionReports.add(id, updatedReport);
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };
};

