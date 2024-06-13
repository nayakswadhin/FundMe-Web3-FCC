const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

const chainId = network.config.chainId

chainId != 31337
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe
      let deployer
      let mockV3Aggregator
      const sendValue = ethers.parseEther("1") // 1 ETH
      beforeEach(async function () {
        // deploy our fundMe contract
        // using Hardhat deploy
        // const accounts = await ethers.getSigners();
        // const accountZero = accounts[0];
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"]) // Deploy all the contract tags with "all"

        // Get contracts
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer,
        )
      })

      describe("constructor", async function () {
        it("Sets the aggregator addresses correctly", async function () {
          const response = await fundMe.priceFeed()
          assert.equal(response, mockV3Aggregator.target)
        })
      })

      describe("fund", async function () {
        it("Fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough")
        })
        it("Updated the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.addressToAmount(deployer)
          assert.equal(response.toString(), sendValue.toString())
        })
        it("Add funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.donorAddress(0)
          assert.equal(response, deployer)
        })
      })

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue })
        })

        it("Withdraw ETH from a single funder", async function () {
          // Arrange
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target,
          )
          const startingDeployerBalance =
            await ethers.provider.getBalance(deployer)

          // Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          // Get the Gas price used
          const { gasUsed, gasPrice } = transactionReceipt
          const gasCost = gasUsed * gasPrice

          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target,
          )
          const endingDeployerBalance =
            await ethers.provider.getBalance(deployer)

          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost,
          )
        })

        it("withdraw funds from multiple funder", async () => {
          //Arrange
          const accounts = await ethers.getSigners()

          for (let i = 0; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target,
          )
          const startingDeployerBalance =
            await ethers.provider.getBalance(deployer)

          //Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)
          // Get the Gas price used
          const { gasUsed, gasPrice } = transactionReceipt
          const gasCost = gasUsed * gasPrice

          //Assert
          const endingFundMeBalance = await ethers.provider.getBalance(
            fundMe.target,
          )
          const endingDeployerBalance =
            await ethers.provider.getBalance(deployer)
          // Assert
          assert.equal(endingFundMeBalance, 0)
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost,
          )
          // Funders array are reset properly
          await expect(fundMe.donorAddress(0)).to.be.reverted
          for (let i = 0; i < 6; i++) {
            await assert.equal(
              await fundMe.addressToAmount(accounts[i].address),
              0,
            )
          }
        })

        it("Only owner can withdraw", async () => {
          const accounts = await ethers.getSigners()
          const attacker = accounts[1]
          const attackerConntedContract = await fundMe.connect(attacker)
          await expect(attackerConntedContract.withdraw()).to.be.reverted
        })
      })
    })
