import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/multi-20" target="_blank" rel="noopener noreferrer">
      <PageHeader title="scaffold-multi" subTitle="ERC-20 example" style={{ cursor: "pointer" }} />
    </a>
  );
}
