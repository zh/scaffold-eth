const { ethers } = require("hardhat");

const OWNER_ADDR = "0x81585790aA977b64e0c452DB84FC69eaCE951d4F";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const exampleExternalContract = await deploy("ExampleExternalContract", {
    from: deployer,
    log: true,
  });
  // for withdraws
  console.log("\n Transfer ownership to frontend address...\n");
  const contract = await ethers.getContractAt(
    "ExampleExternalContract",
    exampleExternalContract.address
  );
  await contract.transferOwnership(OWNER_ADDR);

  await deploy("Staker", {
    from: deployer,
    log: true,
    args: [exampleExternalContract.address],
  });
};
module.exports.tags = ["Staker"];
