import { Button, Card } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";
import React from "react";
import { Address } from "../components";
import { Transactor } from "../helpers";

// added display of 0 instead of NaN if gas price is not provided

/*
  ~ What it does? ~

  Displays ERC-721 (NFT) token

  ~ How can I use? ~

  <NftCard
    address={address}
    asset={asset}
    signer={userSigner}
    contractName={contractName}
    writeContracts={writeContracts}
    gasPrice={gasPrice}
    blockExplorer={blockExplorer}
  />

  ~ Features ~

  - Provide address={address} current address
*/

export default function NftCard(props) {
  const tx = Transactor(props.signer, props.gasPrice);

  const cardActions = [];
  if (props.asset.forSale) {
    cardActions.push(
      <div>
        <Button
          onClick={() => {
            tx(props.writeContracts[props.contractName].safeMint(props.address, props.asset.id));
          }}
        >
          Mint
        </Button>
      </div>,
    );
  } else {
    cardActions.push(
      <div>
        owned by:
        <Address address={props.asset.owner} blockExplorer={props.blockExplorer} minimized />
      </div>,
    );
  }

  return (
    <Card
      style={{ width: 200 }}
      key={props.asset.name}
      actions={cardActions}
      title={
        <div>
          {props.asset.name}{" "}
          <a
            style={{ cursor: "pointer", opacity: 0.33 }}
            href={props.asset.external_url}
            target="_blank"
            rel="noreferrer"
          >
            <LinkOutlined />
          </a>
        </div>
      }
    >
      <img style={{ maxWidth: 130 }} src={props.asset.image} alt="" />
      <div style={{ opacity: 0.77 }}>{props.asset.description}</div>
    </Card>
  );
}
