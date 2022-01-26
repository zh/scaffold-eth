import { Button, Card } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import "antd/dist/antd.css";
import { ethers } from "ethers";
import React from "react";
import { Address } from "../components";
import { notification } from "antd";
import { parseJsonMessage, formatUri } from "../helpers";

// added display of 0 instead of NaN if gas price is not provided

/*
  ~ What it does? ~

  Displays ERC-721 (NFT) token

  ~ How can I use? ~

  <NftCard
    address={address}
    asset={loadedAssets[a]}
    contract={writeContracts[tokenName]}
    blockExplorer={blockExplorer}
    coin={coin}
    gasPrice={gasPrice}
  />

  ~ Features ~

  - Provide address={address} current address
  - Provide asset={loadedAssets[a]} NFT token
  - Provide coin={coin} blockchain main coin name - ETH, BCH, FTM etc.
*/

const buyTx = async (contract, asset, gasPrice) => {
  try {
    const result = await contract.buyItem(asset.id, {
      value: ethers.utils.parseEther(asset.price),
      gasPrice,
    });
    notification.info({
      message: "Transaction Sent",
      description: result.hash,
      placement: "bottomRight",
    });
  } catch (e) {
    const message = parseJsonMessage(e);
    console.log("buy error: ", message);
    notification.error({
      message: "Transaction Error",
      description: message,
    });
  }
};

export default function NftCard(props) {
  const cardActions = [];
  if (props.asset.owner != props.address) {
    cardActions.push(
      <div>
        owned by:
        <Address address={props.asset.owner} blockExplorer={props.blockExplorer} minimized />
      </div>,
      <Button
        onClick={() => {
          buyTx(props.contract, props.asset, props.gasPrice);
        }}
      >
        Buy
      </Button>,
    );
  } else {
    cardActions.push(<div>OWN ASSET</div>);
  }

  return (
    <Card
      style={{ width: 200 }}
      key={props.asset.name}
      actions={cardActions}
      title={
        <div>
          <span style={{ fontSize: props.fontSize || 16, marginRight: 8 }}>#{props.asset.id}</span>
          {props.asset.name}{" "}
          {props.external_url && (
            <a
              style={{ cursor: "pointer", opacity: 0.33 }}
              href={props.asset.external_url}
              target="_blank"
              rel="noreferrer"
            >
              <LinkOutlined />
            </a>
          )}
        </div>
      }
    >
      <img style={{ maxWidth: 130 }} src={formatUri(props.asset.image)} alt="" />
      <div style={{ opacity: 0.77 }}>{props.asset.description}</div>
      <div style={{ padding: 3, fontWeight: "bold" }}>
        Price: {props.asset.price} {props.coin}
      </div>
    </Card>
  );
}
