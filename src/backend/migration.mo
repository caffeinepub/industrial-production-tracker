import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Float "mo:core/Float";

module {
  // Types copied from main actor state
  type ContainerType = {
    #fullContainer;
    #flatPack;
    #insulated;
  };

  type ContainerStatus = {
    #readyForDispatch;
    #pendingOperations;
    #underTesting;
  };

  type Shift = {
    shiftId : Nat;
    name : Text;
    containerQty : Nat;
  };

  type ProductionEntry = {
    entryId : Nat;
    containerType : ContainerType;
    shiftDetail : Shift;
    totalQty : Nat;
    status : ContainerStatus;
    statusTime : Int;
    createdAt : Int;
    modifiedAt : Int;
  };

  type DispatchEntry = {
    dispatchId : Nat;
    containerType : ContainerType;
    quantity : Nat;
    dispatchDate : Int;
    destination : Text;
    deliveryStatus : Text;
    createdAt : Int;
  };

  type DailyProductionReport = {
    id : Nat;
    date : Text;
    operationName : Text;
    todayProduction : Nat;
    totalCompleted : Nat;
    dispatched : Nat;
    inHand : Nat;
  };

  type MasterOrderStatus = {
    id : Nat;
    orderName : Text;
    totalOrderQuantity : Nat;
    totalManufactured : Nat;
    totalDispatched : Nat;
  };

  type EnhancedMasterOrderStatus = {
    id : Nat;
    orderName : Text;
    totalOrderQuantity : Nat;
    totalManufactured : Nat;
    totalDispatched : Nat;
    remainingToProduce : Nat;
    finishedStock : Nat;
    completionPercentage : Float;
  };

  type HistoricalOpeningBalance = {
    id : Nat;
    openingDate : Text;
    manufacturedBeforeSystem : Nat;
    dispatchedBeforeSystem : Nat;
    isLocked : Bool;
    entryType : Text;
    manufacturingStartDate : Text;
    systemGoLiveDate : Text;
  };

  type OldActor = {
    nextReportId : Nat;
    masterOrderStatus : MasterOrderStatus;
    dailyProductionReports : Map.Map<Nat, DailyProductionReport>;
    productionEntries : Map.Map<Nat, ProductionEntry>;
    dispatchEntries : Map.Map<Nat, DispatchEntry>;
    historicalOpeningBalance : ?HistoricalOpeningBalance;
  };

  type NewActor = {
    nextReportId : Nat;
    masterOrderStatus : MasterOrderStatus;
    dailyProductionReports : Map.Map<Nat, DailyProductionReport>;
    productionEntries : Map.Map<Nat, ProductionEntry>;
    dispatchEntries : Map.Map<Nat, DispatchEntry>;
    historicalOpeningBalance : ?HistoricalOpeningBalance;
  };

  public func run(old : OldActor) : NewActor {
    let updatedDailyReports = old.dailyProductionReports;

    let newReports = [
      {
        id = old.nextReportId;
        date = "2026-02-21";
        operationName = "Boxing";
        todayProduction = 5;
        totalCompleted = 400;
        dispatched = 344;
        inHand = 56;
      },
      {
        id = old.nextReportId + 1;
        date = "2026-02-21";
        operationName = "Welding/Finishing";
        todayProduction = 4;
        totalCompleted = 399;
        dispatched = 344;
        inHand = 55;
      },
      {
        id = old.nextReportId + 2;
        date = "2026-02-21";
        operationName = "Rear Wall";
        todayProduction = 2;
        totalCompleted = 403;
        dispatched = 344;
        inHand = 59;
      },
      {
        id = old.nextReportId + 3;
        date = "2026-02-21";
        operationName = "Front Wall";
        todayProduction = 5;
        totalCompleted = 422;
        dispatched = 344;
        inHand = 78;
      },
      {
        id = old.nextReportId + 4;
        date = "2026-02-21";
        operationName = "Side Wall";
        todayProduction = 8;
        totalCompleted = 439;
        dispatched = 344;
        inHand = 95;
      },
      {
        id = old.nextReportId + 5;
        date = "2026-02-21";
        operationName = "Roof";
        todayProduction = 0;
        totalCompleted = 427;
        dispatched = 344;
        inHand = 83;
      },
      {
        id = old.nextReportId + 6;
        date = "2026-02-21";
        operationName = "Rear Door";
        todayProduction = 10;
        totalCompleted = 420;
        dispatched = 344;
        inHand = 76;
      },
      {
        id = old.nextReportId + 7;
        date = "2026-02-21";
        operationName = "Blasting & Primer";
        todayProduction = 4;
        totalCompleted = 367;
        dispatched = 344;
        inHand = 23;
      },
      {
        id = old.nextReportId + 8;
        date = "2026-02-21";
        operationName = "Final Paint";
        todayProduction = 3;
        totalCompleted = 359;
        dispatched = 344;
        inHand = 15;
      },
      {
        id = old.nextReportId + 9;
        date = "2026-02-21";
        operationName = "Gasket";
        todayProduction = 5;
        totalCompleted = 352;
        dispatched = 344;
        inHand = 8;
      },
      {
        id = old.nextReportId + 10;
        date = "2026-02-21";
        operationName = "DLM";
        todayProduction = 5;
        totalCompleted = 352;
        dispatched = 344;
        inHand = 8;
      },
      {
        id = old.nextReportId + 11;
        date = "2026-02-21";
        operationName = "Plywood";
        todayProduction = 5;
        totalCompleted = 351;
        dispatched = 344;
        inHand = 7;
      },
      {
        id = old.nextReportId + 12;
        date = "2026-02-21";
        operationName = "Floor Screw";
        todayProduction = 5;
        totalCompleted = 350;
        dispatched = 344;
        inHand = 6;
      },
      {
        id = old.nextReportId + 13;
        date = "2026-02-21";
        operationName = "Decal";
        todayProduction = 5;
        totalCompleted = 352;
        dispatched = 344;
        inHand = 8;
      },
      {
        id = old.nextReportId + 14;
        date = "2026-02-21";
        operationName = "Data Plate";
        todayProduction = 5;
        totalCompleted = 352;
        dispatched = 344;
        inHand = 8;
      },
      {
        id = old.nextReportId + 15;
        date = "2026-02-21";
        operationName = "Sikha";
        todayProduction = 4;
        totalCompleted = 346;
        dispatched = 344;
        inHand = 2;
      },
      {
        id = old.nextReportId + 16;
        date = "2026-02-21";
        operationName = "Black Paint";
        todayProduction = 1;
        totalCompleted = 345;
        dispatched = 344;
        inHand = 1;
      },
    ];

    for (report in newReports.values()) {
      updatedDailyReports.add(report.id, report);
    };

    let updatedMasterOrderStatus : MasterOrderStatus = {
      old.masterOrderStatus with
      totalOrderQuantity = 600;
      totalManufactured = 345;
      totalDispatched = 344;
    };

    {
      old with
      dailyProductionReports = updatedDailyReports;
      masterOrderStatus = updatedMasterOrderStatus;
      nextReportId = old.nextReportId + 17;
    };
  };
};
