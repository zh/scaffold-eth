# SmartBCH Wallet

> Instant burner wallets on SmartBCH testnet

[![Add to Homescreen](https://img.shields.io/badge/Skynet-Add%20To%20Homescreen-00c65e?logo=skynet&labelColor=0d0d0d)](https://homescreen.hns.siasky.net/#/skylink/AQDY4Z6jN8p47Ko6vnkqpppy5d3jUI9teoL-sfoLAeorzA)

# 🏄‍♂️ Quick Start

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone -b smart-wallet https://github.com/zh/scaffold-eth smart-wallet
```

> in a terminal window, start your 📱 frontend:

```bash
cd smart-wallet
yarn start
```

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

For using with different blockchains change target network:

```js
const targetNetwork = NETWORKS.testnetSmartBCH;
const targetNetwork = NETWORKS.testnetFantom;
```

📱 Open http://localhost:3000 to see the app
