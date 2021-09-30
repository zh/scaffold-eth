import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/fantom-wallet" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="FTM Wallet"
        style={{ cursor: "pointer" }}
        avatar={{
          src: "https://assets.coingecko.com/coins/images/4001/small/Fantom.png",
          shape: "square",
        }}
      />
    </a>
  );
}
