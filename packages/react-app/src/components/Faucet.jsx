import { SendOutlined } from "@ant-design/icons";
import { Button, Input, Tooltip } from "antd";
import React, { useCallback, useState, useEffect } from "react";
import Blockies from "react-blockies";
import { Transactor } from "../helpers";
import Wallet from "./Wallet";

const { utils } = require("ethers");

// improved a bit by converting address to ens if it exists
// added option to directly input ens name
// added placeholder option

/*
  ~ What it does? ~

  Displays a local faucet to send ETH to given address, also wallet is provided

  ~ How can I use? ~

  <Faucet
    price={price}
    coin={coin}
    localProvider={localProvider}
    placeholder={"Send local faucet"}
  />

  ~ Features ~

  - Provide price={price} of ether and convert between USD and ETH in a wallet
  - Provide coin={coin} blockchain main coin name - ETH, BCH, FTM etc.
  - Provide localProvider={localProvider} to be able to send ETH to given address
  - Provide placeholder="Send local faucet" value for the input
*/

export default function Faucet(props) {
  const coinName = props.coin || "ETH";
  const [address, setAddress] = useState();
  const [faucetAddress, setFaucetAddress] = useState();

  useEffect(() => {
    const getFaucetAddress = async () => {
      if (props.localProvider) {
        const _faucetAddress = await props.localProvider.listAccounts();
        setFaucetAddress(_faucetAddress[0]);
        if (props.signer) {
          const _address = await props.signer.getAddress();
          setAddress(_address);
        }
      }
    };
    getFaucetAddress();
  }, [props.localProvider, props.signer]);

  let blockie;
  if (address && typeof address.toLowerCase === "function") {
    blockie = <Blockies seed={address.toLowerCase()} size={8} scale={4} />;
  } else {
    blockie = <div />;
  }

  const updateAddress = useCallback(
    async newValue => {
      if (typeof newValue !== "undefined") {
        setAddress(newValue);
      }
    },
    [props.onChange],
  );

  const tx = Transactor(props.localProvider);

  return (
    <span>
      <Input
        size="large"
        placeholder={props.placeholder ? props.placeholder : "local faucet"}
        prefix={blockie}
        value={address}
        onChange={e => {
          // setAddress(e.target.value);
          updateAddress(e.target.value);
        }}
        suffix={
          <Tooltip title="Faucet: Send local ether to an address.">
            <Button
              disabled={address === ""}
              onClick={() => {
                tx({
                  to: address,
                  value: utils.parseEther("1.0"),
                });
                setAddress("");
              }}
              shape="circle"
              icon={<SendOutlined />}
            />
            <Wallet
              color="#888888"
              provider={props.localProvider}
              coin={coinName}
              price={props.price}
              address={faucetAddress}
            />
          </Tooltip>
        }
      />
    </span>
  );
}
