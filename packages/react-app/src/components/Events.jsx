import { useEventListener } from "../hooks";
import { List } from "antd";
import { Address } from "../components";

/*
  ~ What it does? ~

  Displays a lists of events

  ~ How can I use? ~

  <Events
    contracts={readContracts}
    contractName="YourContract"
    eventName="SetPurpose"
    localProvider={localProvider}
    startBlock={1}
  />
*/

export default function Events({ contracts, contractName, eventName, localProvider, startBlock }) {

  // 📟 Listen for broadcast events
  const events = useEventListener(contracts, contractName, eventName, localProvider, startBlock);

  return (
    <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
      <h2>Events:</h2>
      <List
        bordered
        dataSource={events}
        renderItem={item => {
          return (
            <List.Item key={item.blockNumber + "_" + item[0] + "_" + item[1]}>
              <Address address={item[0]} fontSize={16} />
              {item[1]}
            </List.Item>
          );
        }}
      />
    </div>
  );
}