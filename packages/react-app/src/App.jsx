import WalletConnectProvider from "@walletconnect/web3-provider";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Col, List, Menu, Row } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState } from "react";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import StackGrid from "react-stack-grid";
import Web3Modal from "web3modal";
import "./App.css";
import {
  Address,
  Account,
  Faucet,
  Contract,
  Header,
  NetworkSelect,
  NftCard,
  OwnerNftCard,
  Ramp,
  ThemeSwitch,
} from "./components";
import { FIAT_PRICE, INFURA_ID, NETWORKS, OWNER_ADDR } from "./constants";
import { Transactor } from "./helpers";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useUserSigner,
  useEventListener,
  useExchangePrice,
} from "./hooks";
import { Mint } from "./views";

const { BufferList } = require("bl");
// https://www.npmjs.com/package/ipfs-http-client
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });
const { ethers } = require("ethers");

/// 📡 What chain are your contracts deployed to?
// const targetNetwork = NETWORKS.hardhat;
// const targetNetwork = NETWORKS.local;
const targetNetwork = NETWORKS.fuji;
// const targetNetwork = NETWORKS.mainnet;

// 😬 Sorry for all the console logging
const DEBUG = false;

const tokenName = "AwesomeAssets";

// helper function to "Get" from IPFS
// you usually go content.toString() after this...
const getFromIPFS = async hashToGet => {
  for await (const file of ipfs.get(hashToGet)) {
    if (DEBUG) console.log("📦 File path: ", file.path);
    if (!file.content) continue;
    const content = new BufferList();
    for await (const chunk of file.content) {
      content.append(chunk);
    }
    if (DEBUG) console.log("Content: ", content);
    return content;
  }
};

const getMetadata = async (id, uri, owner) => {
  const ipfsHash = uri.split("/").pop();
  const jsonManifestBuffer = await getFromIPFS(ipfsHash);
  try {
    const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
    if (DEBUG) console.log("🤗 jsonManifest: ", jsonManifest);
    if (DEBUG) {
      console.log("🤗 tokenId: ", id);
      console.log("🤗 tokenURI: ", uri);
      console.log("🤗 ipfsHash: ", ipfsHash);
    }
    return { id, uri, owner, ...jsonManifest };
  } catch (e) {
    console.log(e);
  }
  return null;
};

