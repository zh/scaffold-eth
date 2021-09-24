import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/ava-wallet" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="AVAX wallet"
        style={{ cursor: "pointer" }}
        avatar={{
          src: "https://wallet.avax.network/img/avax_icon_circle.png",
          shape: "circle",
        }}
      />
    </a>
  );
}
