const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const token = await deploy("ScaffoldToken", {
    from: deployer,
    log: true,
  });
  const dex = await deploy("DEX", {
    from: deployer,
    args: [token.address],
    log: true,
  });
  console.log("Fund the wallet with 10 tokens");
  const tokenContract = await ethers.getContract("ScaffoldToken", deployer);
  await tokenContract.transfer(
    "0x81585790aA977b64e0c452DB84FC69eaCE951d4F",
    "" + 10 * 10 ** 18
  );
  console.log("Approve DEX to use tokens");
  await tokenContract.approve(dex.address, ethers.utils.parseEther("100"));
  console.log("INIT the exchange with 5 token pairs");
  const dexContract = await ethers.getContract("DEX", deployer);
  await dexContract.init(ethers.utils.parseEther("5"), {
    value: ethers.utils.parseEther("5"),
  });
};
module.exports.tags = ["DEX"];
