require("dotenv").config();

// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = process.env.REACT_APP_INFURA_KEY;

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = process.env.REACT_APP_ETHERSCAN_KEY;

// BLOCKNATIVE ID FOR Notify.js:
export const BLOCKNATIVE_DAPPID = "0b58206a-f3c0-4701-a62f-73c7243e8c77";

export const NETWORKS = {
  localhost: {
    name: "localhost",
    color: "#666666",
    chainId: 31337,
    blockExplorer: "",
    rpcUrl: "http://" + window.location.hostname + ":8545",
  },
  testnetSmartBCH: {
    name: "SmartBCH-T",
    color: "#7003DD",
    chainId: 10001,
    rpcUrl: "https://moeing.tech:9545", // "http://35.220.203.194:8545",
    blockExplorer: "https://smartscan.cash/",
    gasPrice: 1050000000,
  },
  mainnetSmartBCH: {
    name: "SmartBCH",
    color: "#ff8b9e",
    chainId: 10000,
    rpcUrl: "https://global.uat.cash", // https://smartbch.greyh.at
    blockExplorer: "https://smartscan.cash/",
    gasPrice: 1050000000,
  },
  fujiAva: {
    name: "Fuji",
    color: "#7003DD",
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://cchain.explorer.avax-test.network",
    gasPrice: 225000000000,
  },
  mainnetAva: {
    name: "Mainnet",
    color: "#ff8b9e",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://cchain.explorer.avax.network",
    gasPrice: 225000000000,
  },
  testnetFantom: {
    name: "Fantom Testnet",
    color: "#7003DD",
    chainId: 4002,
    rpcUrl: "https://rpc.testnet.fantom.network/",
    blockExplorer: "https://testnet.ftmscan.com/",
    gasPrice: 1800000000,
  },
  fantomOpera: {
    name: "Fantom Opera",
    color: "#ff8b9e",
    chainId: 250,
    rpcUrl: "https://rpc.fmt.tools/",
    blockExplorer: "https://ftmscan.com/",
    gasPrice: 1600000000,
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
export const FIAT_PRICE = process.env.REACT_APP_FIAT_PRICE === "NO";
export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
export const OWNER_ADDR = process.env.REACT_APP_OWNER_ADDRESS;
