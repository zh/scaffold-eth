import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/multi-evm" target="_blank" rel="noopener noreferrer">
      <PageHeader title="scaffold-multi" subTitle="forkable EVM dev stack" style={{ cursor: "pointer" }} />
    </a>
  );
}
