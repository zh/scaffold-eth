import WalletConnectProvider from "@walletconnect/web3-provider";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Button, Card, Input, List, Menu, Col, Row } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState } from "react";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import {
  Address,
  AddressInput,
  Account,
  Faucet,
  Contract,
  Header,
  NetworkSelect,
  Ramp,
  ThemeSwitch,
} from "./components";
import { GAS_PRICE, FIAT_PRICE, ALCHEMY_KEY, NETWORKS } from "./constants";
import { Transactor } from "./helpers";
import {
  usePoller,
  useContractLoader,
  useContractReader,
  useUserSigner,
  useEventListener,
  useExchangePrice,
} from "./hooks";

const { ethers } = require("ethers");
/*
    Welcome to 🏗 scaffold-multi !

    Code: https://github.com/zh/scaffold-eth , Branch: multi-evm
*/

// 📡 What chain are your contracts deployed to?
// const targetNetwork = NETWORKS.localhost;
// const targetNetwork = NETWORKS.rinkeby;
// const targetNetwork = NETWORKS.polygon;
// const targetNetwork = NETWORKS.mumbai;
// const targetNetwork = NETWORKS.testnetSmartBCH;
// const targetNetwork = NETWORKS.mainnetSmartBCH;
// const targetNetwork = NETWORKS.fujiAvalanche;
// const targetNetwork = NETWORKS.mainnetAvalanche;
// const targetNetwork = NETWORKS.testnetFantom;
// const targetNetwork = NETWORKS.fantomOpera;
// const targetNetwork = NETWORKS.moondev;
// const targetNetwork = NETWORKS.moonbase;
// const targetNetwork = NETWORKS.moonbeam;
// const targetNetwork = NETWORKS.moonriver;
const targetNetwork = NETWORKS.testnetTomo;
// const targetNetwork = NETWORKS.mainnetTomo;
// const targetNetwork = NETWORKS.testnetBSC;
// const targetNetwork = NETWORKS.mainnetBSC;
// const targetNetwork = NETWORKS.bakerloo;
// const targetNetwork = NETWORKS.kaleido;

// 😬 Sorry for all the console logging
const DEBUG = false;

const petName = "Loogies";
const tankName = "LoogieTank";
const coinName = targetNetwork.coin || "ETH";

