import { Button, Card } from "antd";
import "antd/dist/antd.css";
import { ethers } from "ethers";
import { React, useState } from "react";
import { Address, AddressInput, EtherInput } from "../components";
import { formatUri } from "../helpers";

// added display of 0 instead of NaN if gas price is not provided

/*
  ~ What it does? ~

  Displays ERC-721 (NFT) token

  ~ How can I use? ~

  <OwnerNftCard
    item={item}
    address={address}
    tx={tx}
    contractName={contractName}
    writeContracts={writeContracts}
    blockExplorer={blockExplorer}
    fontSize={fontSize}
  />

  ~ Features ~

  - Provide address={address} current address
*/

export default function OwnerNftCard(props) {
  const item = props.item;
  const id = item.id.toNumber();

  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [sellPrices, setSellPrices] = useState({});

  const cardActions = [];
  if (item.price == "0.0") {
    cardActions.push(
      <EtherInput
        price={props.price}
        value={sellPrices[id]}
        onChange={newPrice => {
          const update = {};
          update[id] = newPrice;
          setSellPrices({ ...sellPrices, ...update });
        }}
      />,
    );
    cardActions.push(
      <Button
        onClick={() => {
          props.tx(props.writeContracts[props.contractName].sellItem(id, ethers.utils.parseEther(sellPrices[id])));
        }}
      >
        Sell
      </Button>,
    );
  } else {
    cardActions.push(
      <Button
        onClick={() => {
          props.tx(props.writeContracts[props.contractName].cancelSellItem(item.id));
        }}
      >
        Cancel Sell
      </Button>,
    );
  }

  return (
    <>
      <Card
        key={item.id}
        actions={cardActions}
        title={
          <div>
            <span style={{ fontSize: props.fontSize || 16, marginRight: 8 }}>#{id}</span> {item.name}
          </div>
        }
      >
        <div>
          <img src={formatUri(item.image)} style={{ maxWidth: 150 }} alt="" />
        </div>
        <div>{item.description}</div>
        <div>Price {item.price} AVAX</div>
      </Card>

      <div>
        owner:
        <Address address={item.owner} blockExplorer={props.blockExplorer} fontSize={props.fontSize || 16} />
        <AddressInput
          placeholder="transfer to address"
          value={transferToAddresses[id]}
          onChange={newValue => {
            const update = {};
            update[id] = newValue;
            setTransferToAddresses({ ...transferToAddresses, ...update });
          }}
        />
        <Button
          onClick={() => {
            props.tx(props.writeContracts[props.contractName].transferFrom(props.address, transferToAddresses[id], id));
          }}
        >
          Transfer
        </Button>
      </div>
    </>
  );
}
