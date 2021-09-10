import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth" target="_blank" rel="noopener noreferrer">
      <PageHeader title="💰 InstaWallet" style={{ cursor: "pointer" }} />
    </a>
  );
}
