import { useTokenBalance } from "eth-hooks";
import React, { useState } from "react";

import { utils } from "ethers";

/*
  ~ What it does? ~

  Displays a token balance of given address

  ~ How can I use? ~

  <TokenBalance
    name={name}
    img={"💰"}
    suffix={"tokens"}
    address={props.address}
    contracts={props.readContracts}
    fontSize={24}
  />

  ~ Features ~

  - Provide name={name} token contract name
  - Provide address={address} and get balance corresponding to given address
  - Provide img={"some image"} - optional image, token logo
  - Provide suffict ={"some suffix"} - optional suffix (like ' YTK')
  - Provide contracts={readContracts} - loaded contracts to read from
  - Provide fontSize={24} - optional fontSize
*/

export default function TokenBalance(props) {
  const [dollarMode, setDollarMode] = useState(true);

  const tokenContract = props.contracts && props.contracts[props.name];
  const balance = useTokenBalance(tokenContract, props.address, 1777);

  let floatBalance = parseFloat("0.00");

  let usingBalance = balance;

  if (typeof props.balance !== "undefined") {
    usingBalance = props.balance;
  }

  if (usingBalance) {
    const etherBalance = utils.formatEther(usingBalance);
    parseFloat(etherBalance).toFixed(2);
    floatBalance = parseFloat(etherBalance);
  }

  let displayBalance = floatBalance.toFixed(4);

  if (props.dollarMultiplier && dollarMode) {
    displayBalance = "$" + (floatBalance * props.dollarMultiplier).toFixed(2);
  }

  return (
    <span
      style={{
        verticalAlign: "middle",
        fontSize: props.fontSize || 24,
        padding: 8,
        cursor: "pointer",
      }}
      onClick={() => {
        setDollarMode(!dollarMode);
      }}
    >
      {props.img} {displayBalance} {props.suffix}
    </span>
  );
}
