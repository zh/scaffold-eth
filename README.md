# 🏗 SmartLock, Blockchain Payment Module

> rent assets - cars, rooms, lockers with smart contract based payments

[![Add to Homescreen](https://img.shields.io/badge/Skynet-Add%20To%20Homescreen-00c65e?logo=skynet&labelColor=0d0d0d)](https://homescreen.hns.siasky.net/#/skylink/AQDPcrJcbXd3GdljYoxW3jrrfAtcGfNKn9QJ98nxtf1OcQ)

# 🏄‍♂️ Quick Start

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone -b multi-smartlock https://github.com/zh/scaffold-eth multi-smartlock
```

> install and start your 👷‍ Hardhat chain:

```bash
cd multi-smartlock
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd multi-smartlock
yarn start
```

> in a third terminal window, 🛰 deploy your contracts:

```bash
cd multi-smartlock
yarn deploy

// deploy on another blockchains
yarn deploy --network testnetSmartBCH
yarn deploy --network testnetFantom
```

🔏 Edit your smart contract `SmartLock.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

For using with other blockchains change target network:

```js
const targetNetwork = NETWORKS.testnetSmartBCH;
const targetNetwork = NETWORKS.testnetFantom;
```

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

# 📚 Documentation

Documentation, tutorials, challenges, and many more resources, visit: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)
