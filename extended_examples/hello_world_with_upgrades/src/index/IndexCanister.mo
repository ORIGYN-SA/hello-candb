import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

import Admin "mo:candb/CanDBAdmin";
import CA "mo:candb/CanisterActions";
import CanisterMap "mo:candb/CanisterMap";
import Utils "mo:candb/Utils";
import Buffer "mo:stable-buffer/StableBuffer";
import HelloService "../helloservice/HelloService";



shared ({caller = owner}) actor class IndexCanister() = this {
  /// @required stable variable (Do not delete or change)
  ///
  /// Holds the CanisterMap of PK -> CanisterIdList
  stable var pkToCanisterMap = CanisterMap.init();

  /// @required API (Do not delete or change)
  ///
  /// Get all canisters for an specific PK
  ///
  /// This method is called often by the candb-client query & update methods. 
  public shared query({caller = caller}) func getCanistersByPK(pk: Text): async [Text] {
    getCanisterIdsIfExists(pk);
  };

  /// @required function (Do not delete or change)
  ///
  /// Helper method acting as an interface for returning an empty array if no canisters
  /// exist for the given PK
  func getCanisterIdsIfExists(pk: Text): [Text] {
    switch(CanisterMap.get(pkToCanisterMap, pk)) {
      case null { [] };
      case (?canisterIdsBuffer) { Buffer.toArray(canisterIdsBuffer) } 
    }
  };

  public shared({caller = caller}) func autoScaleHelloServiceCanister(pk: Text): async Text {
    // Auto-Scaling Authorization - if the request to auto-scale the partition is not coming from an existing canister in the partition, reject it
    if (Utils.callingCanisterOwnsPK(caller, pkToCanisterMap, pk)) {
      Debug.print("creating an additional canister for pk=" # pk);
      await createHelloServiceCanister(pk, ?[owner, Principal.fromActor(this)])
    } else {
      throw Error.reject("not authorized");
    };
  };

  // Partition HelloService canisters by the group passed in
  public shared({caller = creator}) func createHelloServiceCanisterByGroup(group: Text): async ?Text {
    let pk = "group#" # group;
    let canisterIds = getCanisterIdsIfExists(pk);
    if (canisterIds == []) {
      ?(await createHelloServiceCanister(pk, ?[owner, Principal.fromActor(this)]));
    // the partition already exists, so don't create a new canister
    } else {
      Debug.print(pk # " already exists");
      null 
    };
  };

  // Spins up a new HelloService canister with the provided pk and controllers
  func createHelloServiceCanister(pk: Text, controllers: ?[Principal]): async Text {
    Debug.print("creating new hello service canister with pk=" # pk);
    // Pre-load 300 billion cycles for the creation of a new Hello Service canister
    // Note that canister creation costs 100 billion cycles, meaning there are 200 billion
    // left over for the new canister when it is created
    Cycles.add(300_000_000_000);
    let newHelloServiceCanister = await HelloService.HelloService({
      partitionKey = pk;
      scalingOptions = {
        autoScalingHook = autoScaleHelloServiceCanister;
        sizeLimit = #heapSize(200_000_000); // Scale out at 200MB
        // for auto-scaling testing
        //sizeLimit = #count(3); // Scale out at 3 entities inserted
      };
      owners = controllers;
    });
    let newHelloServiceCanisterPrincipal = Principal.fromActor(newHelloServiceCanister);
    await CA.updateCanisterSettings({
      canisterId = newHelloServiceCanisterPrincipal;
      settings = {
        controllers = controllers;
        compute_allocation = ?0;
        memory_allocation = ?0;
        freezing_threshold = ?2592000;
      }
    });

    let newHelloServiceCanisterId = Principal.toText(newHelloServiceCanisterPrincipal);
    // After creating the new Hello Service canister, add it to the pkToCanisterMap
    pkToCanisterMap := CanisterMap.add(pkToCanisterMap, pk, newHelloServiceCanisterId);

    Debug.print("new hello service canisterId=" # newHelloServiceCanisterId);
    newHelloServiceCanisterId;
  };

  /// !! Do not use this method without caller authorization
  /// Upgrade user canisters in a PK range, i.e. rolling upgrades (limit is fixed at upgrading the canisters of 5 PKs per call)
  public shared({ caller = caller }) func upgradeGroupCanistersInPKRange(lowerPK: Text, upperPK: Text, wasmModule: Blob): async Admin.UpgradePKRangeResult {
    /* !!! Recommend Adding to prevent anyone from being able to upgrade the wasm of your service actor canisters
    if (caller != owner) { // basic authorization
      return {
        upgradeCanisterResults = [];
        nextKey = null;
      }
    }; 
    */


    // CanDB documentation on this library function - https://www.candb.canscale.dev/CanDBAdmin.html
    await Admin.upgradeCanistersInPKRange({
      canisterMap = pkToCanisterMap;
      lowerPK = lowerPK; 
      upperPK = upperPK;
      limit = 5;
      wasmModule = wasmModule;
      // the scaling options parameter that will be passed to the constructor of the upgraded canister
      scalingOptions = {
        autoScalingHook = autoScaleHelloServiceCanister;
        sizeLimit = #heapSize(200_000_000); // Scale out at 200MB
      };
      // the owners parameter that will be passed to the constructor of the upgraded canister
      owners = ?[owner, Principal.fromActor(this)];
    });
  };

  /// !! Do not use this method without caller authorization
  /// Spins down all canisters belonging to a specific user (transfers cycles back to the index canister, and stops/deletes all canisters)
  public shared({caller = caller}) func deleteCanistersByPK(pk: Text): async ?Admin.CanisterCleanupStatusMap {
    /* !!! Recommend Adding to prevent anyone from being able to delete your service actor canisters
    if (caller != owner) return null; // authorization 
    */

    let canisterIds = getCanisterIdsIfExists(pk);
    if (canisterIds == []) {
      Debug.print("canisters with pk=" # pk # " do not exist");
      null
    } else {
      // can choose to use this statusMap for to detect failures and prompt retries if desired 
      let statusMap = await Admin.transferCyclesStopAndDeleteCanisters(canisterIds);
      pkToCanisterMap := CanisterMap.delete(pkToCanisterMap, pk);
      ?statusMap;
    };
  };
}