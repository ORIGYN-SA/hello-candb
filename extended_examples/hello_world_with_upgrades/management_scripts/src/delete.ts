import { initializeIndexClient } from "./client";

// Script for targetted deletion of canisters belonging to a specific partition key
async function deletePK(isLocal: boolean, pkToDelete: string) {
  const indexClient = await initializeIndexClient(isLocal);
  const deleteStatusResult = await indexClient.indexCanisterActor.deleteCanistersByPK(pkToDelete)
  console.log("deleteStatusResult", JSON.stringify(deleteStatusResult))
}

const pkToDelete = ""; // replace this with the partition key of the partition that you wish to delete (i.e. "group#eightyr")
deletePK(true, pkToDelete);