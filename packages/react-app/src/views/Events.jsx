import React from "react";
import { Divider, List } from "antd";
import { Address } from "../components";

const { ethers } = require("ethers");

export default function Events({ transferEvents, actionEvents }) {
  return (
    <>
      <h2>Events</h2>
      <div style={{ width: 600, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
        <List
          bordered
          dataSource={transferEvents}
          renderItem={item => {
            return (
              <List.Item key={item[0] + "_" + item[1] + "_" + item.blockNumber + "_" + item[2].toNumber()}>
                <span style={{ fontSize: 16, marginRight: 8 }}>#{item[2].toNumber()}</span>
                <Address address={item[0]} fontSize={16} /> =&gt;
                <Address address={item[1]} fontSize={16} />
              </List.Item>
            );
          }}
        />
      </div>
      <Divider />
      <div style={{ width: 600, margin: "auto", marginTop: 8, paddingBottom: 32 }}>
        <List
          bordered
          dataSource={actionEvents}
          renderItem={item => {
            return (
              <List.Item key={item[0] + "_" + item.action + "_" + item.blockNumber + "_" + item[1].toNumber()}>
                <span style={{ fontSize: 16, marginRight: 8, textAlign: "right" }}>#{item[1].toNumber()}</span>
                <Address address={item[0]} fontSize={16} />
                <span style={{ fontSize: 16 }}>{item.action}</span>
                <span style={{ fontSize: 16 }}>{ethers.utils.formatEther(item[3])}</span>
              </List.Item>
            );
          }}
        />
      </div>
    </>
  );
}
