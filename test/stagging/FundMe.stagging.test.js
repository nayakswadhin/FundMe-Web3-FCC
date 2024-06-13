const { assert } = require("chai")
const { ethers, getNamedAccounts, network } = require("hardhat")

const chainId = network.config.chainId

chainId == 31337
  ? describe.skip
  : describe("FundMe Staging Tests", async () => {
      let deployer
      let fundMe
      const sendValue = ethers.parseEther("0.02")
      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("allows people to fund and withdraw", async () => {
        const fundTxResponse = await fundMe.fund({ value: sendValue })
        await fundTxResponse.wait(1)
        const withdrawTxResponse = await fundMe.withdraw()
        await withdrawTxResponse.wait(1)

        const endingFundMeBalance = await ethers.provider.getBalance(
          fundMe.target,
        )
        assert.equal(endingFundMeBalance.toString(), "0")
      })
    })
