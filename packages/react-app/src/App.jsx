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
  Account,
  Contract,
  Faucet,
  Header,
  NetworkSelect,
  NftCard,
  OwnerNftCard,
  Ramp,
  ThemeSwitch,
} from "./components";
import { GAS_PRICE, FIAT_PRICE, INFURA_ID, NETWORKS, OWNER_ADDR } from "./constants";
import { Transactor } from "./helpers";
import { getMetadata } from "./helpers/ipfsFunctions";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useUserSigner,
  useEventListener,
  useExchangePrice,
} from "./hooks";
import { Events, Mint } from "./views";

const { ethers } = require("ethers");

/*
    Welcome to 🏗 scaffold-multi !

    Code: https://github.com/zh/scaffold-eth , Branch: multi-evm
*/

// 📡 What chain are your contracts deployed to?
// const targetNetwork = NETWORKS.localhost;
// const targetNetwork = NETWORKS.polygon;
// const targetNetwork = NETWORKS.mumbai;
const targetNetwork = NETWORKS.testnetSmartBCH;
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
// const targetNetwork = NETWORKS.testnetTomo;
// const targetNetwork = NETWORKS.mainnetTomo;
// const targetNetwork = NETWORKS.testnetBSC;
// const targetNetwork = NETWORKS.mainnetBSC;
// const targetNetwork = NETWORKS.bakerloo;
// const targetNetwork = NETWORKS.kaleido;

// 😬 Sorry for all the console logging
const DEBUG = false;

const tokenName = "AwesomeAssets";
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

  /* 💵 This hook will get the price in fiat */
  const price = FIAT_PRICE ? useExchangePrice(targetNetwork) : 0;

  const gasPrice = targetNetwork.gasPrice || GAS_PRICE;
  console.log("Gas Price: ", gasPrice);
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

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  // Just plug in different 🛰 providers to get your balance on different chains:
  // const yourMainnetBalance = useBalance(mainnetProvider, address);

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

  /* NFT related code */
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
        gasPrice={gasPrice}
        coin={coinName}
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
                        gasPrice={gasPrice}
                        coin={coinName}
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
            <Mint
              address={address}
              tx={tx}
              contractName={tokenName}
              writeContracts={writeContracts}
              gasPrice={gasPrice}
            />
          </Route>
          {address && OWNER_ADDR === address && (
            <>
              <Route path="/events">
                <Events transferEvents={transferEvents} actionEvents={actionEvents} />
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
