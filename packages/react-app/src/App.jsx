import WalletConnectProvider from "@walletconnect/web3-provider";
import { useThemeSwitcher } from "react-css-theme-switcher";
import { Button, Divider, Col, Menu, Row } from "antd";
import "antd/dist/antd.css";
import React, { useCallback, useEffect, useState } from "react";
import { HashRouter, Link, Route, Switch } from "react-router-dom";
import Web3Modal from "web3modal";
import "./App.css";
import { Address, Account, Contract, Faucet, Header, NetworkSelect, ThemeSwitch } from "./components";
import { GAS_PRICE, FIAT_PRICE, INFURA_ID, NETWORKS } from "./constants";
import { Transactor, formatDuration } from "./helpers";
import { useBalance, useContractLoader, useContractReader, useUserSigner, useExchangePrice } from "./hooks";

const { ethers, BigNumber } = require("ethers");
/*
    Welcome to 🏗 scaffold-multi !

    Code: https://github.com/zh/scaffold-eth , Branch: multi-evm
*/

// 📡 What chain are your contracts deployed to?
// const targetNetwork = NETWORKS.localhost;
// const targetNetwork = NETWORKS.testnetSmartBCH;
// const targetNetwork = NETWORKS.mainnetSmartBCH;
const targetNetwork = NETWORKS.fujiAvalanche;
// const targetNetwork = NETWORKS.mainnetAvalanche;
// const targetNetwork = NETWORKS.testnetFantom;
// const targetNetwork = NETWORKS.fantomOpera;
// const targetNetwork = NETWORKS.moondev;
// const targetNetwork = NETWORKS.moonbase;
// const targetNetwork = NETWORKS.moonriver;
// const targetNetwork = NETWORKS.testnetTomo;
// const targetNetwork = NETWORKS.mainnetTomo;
// const targetNetwork = NETWORKS.kaleido;

// 😬 Sorry for all the console logging
const DEBUG = false;

const contractName = "SmartLock";
const coinName = targetNetwork.coin || "ETH";

// 🛰 providers
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

  // keep track of a variable from the contract in the local React state:
  const timeLeft = useContractReader(readContracts, "SmartLock", "timeLeft");
  const rentBy = useContractReader(readContracts, "SmartLock", "rentBy");
  const forRent = useContractReader(readContracts, "SmartLock", "forRent");
  const rentPrice = useContractReader(readContracts, "SmartLock", "price");
  const isLocked = useContractReader(readContracts, "SmartLock", "locked");

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

  const myRent = () => {
    return address && rentBy && rentBy === address;
  };

  const ethRentPrice = period_in_hours => {
    return ethers.utils.parseEther("" + totalRentPrice(period_in_hours));
  };

  const totalRentPrice = period_in_hours => {
    return period_in_hours * ethers.utils.formatEther(rentPrice);
  };

  const statusDisplay = (
    <>
      <div style={{ padding: 8, marginTop: 32 }}>
        <h2>Time left</h2>
        {timeLeft && formatDuration(timeLeft.toNumber() * 1000)}
        <h2>Rent By</h2>
        {rentBy && <Address address={rentBy} fontSize={16} />}
        {rentBy && !myRent() && (
          <div
            style={{
              width: 500,
              margin: "auto",
              marginTop: 64,
              backgroundColor: isLocked ? "red" : "green",
            }}
          >
            <h2 style={{ color: "white" }}>{isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}</h2>
          </div>
        )}
      </div>
    </>
  );

  const actionsDisplay = (
    <div style={{ width: 500, margin: "auto", marginTop: 64, backgroundColor: isLocked ? "red" : "green" }}>
      <h2 style={{ color: "white" }}>{isLocked ? "🔒 LOCKED" : "🔓 UNLOCKED"}</h2>
      <div style={{ padding: 8 }}>
        <Button
          type={"primary"}
          onClick={() => {
            tx(writeContracts[contractName].open());
          }}
        >
          {"Unlock"}
        </Button>
        <Button
          type={"default"}
          onClick={() => {
            tx(writeContracts[contractName].close());
          }}
        >
          {"Lock"}
        </Button>
      </div>
    </div>
  );

  const rentButton = period_in_hours => (
    <div style={{ padding: 8 }}>
      <Button
        type={"primary"}
        onClick={() => {
          tx(
            writeContracts[contractName].rent(period_in_hours * 3600, {
              value: ethRentPrice(period_in_hours),
            }),
          );
        }}
      >
        {`Rent for ${formatDuration(period_in_hours * 3600 * 1000)} (${totalRentPrice(period_in_hours)} ${coinName})`}
      </Button>
    </div>
  );

  const forRentDisplay = (
    <>
      <div style={{ padding: 8, marginTop: 32 }}>
        <h2>For Rent</h2>
        {rentPrice && `Price: ${ethers.utils.formatEther(rentPrice)} ${coinName}`}
        {rentPrice && ethers.utils.formatEther(rentPrice) > 0.0 && (
          <>
            {rentButton(0.5)}
            {rentButton(1.0)}
            {rentButton(2.0)}
          </>
        )}
      </div>
    </>
  );

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
              Rent
            </Link>
          </Menu.Item>
          <Menu.Item key="/debug">
            <Link
              onClick={() => {
                setRoute("/debug");
              }}
              to="/debug"
            >
              Debug
            </Link>
          </Menu.Item>
        </Menu>
        <Switch>
          <Route exact path="/">
            {forRent ? forRentDisplay : statusDisplay}
            {myRent() && (
              <>
                <div style={{ padding: 8 }}>
                  <Button
                    type={"default"}
                    onClick={() => {
                      tx(writeContracts[contractName].cancel());
                    }}
                  >
                    {"Cancel"}
                  </Button>
                </div>
                <Divider />
                {actionsDisplay}
              </>
            )}
          </Route>
          <Route path="/debug">
            <Contract
              name={contractName}
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
