import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/multi-evm" target="_blank" rel="noopener noreferrer">
      <PageHeader title="NFT Market" subTitle="mint/sell/buy ERC-721 tokens" style={{ cursor: "pointer" }} />
    </a>
  );
}
