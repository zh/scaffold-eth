import React, { useState, useEffect } from "react";
import { SendOutlined } from "@ant-design/icons";
import { Button, Col, Row, Tooltip, Card } from "antd";
import QR from "qrcode.react";
import { utils } from "ethers";
import { useContractLoader } from "../hooks";
import { Transactor } from "../helpers";
import AddressInput from "./AddressInput";
import EtherInput from "./EtherInput";
import TokenBalance from "./TokenBalance";
import { useTokenList } from "../hooks";

const DEBUG = true;

export default function TokenWallet(props) {
  const { name, provider, chainId } = props;

  const [amount, setAmount] = useState();
  const [toAddress, setToAddress] = useState();

  const tokenList = useTokenList();
  const contracts = useContractLoader(provider, { chainId });
  const contract = contracts && contracts[name] ? contracts[name] : null;

  const sendTokens = async () => {
    if (!contract) return;
    let value;
    try {
      value = utils.parseEther("" + amount);
    } catch (e) {
      // failed to parseEther, try something else
      value = utils.parseEther("" + parseFloat(amount).toFixed(8));
    }

    try {
      const tx = Transactor(provider, props.gasPrice);
      const contractFunction = contract.connect(props.signer)["transfer"];
      const result = await tx(contractFunction(toAddress, value));

      if (DEBUG) console.log("SEND TKN: ", result);
    } catch (e) {
      console.log("SEND TKN: ", e);
    }
  };

  const addLogo = async () => {
    if (!contract) return;
    try {
      const symbol = await contract.symbol();
      const info = tokenList.filter(t => t.symbol === symbol)[0];
      const methodParams = {
        type: "ERC20",
        options: {
          address: contract.address,
          symbol,
          decimals: await contract.decimals(),
          image: info ? info.logoURI : "",
        },
      };
      web3.currentProvider.sendAsync(
        {
          method: "metamask_watchAsset",
          params: methodParams,
        },
        console.log,
      );
    } catch (e) {
      console.log("ADD LOGO: ", e);
    }
  };

  return (
    <Card>
      <Tooltip title="Send ERC-20 tokens">
        <div>
          <Row>
            <Col
              span={8}
              style={{
                textAlign: "left",
                opacity: 0.333,
                paddingRight: 8,
                fontSize: 24,
              }}
            >
              Balance:
            </Col>
            <Col span={12}>
              <TokenBalance name={name} img={"🎈"} address={props.address} contracts={props.readContracts} />
            </Col>
            <Col
              span={4}
              style={{
                textAlign: "right",
                paddingLeft: 32,
                fontSize: 24,
              }}
            >
              <a href="#" title="Add to Metamask" onClick={() => addLogo()}>
                🦊
              </a>
            </Col>
          </Row>
        </div>
        <div>
          {props.address && props.showQR && (
            <QR
              value={props.address}
              size={450}
              level="H"
              includeMargin
              renderAs="svg"
              imageSettings={{ excavate: false }}
            />
          )}
        </div>
        <div>
          <AddressInput
            autoFocus
            ensProvider={props.ensProvider}
            placeholder="to address"
            address={toAddress}
            onChange={setToAddress}
          />
        </div>
        <div>
          <EtherInput
            price={props.price}
            value={amount}
            placeholder="Amount of tokens"
            onChange={value => {
              setAmount(value);
            }}
          />
        </div>
        <div style={{ textAlign: "right", marginTop: 7 }}>
          <Button key="submit" type="primary" disabled={!amount || !toAddress} loading={false} onClick={sendTokens}>
            <SendOutlined /> Send
          </Button>
        </div>
      </Tooltip>
    </Card>
  );
}
