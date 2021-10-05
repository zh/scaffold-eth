import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/token-vendor" target="_blank" rel="noopener noreferrer">
      <PageHeader title="scaffold-multi" subTitle="ERC-20 Vendor example" style={{ cursor: "pointer" }} />
    </a>
  );
}
