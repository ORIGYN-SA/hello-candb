import CA "mo:candb/CanisterActions";
import CanDB "mo:candb/CanDB";
import Entity "mo:candb/Entity";

shared ({ caller = owner }) actor class HelloService({
  // the primary key of this canister
  partitionKey: Text;
  // the scaling options that determine when to auto-scale out this canister storage partition
  scalingOptions: CanDB.ScalingOptions;
  // (optional) allows the developer to specify additional owners (i.e. for allowing admin or backfill access to specific endpoints)
  owners: ?[Principal];
}) {
  /// @required (may wrap, but must be present in some form in the canister)
  stable let db = CanDB.init({
    pk = partitionKey;
    scalingOptions = scalingOptions;
    btreeOrder = null;
  });

  /// @recommended (not required) public API
  public query func getPK(): async Text { db.pk };

  /// @required public API (Do not delete or change)
  public query func skExists(sk: Text): async Bool { 
    CanDB.skExists(db, sk);
  };

  /// @required public API (Do not delete or change)
  public shared({ caller = caller }) func transferCycles(): async () {
    if (caller == owner) {
      return await CA.transferCycles(caller);
    };
  };

  // returns a greeting to the user if exists 
  public query func greetUser(name: Text): async ?Text {
    let user = switch(CanDB.get(db, { sk = name })) {
      case null { null };
      case (?userEntity) { unwrapUser(userEntity) };
    };

    switch(user) {
      case null { null };
      case (?u) {
        // Make a change to the line below to test out CanDB upgrades!
        ?("Hello " # u.displayName # " from " # db.pk);
        // ?("Hello " # u.displayName # " from " # db.pk # " - service upgraded!");
      }
    }
  };

  // Create a new user. In this basic case, we're using the user's name as the sort key
  // This works for our hello world app, but as names are easily duplicated, one might want
  // to attach an unique identifier to the sk to separate users with the same name
  public func putUser(name: Text, displayName: Text): async () {
    if (name == "" or displayName == "") { return };

    // inserts the entity into CanDB
    await* CanDB.put(db, {
      sk = name;
      attributes = [
        ("name", #text(name)),
        ("displayName", #text(displayName))
      ]
    })
  };

  type User = {
    name: Text;
    displayName: Text;
  };

  // attempts to cast an Entity (retrieved from CanDB) into a User type
  func unwrapUser(entity: Entity.Entity): ?User {
    let { sk; attributes } = entity;
    let nameValue = Entity.getAttributeMapValueForKey(attributes, "name");
    let displayNameValue = Entity.getAttributeMapValueForKey(attributes, "displayName");

    switch(nameValue, displayNameValue) {
      case (
        ?(#text(name)),
        ?(#text(displayName))
      ) { ?{ name; displayName } };
      case _ { 
        null 
      }
    };
  };


  // Used to pass new scaling options to the db through an upgrade from the IndexCanister if desired
  system func postupgrade() {
    db.scalingOptions := scalingOptions;
  };
}