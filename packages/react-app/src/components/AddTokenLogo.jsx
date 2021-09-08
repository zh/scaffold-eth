import React, { useState } from "react";
import { Input, Row, Col } from "antd";

// const { utils } = require("ethers");

export default function Balance(props) {
  const [url, setUrl] = useState("");

  const addLogo = async () => {
    const { contract } = props;
    const methodParams = {
      type: "ERC20",
      options: {
        address: contract.address,
        symbol: await contract.symbol(),
        decimals: await contract.decimals(),
        image: url,
      },
    };
    web3.currentProvider.sendAsync(
      {
        method: "metamask_watchAsset",
        params: methodParams,
      },
      console.log,
    );
    console.log(props.provider);
  };

  const handleChange = e => {
    const { value } = e.target;
    if (value !== "") {
      setUrl(value);
    }
  };

  return (
    <div>
      <Row>
        <Col
          span={8}
          style={{
            textAlign: "right",
            opacity: 0.333,
            paddingRight: 6,
            fontSize: 24,
          }}
        >
          Token Logo URL
        </Col>
        <Col span={14}>
          <Input
            size="large"
            placeholder={"http://..."}
            autoComplete="off"
            onChange={handleChange}
            onPressEnter={() => addLogo()}
          />
        </Col>
        <Col span={2}>
          <h2>
            <a href="#" onClick={() => addLogo()}>
              🦊
            </a>
          </h2>
        </Col>
      </Row>
    </div>
  );
}
