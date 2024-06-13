const { network } = require("hardhat");
const { DECIMAL, INITIAL_ANS } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  if (chainId == "31337") {
    log("Local Network Detected!! Deploying Mocks....");
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMAL, INITIAL_ANS],
    });
    log("<-------------------- Mocks Deployed ----------------->");
  }
};

module.exports.tags = ["all", "mocks"];
