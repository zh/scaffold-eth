import React, { useEffect, useState } from "react";
import { Button, Card, Spin, Input, Row, Col, Typography } from "antd";
import { IPFS_GATEWAY } from "../constants";

const { BufferList } = require("bl");
const { Text } = Typography;

export default function Mint({ address, tx, contractName, writeContracts }) {
  const ipfsAPI = require("ipfs-http-client");
  const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

  if (!address || !tx || !contractName || !writeContracts) return null;

  const [sending, setSending] = useState();
  const [ipfsHash, setIpfsHash] = useState();
  const [ipfsContents, setIpfsContents] = useState();
  const [buffer, setBuffer] = useState();
  const [selectedFile, setSelectedFile] = useState();
  const [isSelected, setIsSelected] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [unixDate, setUnixDate] = useState(0);

  const getFromIPFS = async hashToGet => {
    for await (const file of ipfs.get(hashToGet)) {
      console.log(file.path);
      if (!file.content) continue;
      const content = new BufferList();
      for await (const chunk of file.content) {
        content.append(chunk);
      }
      console.log(content);
      return content;
    }
  };

  const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const mintIPFSAsset = async asset => {
    const upload = await ipfs.add(JSON.stringify(asset));
    console.log("Media CID: ", ipfsHash);
    console.log("Metadata CID: ", upload.path);
    await sleep(1000);
    tx(writeContracts[contractName].mintItem(address, ipfsHash, upload.path));
  };

  const addToIPFS = async fileToUpload => {
    const result = await ipfs.add(fileToUpload);
    return result;
  };

  const asyncGetFile = async () => {
    let result = await getFromIPFS(ipfsHash);
    setIpfsContents(result.toString());
  };

  useEffect(() => {
    if (ipfsHash) asyncGetFile();
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
          <div style={{ textAlign: "center", margin: "15px" }}>
            <div style={{ textAlign: "center" }}>
              <Card>
                <Input type="file" accept="image/*" onChange={changeHandler} />
              </Card>
            </div>
            <div style={{ textAlign: "left" }}>
              <Card>
                <h4>Media Viewer:</h4>
                {ipfsDisplay}
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
                setIpfsContents();
                const result = await addToIPFS(buffer);
                if (result && result.path) {
                  setIpfsHash(result.path);
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
        </Col>
      </Row>
      {ipfsHash && (
        <Row gutter={[32, 32]} justify="center">
          <Col span="14">
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
