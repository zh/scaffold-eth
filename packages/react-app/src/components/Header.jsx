import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/smartbch" target="_blank" rel="noopener noreferrer">
      <PageHeader title="scaffold-bch" subTitle="forkable SmartBCH dev stack" style={{ cursor: "pointer" }} />
    </a>
  );
}
