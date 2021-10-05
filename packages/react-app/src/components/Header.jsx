import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/staker" target="_blank" rel="noopener noreferrer">
      <PageHeader title="Staker" subTitle="simple funding" style={{ cursor: "pointer" }} />
    </a>
  );
}
