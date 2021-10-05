import React, { useState } from "react";
import { SendOutlined } from "@ant-design/icons";
import { Button, Tooltip, Card } from "antd";
import QR from "qrcode.react";
import { useContractLoader } from "../hooks";
import { Transactor } from "../helpers";
import AddressInput from "./AddressInput";
import EtherInput from "./EtherInput";
import TokenBalance from "./TokenBalance";
import { useTokenList } from "../hooks";

import { utils } from "ethers";

/*
  ~ What it does? ~

  Displays a wallet where you can specify address and send token, with options to
  scan address, to see and generate private keys,
  to send, receive and extract the burner wallet

  ~ How can I use? ~

  <TokenWallet
    name={tokenName}
    address={address}
    signer={userSigner}
    provider={localProvider}
    readContracts={readContracts}
    gasPrice={gasPrice}
    chainId={localChainId}
    showQR={true}
    color={currentTheme === "light" ? "#1890ff" : "#2caad9"}
  />

  ~ Features ~

  - Provide signer={userSigner} to sign transactions
  - Provide provider={localProvider} to display a wallet
  - Provide address={address} if you want to specify address, otherwise
    your default address will be used
  - Provide showQR={true} to show wallet address QR code
  - Provide price={price} of ether and easily convert between USD and ETH
  - Provide color to specify the color of wallet icon
*/

const DEBUG = true;
const logoURI = "https://via.placeholder.com/32.png";

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

  return (
    <Card>
      <Tooltip title="Send ERC-20 tokens">
        <div>
          <TokenBalance
            name={name}
            img={"💰"}
            suffix={"tokens"}
            address={props.address}
            contracts={props.readContracts}
          />
        </div>
        <div>
          {props.address && props.showQR && (
            <QR
              value={props.address}
              size={420}
              level="H"
              includeMargin
              renderAs="svg"
              imageSettings={{ src: logoURI, excavate: false, height: 32, width: 32 }}
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
