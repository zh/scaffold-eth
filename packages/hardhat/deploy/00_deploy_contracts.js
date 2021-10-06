const { ethers } = require("hardhat");

const tokenName = "AmmToken";
const dexName = "DEX";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const token = await deploy(tokenName, {
    from: deployer,
    log: true,
  });
  const dex = await deploy(dexName, {
    from: deployer,
    args: [token.address],
    log: true,
  });
  console.log("Fund the wallet with 1000 tokens");
  const tokenContract = await ethers.getContract(tokenName, deployer);
  await tokenContract.transfer(
    "0x81585790aA977b64e0c452DB84FC69eaCE951d4F",
    ethers.utils.parseEther("100")
  );
  console.log("Approve DEX to use tokens");
  await tokenContract.approve(dex.address, ethers.utils.parseEther("10000"));
  console.log("INIT the exchange with 100 token pairs");
  const dexContract = await ethers.getContract(dexName, deployer);
  await dexContract.init(ethers.utils.parseEther("100"), {
    value: ethers.utils.parseEther("5"),
  });
};
module.exports.tags = ["DEX"];
