// const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const exampleExternalContract = await deploy("ExampleExternalContract", {
    from: deployer,
    log: true,
  });

  await deploy("Staker", {
    from: deployer,
    log: true,
    args: [exampleExternalContract.address],
  });
};
module.exports.tags = ["Staker"];
