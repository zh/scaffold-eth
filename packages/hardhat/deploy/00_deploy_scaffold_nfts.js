const fs = require("fs");
const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  console.log("\n\n 📡 Deploying...\n");

  // read in all the assets to get their IPFS hash...
  const uploadedAssets = JSON.parse(fs.readFileSync("./uploaded.json"));
  const bytes32Array = [];
  for(const a in uploadedAssets) {
    console.log("IPFS: ", a);
    const bytes32 = ethers.utils.id(a);
    console.log("hashed: ", bytes32);
    bytes32Array.push(bytes32);
  };
  console.log(" \n");

  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy("ScaffoldNFTs", {
    from: deployer,
    args: [bytes32Array],
    log: true,
  });
};
module.exports.tags = ["SNFT"];
