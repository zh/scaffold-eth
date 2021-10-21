const { ethers } = require("hardhat");

const OWNER_ADDR = "0x81585790aA977b64e0c452DB84FC69eaCE951d4F"; // adjust from frontend

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const lockContract = await deploy("SmartLock", {
    from: deployer,
    log: true,
  });

  console.log("\n Transfer ownership to the frontend address...\n");
  const contract = await ethers.getContractAt(
    "SmartLock",
    lockContract.address
  );
  await contract.transferOwnership(OWNER_ADDR);
};
module.exports.tags = ["SmartLock"];
