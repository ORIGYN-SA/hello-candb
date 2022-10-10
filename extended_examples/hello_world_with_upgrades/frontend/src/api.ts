import { ActorClient } from "candb-client-typescript/dist/ActorClient";
import { HelloService } from "../declarations/helloservice/helloservice.did";
import { IndexCanister } from "../declarations/index/index.did";

export async function greetUser(helloServiceClient: ActorClient<IndexCanister, HelloService>, group: string, name: string) {
  let pk = `group#${group}`;
  let userGreetingQueryResults = await helloServiceClient.query<HelloService["greetUser"]>(
    pk,
    (actor) => actor.greetUser(name)
  );

  for (let settledResult of userGreetingQueryResults) {
    // handle settled result if fulfilled
    if (settledResult.status === "fulfilled" && settledResult.value.length > 0) {
      // handle candid returned optional type (string[] or string)
      return Array.isArray(settledResult.value) ? settledResult.value[0] : settledResult.value
    } 
  }
  
  return "User does not exist";
};

export async function putUser(helloServiceClient: ActorClient<IndexCanister, HelloService>, group: string, name: string, nickname: string) {
  let pk = `group#${group}`;
  let sk = name;
  await helloServiceClient.update<HelloService["putUser"]>(
    pk,
    sk,
    (actor) => actor.putUser(sk, nickname)
  );
}