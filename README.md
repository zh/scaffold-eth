# Kaleido Wallet

> scaffold-eth based wallet for kaleido.io blockchain.

[kaleido.io](https://www.kaleido.io/) is providiong Blockchain-As-A-Service.

> "...Create Instant, Modern Business Networks and customize your enterprise blockchain networks in a fraction of the time and at a fraction of the cost...".

This [scaffold-eth](https://github.com/zh/scaffold-eth) branch is providing instant wallet for working with [kaleido.io](https://www.kaleido.io/) blockchain.

[![Add to Homescreen](https://img.shields.io/badge/Skynet-Add%20To%20Homescreen-00c65e?logo=skynet&labelColor=0d0d0d)](https://homescreen.hns.siasky.net/#/skylink/AQBmvg3haEzKgBX-4blypb_ZPYJueceTXN1ZxDoPgrwv0Q)

# 🏄‍♂️ Quick Start

Prerequisites: [Node](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone -b kaleido-wallet https://github.com/zh/scaffold-eth kaleido-wallet
```

> in a terminal window, start your 📱 frontend:

```bash
cd kaleido-wallet
yarn start
```

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

For using with different blockchains change target network:

```js
const targetNetwork = NETWORKS.testnetSmartBCH;
const targetNetwork = NETWORKS.testnetFantom;
```

📱 Open http://localhost:3000 to see the app