# 🏗 Scaffold-Multi, NFT market (ERC-721)

> mint/buy/sell NFTs (ERC-721) with smart contract 🚀

🧪 Fully functional NFT market. All operations are managed by smart contract.

# 🏄‍♂️ Quick Start

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone -b minting https://github.com/zh/scaffold-eth.git minting
```

> install and start your 👷‍ Hardhat chain:

```bash
cd minting
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd minting
yarn start
```

> (optional) in a third terminal window, 🛰 deploy your contract:

```bash
cd minting
yarn deploy

// deploy on another blockchains
yarn deploy --network testnetSmartBCH
yarn deploy --network testnetFantom
```

🔏 Edit your smart contract `AwesomeAssets.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

For using with other blockchains change target network:

```js
const targetNetwork = NETWORKS.testnetSmartBCH;
const targetNetwork = NETWORKS.testnetFantom;
```

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app
