import React, { useState, useEffect } from "react";
import { SendOutlined } from "@ant-design/icons";
import { Button, Card } from "antd";
import { ethers } from "ethers";
import QR from "qrcode.react";
import { Transactor } from "../helpers";
import Balance from "./Balance";
import AddressInput from "./AddressInput";
import EtherInput from "./EtherInput";

const logoURI = "https://i.postimg.cc/BQFCcgdz/eth-logo.png";

export default function BigWallet(props) {
  const coinName = props.coin || "ETH";
  const [amount, setAmount] = useState();
  const [toAddress, setToAddress] = useState();

  const [signerAddress, setSignerAddress] = useState();
  useEffect(() => {
    async function getAddress() {
      if (props.signer) {
        const newAddress = await props.signer.getAddress();
        setSignerAddress(newAddress);
      }
    }
    getAddress();
  }, [props.signer]);

  const selectedAddress = props.address || signerAddress;

  return (
    <Card>
      <div style={{ textAlign: "center" }}>
        <Balance suffix={coinName} size={48} address={selectedAddress} provider={props.provider} price={props.price} />
      </div>
      <div>
        {selectedAddress && (
          <QR
            value={selectedAddress}
            size={450}
            level="H"
            includeMargin
            renderAs="svg"
            imageSettings={{ src: logoURI, excavate: true, height: 48, width: 48 }}
          />
        )}
      </div>
      <div style={{ paddingLeft: 30 }}>
        <div style={{ padding: 10 }} key="address">
          <AddressInput
            autoFocus
            ensProvider={props.ensProvider}
            placeholder="to address"
            address={toAddress}
            onChange={setToAddress}
          />
        </div>
        <div style={{ padding: 10 }} key="ether">
          <EtherInput
            price={props.price}
            coin={coinName}
            value={amount}
            onChange={value => {
              setAmount(value);
            }}
          />
        </div>
        <div style={{ textAlign: "center", marginTop: 7 }}>
          <Button
            key="submit"
            type="primary"
            disabled={!selectedAddress || !amount || !toAddress}
            loading={false}
            onClick={() => {
              const tx = Transactor(props.signer || props.provider);

              let value;
              try {
                value = ethers.utils.parseEther("" + amount);
              } catch (e) {
                // failed to parseEther, try something else
                value = ethers.utils.parseEther("" + parseFloat(amount).toFixed(8));
              }

              tx({
                to: toAddress,
                value,
                gasPrice: props.gasPrice,
              });
            }}
          >
            <SendOutlined /> Send
          </Button>
        </div>
      </div>
    </Card>
  );
}
