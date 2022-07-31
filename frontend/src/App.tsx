import * as React from "react";
import { greetUser, putUser } from "./api";
import { initializeHelloServiceClient, intializeIndexClient } from "./client";

const isLocal = true;
const indexClient = intializeIndexClient(isLocal);
const helloServiceClient = initializeHelloServiceClient(isLocal, indexClient);

export default function App() {
  let [greetName, setGreetName] = React.useState("");
  let [name, setName] = React.useState("");
  let [zipCode, setZipCode] = React.useState("");
  let [greetingResponse, setGreetingResponse] = React.useState("");
  let [greetErrorText, setGreetErrorText] = React.useState("");
  let [createErrorText, setCreateErrorText] = React.useState("");
  let region = "us-east-1";

  async function getUserGreeting() {
    if (greetName === "") {
      let errorText = "must enter a name to try to greet";
      console.error(errorText);
      setGreetErrorText(errorText)
    } else {
      setGreetErrorText("");
      let greeting = await greetUser(helloServiceClient, region, greetName)
      console.log("response", greeting)
      setGreetingResponse(greeting);
    }
  }

  async function createUser() {
    if (name === "" || zipCode == "") {
      let errorText = "must enter a name and a zipCode for user";
      console.error(errorText);
      setCreateErrorText(errorText)
    } else {
      setCreateErrorText("");
      // create the canister for the partition key if not sure that is exists
      await indexClient.indexCanisterActor.createHelloServiceCanisterByRegion(region);
      // create the new user
      putUser(helloServiceClient, region, name, zipCode);
    }
  }

  return (
    <div>
      Hello world!

      <div>Region is {region}</div>

      <div>
        Set username to greet
        <input
          value={greetName}
          onChange={ev => setGreetName(ev.target.value)}
        />
      </div>
      <button type="button" onClick={getUserGreeting}>Get user greeting</button>

      <div>Greeting response: {greetingResponse}</div>

      <div>{greetErrorText}</div>

      <div>
        Set username to create
        <input
          value={name}
          onChange={ev => setName(ev.target.value)}
        />
      </div>
      <div>
        Set zipCode for username
        <input
          value={zipCode}
          onChange={ev => setZipCode(ev.target.value)}
        />
      </div>
      <button type="button" onClick={createUser}>Create username</button>

      <div>{createErrorText}</div>

    </div>
  )
}