//const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  await deploy("ScaffoldToken", {
    from: deployer,
    log: true,
  });
};
module.exports.tags = ["SCF"];
