const { ethers } = require("hardhat");

const OWNER_ADDR = "0x81585790aA977b64e0c452DB84FC69eaCE951d4F";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const ScaffoldToken = await deployments.get("ScaffoldToken");
  const scfToken = await ethers.getContractAt(
    "ScaffoldToken",
    ScaffoldToken.address
  );
  const vendorContract = await deploy("Vendor", {
    from: deployer,
    args: [ScaffoldToken.address],
    log: true,
  });
  console.log("\n Sending all 1000 tokens to the vendor...\n");
  await scfToken.transfer(
    vendorContract.address,
    ethers.utils.parseEther("1000")
  );
  console.log("\n Transfer ownership to frontend address...\n");
  const vendor = await ethers.getContractAt("Vendor", vendorContract.address);
  await vendor.transferOwnership(OWNER_ADDR);
};
module.exports.tags = ["Vendor"];
