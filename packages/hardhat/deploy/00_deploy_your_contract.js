//const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const loogies = await deploy("Loogies", {
    from: deployer,
    log: true,
  });
  const loogieTank = await deploy("LoogieTank",  {
    from: deployer,
    args: [loogies.address],
    log: true,
  });
};
module.exports.tags = ["Loogies"];
