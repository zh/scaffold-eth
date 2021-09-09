import React, { useState, useEffect } from "react";
import { SendOutlined } from "@ant-design/icons";
import { Button, Col, Row, Tooltip, Card } from "antd";
import { utils } from "ethers";
import { useContractLoader } from "../hooks";
import { Transactor } from "../helpers";
import AddressInput from "./AddressInput";
import EtherInput from "./EtherInput";
import TokenBalance from "./TokenBalance";

const DEBUG = true;

export default function TokenWallet(props) {
  const [amount, setAmount] = useState();
  const [toAddress, setToAddress] = useState();
  const { name, provider, chainId } = props;

  const contracts = useContractLoader(provider, { chainId });
  const contract = contracts ? contracts[name] : "";

  const sendTokens = async () => {
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

      if (DEBUG) console.log("RESULT:", result);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Card>
      <Tooltip title="Send ERC-20 tokens">
        <div>
          <Row>
            <Col
              style={{
                textAlign: "left",
                opacity: 0.333,
                paddingRight: 8,
                fontSize: 24,
              }}
            >
              Balance:
            </Col>
            <Col>
              <TokenBalance name={"ScaffoldToken"} img={"🎈"} address={props.address} contracts={props.readContracts} />
            </Col>
          </Row>
        </div>
        <div>
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
