import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type ContainerTypes = {
    id : Nat;
    container_type_name : Text;
    description : Text;
    is_active : Bool;
  };

  type ContainerSizes = {
    id : Nat;
    container_size : Text;
    length_ft : Nat;
    width_ft : Nat;
    height_ft : Nat;
    is_high_cube : Bool;
    is_active : Bool;
  };

  type DailyProductionReport = {
    id : Nat;
    date : Text;
    operationName : Text;
    container_type_id : Nat;
    container_size_id : Nat;
    todayProduction : Nat;
    totalCompleted : Nat;
    dispatched : Nat;
    inHand : Nat;
  };

  type OldActor = {
    containerTypes : Map.Map<Nat, ContainerTypes>;
    containerSizes : Map.Map<Nat, ContainerSizes>;
    dailyProductionReports : Map.Map<Nat, DailyProductionReport>;
  };

  type NewActor = {
    containerTypes : Map.Map<Nat, ContainerTypes>;
    containerSizes : Map.Map<Nat, ContainerSizes>;
    dailyProductionReports : Map.Map<Nat, DailyProductionReport>;
  };

  public func run(old : OldActor) : NewActor {
    // Migrate container types with defaults
    let containerTypes = if (old.containerTypes.size() == 0) {
      Map.fromIter<Nat, ContainerTypes>(
        [
          (1, { id = 1; container_type_name = "Dry / General Purpose"; description = "Standard containers for general cargo"; is_active = true }),
          (2, { id = 2; container_type_name = "High Cube"; description = "Taller containers for larger cargo"; is_active = true }),
          (3, { id = 3; container_type_name = "Refrigerated (Reefer)"; description = "Temperature-controlled containers"; is_active = true }),
          (4, { id = 4; container_type_name = "Flat Rack"; description = "Containers with collapsible sides"; is_active = true }),
          (5, { id = 5; container_type_name = "Open Top"; description = "Containers with removable/top covers"; is_active = true }),
          (6, { id = 6; container_type_name = "Open Side"; description = "Containers with convertible sides"; is_active = true }),
          (7, { id = 7; container_type_name = "Double Door / Tunnel"; description = "Containers with doors on both ends"; is_active = true }),
          (8, { id = 8; container_type_name = "Tank (ISO Tank)"; description = "Containers for liquid cargo"; is_active = true }),
          (9, { id = 9; container_type_name = "Half Height"; description = "Shorter containers for specific cargo"; is_active = true }),
          (10, { id = 10; container_type_name = "Special / Modified"; description = "Custom containers for specialized needs"; is_active = true }),
        ].values(),
      );
    } else {
      old.containerTypes;
    };

    // Use persistent containerSizes or defaults if empty
    let containerSizes = if (old.containerSizes.size() == 0) {
      Map.fromIter<Nat, ContainerSizes>(
        [
          (1, { id = 1; container_size = "20 ft Standard"; length_ft = 20; width_ft = 8; height_ft = 8; is_high_cube = false; is_active = true }),
          (2, { id = 2; container_size = "40 ft Standard"; length_ft = 40; width_ft = 8; height_ft = 8; is_high_cube = false; is_active = true }),
          (3, { id = 3; container_size = "40 ft High Cube"; length_ft = 40; width_ft = 8; height_ft = 9; is_high_cube = true; is_active = true }),
          (4, { id = 4; container_size = "45 ft High Cube"; length_ft = 45; width_ft = 8; height_ft = 9; is_high_cube = true; is_active = true }),
        ].values(),
      );
    } else {
      old.containerSizes;
    };

    // Apply defaults to daily production reports
    let dailyProductionReports = old.dailyProductionReports.map<Nat, DailyProductionReport, DailyProductionReport>(
      func(_id, report) {
        {
          report with
          container_type_id = if (report.container_type_id == 0) { 2 } else { report.container_type_id };
          container_size_id = if (report.container_size_id == 0) { 3 } else { report.container_size_id };
        };
      }
    );

    {
      containerTypes;
      containerSizes;
      dailyProductionReports;
    };
  };
};
