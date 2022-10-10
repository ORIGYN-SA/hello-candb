import { loadWasm } from "candb-client-typescript/dist/ClientUtil";
import { initializeIndexClient } from "./client";

// Example how to from a local script, one can upgrade canisters through the index canister
//
// Example Script for upgrading the helloserivce wasm running in the canisters with the pks specified */
async function upgradeHelloService(isLocal: boolean, lowerPK: string, upperPK: string) {
  const indexClient = await initializeIndexClient(isLocal);
  const helloServiceWasmModulePath = `${process.cwd()}/../.dfx/local/canisters/helloservice/helloservice.wasm`
  const helloServiceWasm = loadWasm(helloServiceWasmModulePath);
  const upgradeResult = await indexClient.indexCanisterActor.upgradeGroupCanistersInPKRange(lowerPK, upperPK, helloServiceWasm);
  console.log("result", JSON.stringify(upgradeResult));

  console.log("upgrade complete")
};

// By default, upgrades all partition keys that start with the prefix "group" (i.e. bounded from "group#" to "group#~")
//
// To change, replace the lower and/or uppper PK bounds with those of the partition range you'd like to upgrade with the helloservice.wasm
upgradeHelloService(true, "group#", "group#~");