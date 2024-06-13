require("dotenv").config()
const { network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
const [verify] = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  let ethUSDPriceFeedAdress
  if (chainId == "31337") {
    const ethUSDAggregator = await deployments.get("MockV3Aggregator")
    // console.log("This is ethUSDAggreagator address ----> ", ethUSDAggregator);
    ethUSDPriceFeedAdress = ethUSDAggregator.address
  } else {
    ethUSDPriceFeedAdress = networkConfig[chainId]["ethUSDPriceFeed"]
  }

  const args = [ethUSDPriceFeedAdress]

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: args,
    log: true,
  })

  //Verify
  if (chainId != "31337" && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, args)
  }
  log("---------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
