const fs = require("fs");
const chalk = require("chalk");
const { config, ethers } = require("hardhat");
const { utils } = require("ethers");

const main = async () => {
  const toAddress = "0xEcC76E9a7f8f72d0EefFba8be0F4c1cf4B56698B";

  console.log("\n\n 🎫 Minting to " + toAddress + "...\n");

  const { deployer } = await getNamedAccounts();
  const scfToken = await ethers.getContract("ScaffoldToken", deployer);
  await scfToken.transfer(toAddress, "" + (10 * 10 ** 18));
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
