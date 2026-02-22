import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldUserProfile = {
    name : Text;
    department : Text;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, OldUserProfile>;
  };

  type NewUserProfile = {
    name : Text;
    department : Text;
    role : {
      #Admin;
      #Viewer;
    };
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, NewUserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    let newUserProfiles = old.userProfiles.map<Principal, OldUserProfile, NewUserProfile>(
      func(_principal, oldProfile) {
        {
          oldProfile with
          role = #Admin;
        };
      }
    );
    { userProfiles = newUserProfiles };
  };
};
