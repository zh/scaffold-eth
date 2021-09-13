/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({
  host: "ipfs.infura.io",
  port: "5001",
  protocol: "https",
});

const delayMS = 1000; //sometimes xDAI needs a 6000ms break lol 😅

const main = async () => {
  // ADDRESS TO MINT TO:
  const toAddress = "0x81585790aA977b64e0c452DB84FC69eaCE951d4F";

  console.log("\n\n 🎫 Minting to " + toAddress + "...\n");

  const { deployer } = await getNamedAccounts();
  const minter = await ethers.getContract("AwesomeAssets", deployer);

  const godzilla = {
    description: "Raaaar!",
    external_url: "https://austingriffith.com/portfolio/paintings/",
    image: "https://austingriffith.com/images/paintings/godzilla.jpg",
    name: "Godzilla",
    attributes: [
      {
        trait_type: "BackgroundColor",
        value: "orange",
      },
      {
        trait_type: "Eyes",
        value: "googly",
      },
      {
        trait_type: "Stamina",
        value: 99,
      },
    ],
  };

  const zebra = {
    description: "It's actually a zebra?",
    external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
    image: "https://austingriffith.com/images/paintings/zebra.jpg",
    name: "zebra",
    attributes: [
      {
        trait_type: "BackgroundColor",
        value: "green",
      },
      {
        trait_type: "Eyes",
        value: "googly",
      },
      {
        trait_type: "Stamina",
        value: 42,
      },
    ],
  };

  console.log("Uploading godzilla...");
  let upload = await ipfs.add(JSON.stringify(godzilla));
  await sleep(delayMS);
  console.log("Minting asset with IPFS hash (" + upload.path + ")");
  await minter.mintItem(toAddress, upload.path, `ipfs://${upload.path}`, {
    gasLimit: 400000,
  });
  await sleep(delayMS);

  console.log("Uploading zebra...");
  upload = await ipfs.add(JSON.stringify(zebra));
  await sleep(delayMS);
  console.log("Minting asset with IPFS hash (" + upload.path + ")");
  await minter.mintItem(toAddress, upload.path, `ipfs://${upload.path}`, {
    gasLimit: 400000,
  });
  await sleep(delayMS);

  console.log("Assets new owner is " + toAddress + " ...");
  await minter.transferOwnership(toAddress);
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
