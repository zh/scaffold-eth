import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/multi-wallet" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="Kaleido Wallet"
        style={{ cursor: "pointer" }}
        avatar={{
          src: "kaleido.png",
          shape: "circle",
        }}
      />
    </a>
  );
}
