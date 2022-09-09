import * as React from "react";
import { greetUser, putUser } from "./api";
import { initializeHelloServiceClient, intializeIndexClient } from "./client";

const isLocal = true;
const indexClient = intializeIndexClient(isLocal);
const helloServiceClient = initializeHelloServiceClient(isLocal, indexClient);
const regionOptions = {
  na: { value: "na", label: "North America" },
  eu: { value: "eu", label: "Europe" },
  asia: { value: "asia", label: "Asia" }
}

export default function App() {
  let [greetName, setGreetName] = React.useState("");
  let [name, setName] = React.useState("");
  let [zipCode, setZipCode] = React.useState("");
  let [greetingResponse, setGreetingResponse] = React.useState("");
  let [greetErrorText, setGreetErrorText] = React.useState("");
  let [createErrorText, setCreateErrorText] = React.useState("");
  let [region, setRegion] = React.useState(regionOptions.na);

  async function getUserGreeting() {
    if (greetName === "") {
      let errorText = "must enter a name to try to greet";
      console.error(errorText);
      setGreetErrorText(errorText)
    } else {
      setGreetErrorText("");
      let greeting = await greetUser(helloServiceClient, region.value, greetName)
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
      // create the canister for the partition key if not sure that it exists
      await indexClient.indexCanisterActor.createHelloServiceCanisterByRegion(region.value);
      // create the new user
      putUser(helloServiceClient, region.value, name, zipCode);
    }
  }

  return (
    <div className="flex-center">
      
      <div className="section-wrapper">
        <h1>Hello world!</h1>
        <div className="flex-wrapper">
          <div>Region partition key is: {region.label}. To change, select {"->"} </div>
          <select className="left-margin" onChange={(e) => setRegion(regionOptions[e.target.value as 'na' | 'eu' | 'asia'])}>
            {Object.values(regionOptions).map(createOption)}
          </select>
        </div>
      </div>

      <div className="section-wrapper">
        <h2>Get a User from {region.label} (that was already created)</h2>
        <div className="flex-wrapper">
          <div className="prompt-text">Set username to greet</div>
          <input
            className="margin-left"
            value={greetName}
            onChange={ev => setGreetName(ev.target.value)}
          />
          <button className="left-margin" type="button" onClick={getUserGreeting}>Get user greeting</button>
        </div>
        <div>Greeting response: {greetingResponse}</div>
        <div>{greetErrorText}</div>
      </div>

      <div className="section-wrapper">
        <h2>Create a User in {region.label} (the current region partition)</h2>
        <div className="flex-wrapper">
          <div className="prompt-text">Set username to create</div>
          <input
            value={name}
            onChange={ev => setName(ev.target.value)}
          />
        </div>
        <div className="flex-wrapper">
          <div className="prompt-text">Set zipCode for username</div>
          <input
            value={zipCode}
            onChange={ev => setZipCode(ev.target.value)}
          />
        </div>
        <button type="button" onClick={createUser}>Create username</button>
      </div>

      <div>{createErrorText}</div>

    </div>
  )
}

type OptionType = {
  value: string;
  label: string;
}

function createOption(option: OptionType) {
  return <option key={option.value} value={option.value}>{option.label}</option>
}
