import React, { useState } from "react";
import { ethers } from "ethers";
import { Card, Row, Col, Input, Divider } from "antd";
import { useBalance } from "./hooks";
import { Address, TokenBalance } from "./components";
import { notification } from "antd";
import { parseJsonMessage } from "./helpers";
import Curve from "./Curve";

export default function DEX(props) {
  const [values, setValues] = useState({});
  const contractAddress = props.readContracts[props.contractName].address;
  const contractBalance = useBalance(props.provider, contractAddress);
  if (!contractBalance || !props.liquidity || !props.tokenBalance) return null;
  const dexBalanceFloat = parseFloat(ethers.utils.formatEther(contractBalance));

  const rowForm = (label, title, icon, onClick) => {
    return (
      <Row>
        <Col span={8} style={{ textAlign: "right", opacity: 0.333, paddingRight: 6, fontSize: 24 }}>
          {label}
        </Col>
        <Col span={16}>
          <div style={{ cursor: "pointer", margin: 2 }}>
            <Input
              onChange={e => {
                let newValues = { ...values };
                newValues[title] = e.target.value;
                setValues(newValues);
              }}
              value={values[title]}
              addonAfter={
                <div
                  type="default"
                  onClick={() => {
                    onClick(values[title]);
                    let newValues = { ...values };
                    newValues[title] = "";
                    setValues(newValues);
                  }}
                >
                  {icon}
                </div>
              }
            />
          </div>
        </Col>
      </Row>
    );
  };

  let display = [];
  display.push(
    <div>
      {rowForm(`Buy (${props.coinName})`, "buyToken", "💸", async value => {
        const valueInEther = ethers.utils.parseEther("" + value);
        const contract = props.writeContracts[props.contractName];
        try {
          const result = await contract.buyToken({
            value: valueInEther,
          });
          notification.info({
            message: "Transaction Sent",
            description: result.hash,
            placement: "bottomRight",
          });
        } catch (e) {
          const message = parseJsonMessage(e);
          console.log("buy token error: ", message);
          notification.error({
            message: "Transaction Error",
            description: message,
          });
        }
      })}
      {rowForm("Sell (amount)", "sellToken", "🔏", async value => {
        const valueInEther = ethers.utils.parseEther("" + value);
        const contract = props.writeContracts[props.contractName];
        const token = props.writeContracts[props.tokenName];
        try {
          let allowance = await token.allowance(props.address, contract.address);
          // allow more value
          if (allowance.lt(valueInEther)) {
            await token.approve(contract.address, valueInEther);
          }
          allowance = await token.allowance(props.address, contract.address);
          const result = await contract.sellToken(valueInEther);
          notification.info({
            message: "Transaction Sent",
            description: result.hash,
            placement: "bottomRight",
          });
        } catch (e) {
          const message = parseJsonMessage(e);
          console.log("sell token error: ", message);
          notification.error({
            message: "Transaction Error",
            description: message,
          });
        }
      })}
      <Divider>
        Your Liquidity: ({props.liquidity ? ethers.utils.formatEther(props.liquidity) : "none"} {props.coinName})
      </Divider>
      {rowForm(`Deposit (${props.coinName})`, "deposit", "📥", async value => {
        const valueInEther = ethers.utils.parseEther("" + value);
        const valuePlusExtra = ethers.utils.parseEther("" + value * 1.03);
        const contract = props.writeContracts[props.contractName];
        const token = props.writeContracts[props.tokenName];
        try {
          const allowance = await token.allowance(props.address, contract.address);
          if (allowance.lt(valuePlusExtra)) {
            await token.approve(contract.address, valuePlusExtra);
          }
          const result = await contract.deposit({
            value: valueInEther,
          });
          notification.info({
            message: "Transaction Sent",
            description: result.hash,
            placement: "bottomRight",
          });
        } catch (e) {
          const message = parseJsonMessage(e);
          console.log("deposit error: ", message);
          notification.error({
            message: "Transaction Error",
            description: message,
          });
        }
      })}
      {rowForm(`Withdraw (${props.coinName})`, "withdraw", "📤", async value => {
        const valueInEther = ethers.utils.parseEther("" + value);
        const contract = props.writeContracts[props.contractName];
        try {
          const result = await contract.withdraw(valueInEther);
          notification.info({
            message: "Transaction Sent",
            description: result.hash,
            placement: "bottomRight",
          });
        } catch (e) {
          const message = parseJsonMessage(e);
          console.log("withdraw error: ", message);
          notification.error({
            message: "Transaction Error",
            description: message,
          });
        }
      })}
    </div>,
  );

  return (
    <div style={{ padding: 10 }}>
      <div style={{ position: "fixed", right: 0, top: 110, padding: 10 }}>
        <Curve
          coinName={props.coinName}
          removingToken={values && (values["buyToken"] || 0)}
          addingToken={values && (values["sellToken"] || 0)}
          dexReserve={dexBalanceFloat}
          tokenReserve={props.tokenBalance}
          width={540}
          height={540}
        />
      </div>
      <Card
        title={
          <div>
            <Address value={contractAddress} />
            <div style={{ float: "right", fontSize: 24 }}>
              {parseFloat(ethers.utils.formatEther(contractBalance)).toFixed(4)} {props.coinName} ⚖️
              <TokenBalance
                name={props.tokenName}
                img={"💰"}
                address={contractAddress}
                contracts={props.readContracts}
              />
            </div>
          </div>
        }
        size="large"
        style={{ width: 640, marginTop: 25 }}
        loading={false}
      >
        {display}
      </Card>
    </div>
  );
}
