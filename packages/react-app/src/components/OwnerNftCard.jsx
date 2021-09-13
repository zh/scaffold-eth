import { Button, Card } from "antd";
import "antd/dist/antd.css";
import { React, useState } from "react";
import { Address, AddressInput } from "../components";
import { Transactor } from "../helpers";

// added display of 0 instead of NaN if gas price is not provided

/*
  ~ What it does? ~

  Displays ERC-721 (NFT) token

  ~ How can I use? ~

  <OwnerNftCard
    item={item}
    address={address}
    signer={userSigner}
    contractName={contractName}
    writeContracts={writeContracts}
    gasPrice={gasPrice}
    blockExplorer={blockExplorer}
    fontSize={fontSize}
  />

  ~ Features ~

  - Provide address={address} current address
*/

export default function OwnerNftCard(props) {
  const tx = Transactor(props.signer, props.gasPrice);
  const item = props.item;
  const id = item.id.toNumber();

  const [transferToAddresses, setTransferToAddresses] = useState({});

  return (
    <>
      <Card
        title={
          <div>
            <span style={{ fontSize: props.fontSize || 16, marginRight: 8 }}>#{id}</span> {item.name}
          </div>
        }
      >
        <div>
          <img src={item.image} style={{ maxWidth: 150 }} alt="" />
        </div>
        <div>{item.description}</div>
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
      </div>

      <Button
        onClick={() => {
          tx(props.writeContracts[props.contractName].transferFrom(props.address, transferToAddresses[id], id));
        }}
      >
        Transfer
      </Button>
    </>
  );
}
