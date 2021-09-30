import { DollarCircleOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd";
import React, { useState } from "react";

// added display of 0 if price={price} is not provided

/*
  ~ What it does? ~

  Displays current coin price and link to faucets (TODO)

  ~ How can I use? ~

  <Ramp
    price={price}
    address={address}
  />

  ~ Features ~

  - Ramp opens directly in the application, component uses RampInstantSDK
  - Provide price={price} and current coin price will be displayed
  - Provide address={address} and your address will be pasted into Wyre/Ramp instantly
*/

export default function Ramp(props) {
  const [modalUp, setModalUp] = useState("down");

  return (
    <div>
      <Button
        size="large"
        shape="round"
        onClick={() => {
          setModalUp("up");
        }}
      >
        <DollarCircleOutlined style={{ color: "#52c41a" }} />{" "}
        {typeof props.price === "undefined" ? 0 : props.price.toFixed(2)}
      </Button>
      <Modal
        title="Faucets (TODO)"
        visible={modalUp === "up"}
        onCancel={() => {
          setModalUp("down");
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setModalUp("down");
            }}
          >
            cancel
          </Button>,
        ]}
      >
        Add faucets here
      </Modal>
    </div>
  );
}
