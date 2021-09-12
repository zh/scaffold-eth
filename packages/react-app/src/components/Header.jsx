import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/zh/scaffold-eth/tree/sep-20" target="_blank" rel="noopener noreferrer">
      <PageHeader title="scaffold-bch" subTitle="SEP-20 token example" style={{ cursor: "pointer" }} />
    </a>
  );
}
