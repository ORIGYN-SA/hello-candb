import { IndexClient } from "candb-client-typescript/dist/IndexClient";
import { ActorClient } from "candb-client-typescript/dist/ActorClient";

import { idlFactory as IndexCanisterIDL } from "../declarations/index/index";
import { idlFactory as HelloServiceCanisterIDL } from "../declarations/helloservice/index";
import { IndexCanister } from "../declarations/index/index.did";
import { HelloService } from "../declarations/helloservice/helloservice.did";


export function intializeIndexClient(isLocal: boolean): IndexClient<IndexCanister> {
  const host = isLocal ? "http://127.0.0.1:8000" : "https://ic0.app";
  // canisterId of your index canister
  const canisterId = isLocal ? process.env.INDEX_CANISTER_ID : "<prod_canister_id>";
  return new IndexClient<IndexCanister>({
    IDL: IndexCanisterIDL,
    canisterId, 
    agentOptions: {
      host,
    },
  })
};

export function initializeHelloServiceClient(isLocal: boolean, indexClient: IndexClient<IndexCanister>): ActorClient<IndexCanister, HelloService> {
  const host = isLocal ? "http://127.0.0.1:8000" : "https://ic0.app";
  return new ActorClient<IndexCanister, HelloService>({
    actorOptions: {
      IDL: HelloServiceCanisterIDL,
      agentOptions: {
        host,
      }
    },
    indexClient, 
  })
};