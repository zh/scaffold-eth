import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth" target="_blank" rel="noopener noreferrer">
      <PageHeader title="🎈 ERC-20 Wallet" style={{ cursor: "pointer" }} />
    </a>
  );
}
