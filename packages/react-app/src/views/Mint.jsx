import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Button, Card, Divider, Spin, Input, Row, Col, Typography } from "antd";
import { IPFS_GATEWAY } from "../constants";
import { ipfs, getFromIPFS, addToIPFS } from "../helpers/ipfsFunctions";

const { Text } = Typography;

export default function Mint({ address, tx, contractName, writeContracts, gasPrice }) {
  if (!address || !tx || !contractName || !writeContracts) return null;

  const history = useHistory();
  const [sending, setSending] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [mediaHash, setMediaHash] = useState();
  const [ipfsContents, setIpfsContents] = useState();
  const [buffer, setBuffer] = useState();
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unixDate, setUnixDate] = useState(0);

  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const mintIPFSAsset = async asset => {
    const upload = await ipfs.add(JSON.stringify(asset));
    console.log("Media CID: ", ipfsHash);
    console.log("Metadata CID: ", upload.path);
    await sleep(1000);
    tx(writeContracts[contractName].mintItem(address, ipfsHash, upload.path, { gasPrice }));
    history.replace("/owner");
  };

  const asyncGetFile = async () => {
    const result = await getFromIPFS(ipfsHash);
    setIpfsContents(result.toString());
  };

  useEffect(() => {
    try {
      if (ipfsHash) asyncGetFile();
    } catch (e) {
      console.log(e);
    }
  }, [ipfsHash]);

  let ipfsDisplay = <p>{""}</p>;
  if (ipfsHash) {
    if (!ipfsContents) {
      ipfsDisplay = <Spin />;
    } else {
      ipfsDisplay = (
        <div style={{ textAlign: "center" }}>
          <img src={IPFS_GATEWAY + ipfsHash} style={{ width: "300px" }} />
        </div>
      );
    }
  }

  const changeHandler = async event => {
    setIpfsContents();
    setSelectedFile(event.target.files[0]);
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      setBuffer(Buffer(reader.result));
    };
    setIsSelected(true);
  };

  return (
    <>
      <h1 style={{ textAlign: "center", color: "#455A64" }}>Mint Token</h1>
      <Row gutter={[32, 32]} justify="center">
        <Col span="14">
          <h3 style={{ textAlign: "center", color: "#455A64" }}>Upload file</h3>
          <div style={{ textAlign: "center", margin: "15px" }}>
            <div style={{ textAlign: "center" }}>
              <Card>
                <Input type="file" accept="image/*" onChange={changeHandler} />
              </Card>
            </div>
            <Button
              style={{ margin: 16 }}
              loading={sending}
              disabled={!selectedFile}
              size="large"
              shape="round"
              type="primary"
              onClick={async () => {
                console.log("UPLOADING MEDIA...");
                setSending(true);
                setIpfsHash();
                setMediaHash();
                setIpfsContents();
                const result = await addToIPFS(buffer);
                if (result && result.path) {
                  setIpfsHash(result.path);
                  setMediaHash(result.path);
                }
                setSending(false);
              }}
            >
              Upload Media
            </Button>
            {isSelected ? (
              <div>
                <div>Filename: {selectedFile.name}</div>
                <div>Filetype: {selectedFile.type}</div>
                <div>Size in bytes: {selectedFile.size}</div>
              </div>
            ) : (
              <p>Select a file to show details</p>
            )}
          </div>
          <Divider />
          <h3 style={{ textAlign: "center", color: "#455A64" }}>Use existing hash</h3>
          <div style={{ textAlign: "center", margin: "15px" }}>
            <div style={{ textAlign: "center" }}>
              <Card>
                <h4>Media CID:</h4>
                <Input
                  copyable={{ text: ipfsHash }}
                  onChange={e => {
                    setMediaHash(e.target.value);
                    setIpfsContents();
                  }}
                  value={mediaHash}
                  pattern="Qm..."
                />
                <Button
                  style={{ margin: 16 }}
                  loading={sending}
                  disabled={!mediaHash}
                  size="large"
                  shape="round"
                  type="primary"
                  onClick={() => {
                    setIpfsHash(mediaHash);
                  }}
                >
                  Show Media
                </Button>
              </Card>
            </div>
          </div>
          <div style={{ textAlign: "center", margin: "15px" }}>
            <div style={{ textAlign: "left" }}>
              <Card>
                <h4>Media Viewer:</h4>
                {ipfsDisplay}
              </Card>
            </div>
          </div>
        </Col>
      </Row>
      {ipfsHash && (
        <Row gutter={[32, 32]} justify="center">
          <Col span="14">
            <h3 style={{ textAlign: "center", color: "#455A64" }}>Upload metadata</h3>
            <div style={{ textAlign: "left", margin: "15px" }}>
              <Card>
                <h4>
                  Media CID:{" "}
                  <Text copyable={{ text: ipfsHash }} style={{ margin: "12px", color: "#1890ff" }}>
                    {ipfsHash}
                  </Text>
                </h4>
                <h4>Name:</h4>
                <Input
                  onChange={e => {
                    setName(e.target.value);
                  }}
                  style={{ margin: "12px" }}
                  placeholder="Name"
                />
                <h4>Description:</h4>
                <Input
                  onChange={e => {
                    setDescription(e.target.value);
                  }}
                  style={{ margin: "12px" }}
                  placeholder="Description"
                />
              </Card>
              <Card style={{ background: "#e4e4e4" }}>
                <h4>Timestamp</h4>
                <Input
                  onChange={e => {
                    setUnixDate(Date.now());
                  }}
                  value={unixDate}
                  style={{ width: "175px" }}
                />
                <Button
                  onClick={e => {
                    var timestamp = new Date(Date.now());
                    setUnixDate(timestamp);
                  }}
                >
                  now
                </Button>
              </Card>
            </div>

            <Button
              onClick={async () => {
                const asset = {
                  name,
                  description,
                  image: `${IPFS_GATEWAY}${ipfsHash}`,
                  attributes: [
                    {
                      trait_type: "Area",
                      value: "experiments",
                    },
                    {
                      trait_type: "Timestamp",
                      value: unixDate,
                    },
                  ],
                };
                await mintIPFSAsset(asset);
              }}
              disabled={!name || !description || !unixDate}
              size="large"
              shape="round"
              type="primary"
              style={{ background: "#ff7875", borderColor: "#bae7ff", margin: "32px" }}
            >
              Mint Token
            </Button>
          </Col>
        </Row>
      )}
    </>
  );
}
