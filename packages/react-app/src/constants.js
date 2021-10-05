require("dotenv").config();

export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
export const INFURA_ID = process.env.REACT_APP_INFURA_KEY;
export const ETHERSCAN_KEY = process.env.REACT_APP_ETHERSCAN_KEY;
// BLOCKNATIVE ID FOR Notify.js:
export const BLOCKNATIVE_DAPPID = "0b58206a-f3c0-4701-a62f-73c7243e8c77";
export const FIAT_PRICE = process.env.REACT_APP_FIAT_PRICE === "NO";
export const OWNER_ADDR = process.env.REACT_APP_OWNER_ADDRESS;

export const NETWORKS = {
  localhost: {
    name: "localhost",
    color: "#666666",
    chainId: 31337,
    coin: "ETH",
    blockExplorer: "",
    rpcUrl: "http://" + window.location.hostname + ":8545",
  },
  kovan: {
    name: "kovan",
    color: "#7003DD",
    chainId: 42,
    coin: "ETH",
    rpcUrl: `https://kovan.infura.io/v3/${INFURA_ID}`,
    blockExplorer: "https://kovan.etherscan.io/",
    faucet: "https://gitter.im/kovan-testnet/faucet", // https://faucet.kovan.network/
  },
  xdai: {
    name: "xdai",
    color: "#48a9a6",
    chainId: 100,
    price: 1,
    gasPrice: 1000000000,
    coin: "XDAI",
    rpcUrl: "https://dai.poa.network",
    faucet: "https://xdai-faucet.top/",
    blockExplorer: "https://blockscout.com/poa/xdai/",
  },
  matic: {
    name: "matic",
    color: "#2bbdf7",
    chainId: 137,
    price: 1,
    gasPrice: 1000000000,
    coin: "MATIC",
    rpcUrl: "https://rpc-mainnet.maticvigil.com",
    faucet: "https://faucet.matic.network/",
    blockExplorer: "https://explorer-mainnet.maticvigil.com/",
  },
  testnetSmartBCH: {
    name: "SmartBCH-T",
    color: "#7003DD",
    chainId: 10001,
    coin: "BCH",
    rpcUrl: "https://moeing.tech:9545", // "http://35.220.203.194:8545",
    blockExplorer: "https://smartscan.cash/",
    gasPrice: 1050000000,
  },
  mainnetSmartBCH: {
    name: "SmartBCH",
    color: "#ff8b9e",
    chainId: 10000,
    coin: "BCH",
    rpcUrl: "https://global.uat.cash", // https://smartbch.greyh.at
    blockExplorer: "https://smartscan.cash/",
    gasPrice: 1050000000,
  },
  localAvalanche: {
    name: "localAvalanche",
    color: "#666666",
    chainId: 43112,
    blockExplorer: "",
    coin: "AVAX",
    rpcUrl: `http://localhost:9650/ext/bc/C/rpc`,
    gasPrice: 225000000000,
  },
  fujiAvalanche: {
    name: "Fuji",
    color: "#7003DD",
    chainId: 43113,
    coin: "AVAX",
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://cchain.explorer.avax-test.network",
    gasPrice: 225000000000,
  },
  mainnetAvalanche: {
    name: "Mainnet",
    color: "#ff8b9e",
    chainId: 43114,
    coin: "AVAX",
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://cchain.explorer.avax.network",
    gasPrice: 225000000000,
  },
  testnetFantom: {
    name: "Fantom Testnet",
    color: "#7003DD",
    chainId: 4002,
    coin: "FTM",
    rpcUrl: "https://rpc.testnet.fantom.network/",
    blockExplorer: "https://testnet.ftmscan.com/",
    gasPrice: 1800000000,
  },
  fantomOpera: {
    name: "Fantom Opera",
    color: "#ff8b9e",
    chainId: 250,
    coin: "FTM",
    rpcUrl: "https://rpc.fmt.tools/",
    blockExplorer: "https://ftmscan.com/",
    gasPrice: 1600000000,
  },
  testnetHarmony: {
    name: "Harmony Testnet",
    color: "#00b0ef",
    chainId: 1666700000,
    coin: "ONE",
    blockExplorer: "https://explorer.pops.one/",
    rpcUrl: `https://api.s0.b.hmny.io`,
    gasPrice: 1000000000,
  },
  mainnetHarmony: {
    name: "Harmony Mainnet",
    color: "#00b0ef",
    chainId: 1666600000,
    coin: "ONE",
    blockExplorer: "https://explorer.harmony.one/",
    rpcUrl: `https://api.harmony.one`,
    gasPrice: 1000000000,
  },
};

export const NETWORK = chainId => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};

export const GAS_PRICE = NETWORKS.testnetFantom.gasPrice; // fix this for your network
