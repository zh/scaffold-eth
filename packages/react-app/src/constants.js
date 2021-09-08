require("dotenv").config();

// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = process.env.INFURA_KEY;

// MY ETHERSCAN_ID, SWAP IN YOURS FROM https://etherscan.io/myapikey
export const ETHERSCAN_KEY = process.env.ETHERSCAN_KEY;

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
    rpcUrl: "https://smartbch.greyh.at", // "https://global.uat.cash",
    blockExplorer: "https://smartscan.cash/",
    gasPrice: 1050000000,
  },
};

export const NETWORK = chainId => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};