// 🛰 providers
// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
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
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
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

  /* 💵 This hook will get the price of AVAX */
  const price = FIAT_PRICE ? useExchangePrice(targetNetwork) : 0;

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = targetNetwork.gasPrice || 225000000000; // Avalanche minimal fee
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

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, { chainId: localChainId });

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (DEBUG && address && selectedChainId && yourLocalBalance && readContracts && writeContracts) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("💵 yourLocalBalance", yourLocalBalance ? ethers.utils.formatEther(yourLocalBalance) : "...");
      console.log("📝 readContracts", readContracts);
      console.log("🔐 writeContracts", writeContracts);
    }
  }, [address, selectedChainId, yourLocalBalance, readContracts, writeContracts]);

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

  // keep track of a variable from the contract in the local React state:
  const _tokenBalance = useContractReader(readContracts, tokenName, "balanceOf", [address]);
  const yourCount = _tokenBalance && _tokenBalance.toNumber && _tokenBalance.toNumber();
  if (DEBUG) console.log("🤗 Token count: ", yourCount);

  // 📟 Listen for broadcast events
  const transferEvents = useEventListener(readContracts, tokenName, "Transfer", localProvider, 1);
  if (DEBUG) console.log("📟 Transfer events: ", transferEvents);

  const actionEvents = useEventListener(readContracts, tokenName, "Action", localProvider, 1);

  // Loading Collectibles
  const [yourCollectibles, setYourCollectibles] = useState();
  useEffect(() => {
    const updateYourCollectibles = async () => {
      const collectibleUpdate = [];
      for (let idx = 0; idx < yourCount; idx++) {
        try {
          const tokenId = await readContracts[tokenName].tokenOfOwnerByIndex(address, idx);
          const tokenURI = await readContracts[tokenName].tokenURI(tokenId);

          const metadata = await getMetadata(tokenId, tokenURI, address);
          const price = await readContracts[tokenName].price(tokenId);
          metadata.price = ethers.utils.formatEther(price);
          if (metadata) collectibleUpdate.push(metadata);
        } catch (e) {
          console.log(e);
        }
      }
      setYourCollectibles(collectibleUpdate);
    };
    updateYourCollectibles();
  }, [address, yourCount, transferEvents, actionEvents]);

  // assets
  const [loadedAssets, setLoadedAssets] = useState();
  const _lastId = useContractReader(readContracts, tokenName, "lastId");
  const assetCount = _lastId && _lastId.toNumber && _lastId.toNumber();
  useEffect(() => {
    const updateYourAssets = async () => {
      let assetUpdate = [];
      for (let idx = 1; idx <= assetCount; idx++) {
        const _forSale = await readContracts[tokenName].forSale(idx);
        const price = ethers.utils.formatEther(_forSale);
        if (price != 0) {
          const tokenURI = await readContracts[tokenName].tokenURI(idx);
          const owner = await readContracts[tokenName].ownerOf(idx);
          const metadata = await getMetadata(idx, tokenURI, owner);
          assetUpdate.push({ id: idx, ...metadata, price });
        }
      }
      setLoadedAssets(assetUpdate);
    };
    if (readContracts && readContracts[tokenName]) updateYourAssets();
  }, [assetCount, readContracts, transferEvents, actionEvents]);

  const galleryList = [];
  for (let a in loadedAssets) {
    galleryList.push(
      <NftCard
        address={address}
        asset={loadedAssets[a]}
        contract={writeContracts[tokenName]}
        blockExplorer={blockExplorer}
      />,
    );
  }

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
              Assets Gallery
            </Link>
          </Menu.Item>
          <Menu.Item key="/owner">
            <Link
              onClick={() => {
                setRoute("/owner");
              }}
              to="/owner"
            >
              Your NFTs
            </Link>
          </Menu.Item>
          <Menu.Item key="/mint">
            <Link
              onClick={() => {
                setRoute("/mint");
              }}
              to="/mint"
            >
              Mint
            </Link>
          </Menu.Item>
          {address && OWNER_ADDR === address && (
            <>
              <Menu.Item key="/events">
                <Link
                  onClick={() => {
                    setRoute("/events");
                  }}
                  to="/events"
                >
                  Events
                </Link>
              </Menu.Item>
              <Menu.Item key="/debug">
                <Link
                  onClick={() => {
                    setRoute("/debug");
                  }}
                  to="/debug"
                >
                  Debug Contracts
                </Link>
              </Menu.Item>
            </>
          )}
        </Menu>
        <Switch>
          <Route exact path="/">
            <StackGrid columnWidth={200} gutterWidth={16} gutterHeight={16}>
              {galleryList}
            </StackGrid>
          </Route>
          <Route path="/owner">
            <div style={{ width: 640, margin: "auto", marginTop: 32, paddingBottom: 32 }}>
              <List
                bordered
                dataSource={yourCollectibles}
                renderItem={item => {
                  const id = item.id.toNumber();
                  return (
                    <List.Item key={id + "_" + item.uri + "_" + item.owner}>
                      <OwnerNftCard
                        address={address}
                        item={item}
                        tx={tx}
                        contractName={tokenName}
                        writeContracts={writeContracts}
                        blockExplorer={blockExplorer}
                        price={price}
                        fontSize={16}
                      />
                    </List.Item>
                  );
                }}
              />
            </div>
          </Route>
          <Route path="/mint">
            <Mint address={address} tx={tx} contractName={tokenName} writeContracts={writeContracts} />
          </Route>
          {address && OWNER_ADDR === address && (
            <>
              <Route path="/events">
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
                <div style={{ width: 600, margin: "auto", marginTop: 8, paddingBottom: 32 }}>
                  <List
                    bordered
                    dataSource={actionEvents}
                    renderItem={item => {
                      return (
                        <List.Item
                          key={item[0] + "_" + item.action + "_" + item.blockNumber + "_" + item[1].toNumber()}
                        >
                          <span style={{ fontSize: 16, marginRight: 8, textAlign: "right" }}>
                            #{item[1].toNumber()}
                          </span>
                          <Address address={item[0]} fontSize={16} />
                          <span style={{ fontSize: 16 }}>{item.action}</span>
                          <span style={{ fontSize: 16 }}>{ethers.utils.formatEther(item[3])}</span>
                        </List.Item>
                      );
                    }}
                  />
                </div>
              </Route>
              <Route path="/debug">
                <Contract
                  name={tokenName}
                  address={address}
                  signer={userSigner}
                  provider={localProvider}
                  blockExplorer={blockExplorer}
                  gasPrice={gasPrice}
                  chainId={localChainId}
                />
              </Route>
            </>
          )}
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
              faucetAvailable ? <Faucet signer={userSigner} localProvider={localProvider} price={price} /> : ""
            }
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default App;