// 🛰 providers
// 🏠 Your local provider is usually pointed at your local blockchain
let localProviderUrl = targetNetwork.rpcUrl;
if (targetNetwork.user && targetNetwork.pass) {
  localProviderUrl = {
    url: targetNetwork.rpcUrl,
    user: targetNetwork.user,
    password: targetNetwork.pass,
  };
}
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrl);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrl);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        alchemyId: ALCHEMY_KEY,
        rpc: {
          1: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          4: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_KEY}`,
          100: "https://dai.poa.network", // xDai
        },
      },
    },
  },
});

function App(props) {
  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price in fiat */
  const price = FIAT_PRICE ? useExchangePrice(targetNetwork) : 0;

  const gasPrice = targetNetwork.gasPrice || GAS_PRICE;
  // if (DEBUG) console.log("⛽️ Gas price:", gasPrice);
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userSigner = useUserSigner(injectedProvider, localProvider);

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // Just plug in different 🛰 providers to get your balance on different chains:
  // const yourMainnetBalance = useBalance(mainnetProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, { chainId: localChainId });

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // keep track of a variable from the contract in the local React state:
  const loogieBalance = useContractReader(readContracts, petName, "balanceOf", [address]);
  console.log("🤗 loogie balance:", loogieBalance);

  const loogieTankBalance = useContractReader(readContracts, tankName, "balanceOf", [address]);
  console.log("🤗 loogie tank balance:", loogieTankBalance);

  // 📟 Listen for broadcast events
  const loogieTransferEvents = useEventListener(readContracts, petName, "Transfer", localProvider, 1);
  console.log("📟 Loogie Transfer events:", loogieTransferEvents);

  const loogieTankTransferEvents = useEventListener(readContracts, tankName, "Transfer", localProvider, 1);
  console.log("📟 Loogie Tank Transfer events:", loogieTankTransferEvents);

  const yourLoogieBalance = loogieBalance && loogieBalance.toNumber && loogieBalance.toNumber();
  const [yourLoogies, setYourLoogies] = useState();

  const yourLoogieTankBalance = loogieTankBalance && loogieTankBalance.toNumber && loogieTankBalance.toNumber();
  const [yourLoogieTanks, setYourLoogieTanks] = useState();

  const [transferToAddresses, setTransferToAddresses] = useState({});
  const [transferToTankId, setTransferToTankId] = useState({});

  // call every 1500 seconds.
  usePoller(() => {
    updateLoogieTanks();
  }, 1500000);

  async function updateLoogieTanks() {
    const loogieTankUpdate = [];
    for (let tokenIndex = 0; tokenIndex < yourLoogieTankBalance; tokenIndex++) {
      try {
        console.log("Getting token index", tokenIndex);
        const tokenId = await readContracts.LoogieTank.tokenOfOwnerByIndex(address, tokenIndex);
        console.log("tokenId", tokenId);
        const tokenURI = await readContracts.LoogieTank.tokenURI(tokenId);
        console.log("tokenURI", tokenURI);
        const jsonManifestString = atob(tokenURI.substring(29));
        console.log("jsonManifestString", jsonManifestString);

        try {
          const jsonManifest = JSON.parse(jsonManifestString);
          console.log("jsonManifest", jsonManifest);
          loogieTankUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
        } catch (e) {
          console.log(e);
        }
      } catch (e) {
        console.log(e);
      }
    }
    setYourLoogieTanks(loogieTankUpdate.reverse());
  }

  useEffect(() => {
    const updateYourCollectibles = async () => {
      const loogieUpdate = [];
      for (let tokenIndex = 0; tokenIndex < yourLoogieBalance; tokenIndex++) {
        try {
          console.log("Getting token index", tokenIndex);
          const tokenId = await readContracts.Loogies.tokenOfOwnerByIndex(address, tokenIndex);
          console.log("tokenId", tokenId);
          const tokenURI = await readContracts.Loogies.tokenURI(tokenId);
          console.log("tokenURI", tokenURI);
          const jsonManifestString = atob(tokenURI.substring(29));
          console.log("jsonManifestString", jsonManifestString);
          /*
          const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
          console.log("ipfsHash", ipfsHash);
          const jsonManifestBuffer = await getFromIPFS(ipfsHash);
          */
          try {
            const jsonManifest = JSON.parse(jsonManifestString);
            console.log("jsonManifest", jsonManifest);
            loogieUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
          } catch (e) {
            console.log(e);
          }
        } catch (e) {
          console.log(e);
        }
      }
      setYourLoogies(loogieUpdate.reverse());
      updateLoogieTanks();
    };
    updateYourCollectibles();
  }, [address, yourLoogieBalance, yourLoogieTankBalance]);

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      address &&
      selectedChainId &&
      yourLoogieBalance &&
      yourLoogieTankBalance &&
      readContracts &&
      writeContracts
    ) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLoogiesBalance", yourLoogieBalance ? ethers.utils.formatEther(yourLoogieBalance) : "...");
      console.log(
        "💵 yourLoogiesBalance",
        yourLoogieTankBalance ? ethers.utils.formatEther(yourLoogieTankBalance) : "...",
      );
      console.log("📝 readContracts", readContracts);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [address, selectedChainId, yourLoogieBalance, yourLoogieTankBalance, readContracts, writeContracts]);

  const loadWeb3Modal = useCallback(async () => {
    try {
      const provider = await web3Modal.connect();
      setInjectedProvider(new ethers.providers.Web3Provider(provider));

      provider.on("chainChanged", chainId => {
        console.log(`chain changed to ${chainId}! updating providers`);
        setInjectedProvider(new ethers.providers.Web3Provider(provider));
      });

      provider.on("accountsChanged", () => {
        console.log(`account changed!`);
        setInjectedProvider(new ethers.providers.Web3Provider(provider));
      });

      // Subscribe to session disconnection
      provider.on("disconnect", (code, reason) => {
        console.log(code, reason);
        logoutOfWeb3Modal();
      });
    } catch (e) {
      console.log(`Wev3Modal error: ${e}`);
    }
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  useThemeSwitcher();

  return (
    <div className="App">
      {/* ✏️ Edit the header and change the title to your project name */}
      <Header />
      <NetworkSelect targetNetwork={targetNetwork} localChainId={localChainId} selectedChainId={selectedChainId} />
      <HashRouter>
        <Menu style={{ textAlign: "center" }} selectedKeys={[route]} mode="horizontal">
          <Menu.Item key="/">
            <Link
              onClick={() => {
                setRoute("/");
              }}
              to="/"
            >
              Pets
            </Link>
          </Menu.Item>
          <Menu.Item key="/tank">
            <Link
              onClick={() => {
                setRoute("/tank");
              }}
              to="/tank"
            >
              Tanks
            </Link>
          </Menu.Item>
          <Menu.Item key="/debugpet">
            <Link
              onClick={() => {
                setRoute("/debugpet");
              }}
              to="/debugpet"
            >
              Debug Pet
            </Link>
          </Menu.Item>
          <Menu.Item key="/debugtank">
            <Link
              onClick={() => {
                setRoute("/debugtank");
              }}
              to="/debugtank"
            >
              Debug Tank
            </Link>
          </Menu.Item>
        </Menu>
        <Switch>
          <Route exact path="/">
            <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <Button
                type={"primary"}
                onClick={() => {
                  tx(writeContracts.Loogies.mintItem());
                }}
              >
                Mint Pet
              </Button>
            </div>
            {/* */}
            <div style={{ width: 820, margin: "auto", paddingBottom: 256 }}>
              <List
                bordered
                dataSource={yourLoogies}
                renderItem={item => {
                  const id = item.id.toNumber();

                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                          </div>
                        }
                      >
                        <img src={item.image} />
                        <div>{item.description}</div>
                      </Card>

                      <div>
                        owner:
                        <Address address={item.owner} blockExplorer={blockExplorer} fontSize={16} />
                        <AddressInput
                          placeholder="transfer to address"
                          value={transferToAddresses[id]}
                          onChange={newValue => {
                            const update = {};
                            update[id] = newValue;
                            setTransferToAddresses({ ...transferToAddresses, ...update });
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log("writeContracts", writeContracts);
                            tx(writeContracts.Loogies.transferFrom(address, transferToAddresses[id], id));
                          }}
                        >
                          Transfer
                        </Button>
                        <br />
                        <br />
                        Transfer to Tank:{" "}
                        <Address
                          address={readContracts.LoogieTank.address}
                          blockExplorer={blockExplorer}
                          fontSize={16}
                        />
                        <Input
                          placeholder="Tank ID"
                          // value={transferToTankId[id]}
                          onChange={newValue => {
                            console.log("newValue", newValue.target.value);
                            const update = {};
                            update[id] = newValue.target.value;
                            setTransferToTankId({ ...transferToTankId, ...update });
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log("writeContracts", writeContracts);
                            console.log("transferToTankId[id]", transferToTankId[id]);
                            console.log(parseInt(transferToTankId[id]));

                            const tankIdInBytes = "0x" + parseInt(transferToTankId[id]).toString(16).padStart(64, "0");
                            console.log(tankIdInBytes);

                            tx(
                              writeContracts.Loogies["safeTransferFrom(address,address,uint256,bytes)"](
                                address,
                                readContracts.LoogieTank.address,
                                id,
                                tankIdInBytes,
                              ),
                            );
                          }}
                        >
                          Transfer
                        </Button>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
            {/* */}
          </Route>
          <Route path="/tank">
            <div style={{ maxWidth: 820, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <Button
                type={"primary"}
                onClick={() => {
                  tx(writeContracts.LoogieTank.mintItem());
                }}
              >
                Mint Tank
              </Button>
              <Button onClick={() => updateLoogieTanks()}>Refresh</Button>
            </div>
            {/* */}
            <div style={{ width: 820, margin: "auto", paddingBottom: 256 }}>
              <List
                bordered
                dataSource={yourLoogieTanks}
                renderItem={item => {
                  const id = item.id.toNumber();

                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <Card
                        title={
                          <div>
                            <span style={{ fontSize: 18, marginRight: 8 }}>{item.name}</span>
                          </div>
                        }
                      >
                        <img src={item.image} />
                        <div>{item.description}</div>
                      </Card>

                      <div>
                        owner:
                        <Address address={item.owner} blockExplorer={blockExplorer} fontSize={16} />
                        <AddressInput
                          placeholder="transfer to address"
                          value={transferToAddresses[id]}
                          onChange={newValue => {
                            const update = {};
                            update[id] = newValue;
                            setTransferToAddresses({ ...transferToAddresses, ...update });
                          }}
                        />
                        <Button
                          onClick={() => {
                            console.log("writeContracts", writeContracts);
                            tx(writeContracts.LoogieTank.transferFrom(address, transferToAddresses[id], id));
                          }}
                        >
                          Transfer
                        </Button>
                        <br />
                        <br />
                        <Button
                          onClick={() => {
                            tx(writeContracts.LoogieTank.returnAllLoogies(id));
                          }}
                        >
                          Eject All Pets
                        </Button>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>
          <Route path="/debugpet">
            <Contract
              name={petName}
              address={address}
              signer={userSigner}
              provider={localProvider}
              blockExplorer={blockExplorer}
              gasPrice={gasPrice}
              chainId={localChainId}
            />
          </Route>
          <Route path="/debugtank">
            <Contract
              name={tankName}
              address={address}
              signer={userSigner}
              provider={localProvider}
              blockExplorer={blockExplorer}
              gasPrice={gasPrice}
              chainId={localChainId}
            />
          </Route>
        </Switch>
      </HashRouter>

      <ThemeSwitch />

      {/* 👨💼 Your account is in the top right with a wallet at connect options */}
      <div style={{ position: "fixed", textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={address}
          localProvider={localProvider}
          userSigner={userSigner}
          price={price}
          coin={coinName}
          web3Modal={web3Modal}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
          blockExplorer={blockExplorer}
        />
      </div>

      {/* 🗺 Extra UI like gas price, eth price, faucet, and support: */}
      <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
        {FIAT_PRICE && (
          <Row align="middle" gutter={[4, 4]}>
            <Col span={8}>
              <Ramp price={price} address={address} networks={NETWORKS} />
            </Col>
          </Row>
        )}

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              /*  if the local provider has a signer, let's show the faucet:  */
              faucetAvailable ? (
                <Faucet signer={userSigner} localProvider={localProvider} price={price} coin={coinName} />
              ) : (
                ""
              )
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
