require("dotenv").config();

// MY INFURA_ID, SWAP IN YOURS FROM https://infura.io/dashboard/ethereum
export const INFURA_ID = process.env.REACT_APP_INFURA_KEY;

// BLOCKNATIVE ID FOR Notify.js:
export const BLOCKNATIVE_DAPPID = "0b58206a-f3c0-4701-a62f-73c7243e8c77";

export const NETWORKS = {
  local: {
    name: "localhost",
    color: "#666666",
    chainId: 44112,
    blockExplorer: "",
    rpcUrl: "http://" + window.location.hostname + ":9650/ext/bc/C/rpc",
  },
  fuji: {
    name: "Fuji",
    color: "#7003DD",
    chainId: 43113,
    rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
    blockExplorer: "https://cchain.explorer.avax-test.network",
    gasPrice: 225000000000,
  },
  mainnet: {
    name: "Mainnet",
    color: "#ff8b9e",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    blockExplorer: "https://cchain.explorer.avax.network",
    gasPrice: 225000000000,
  },
};

export const NETWORK = chainId => {
  for (const n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};

export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

export const FIAT_PRICE = process.env.REACT_APP_FIAT_PRICE === "NO";
export const OWNER_ADDR = process.env.REACT_APP_OWNER_ADDRESS;
