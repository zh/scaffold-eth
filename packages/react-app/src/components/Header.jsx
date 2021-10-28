import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/fuji-smart-lock" target="_blank" rel="noopener noreferrer">
      <PageHeader title="🔒 SmartLock" subTitle="rent with EVM contracts" style={{ cursor: "pointer" }} />
    </a>
  );
}
