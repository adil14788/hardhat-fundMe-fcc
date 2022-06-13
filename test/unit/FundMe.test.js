const { assert, expect } = require("chai")
const { getNamedAccounts, deployments, ethers } = require("hardhat")
const { devlopmentChains } = require("../../helper-hardhat-config")

!devlopmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Contract Testing ", async function () {
          let fundMe, deployer, mockV3Aggregator
          let sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("Constructor", async function () {
              it("Checking Owner", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("Fund", async function () {
              it("Fails is enough eth is not send", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })

              it("Checking the mapping which contain list of address", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )

                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Checking from funders address array", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getOwner(0)

                  assert.equal(funder, deployer)
              })

              it("Withdraw with single funder", async function () {
                  beforeEach(async function () {
                      await fundMe.fund({ value: sendValue })
                  })

                  const initialFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const initialDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceit = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceit

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //gas cost
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      initialFundMeBalance
                          .add(initialDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("Withdraw with multiple funder", async function () {
                  const [account0, account1] = await ethers.getSigners()
                  beforeEach(async function () {
                      await fundMe.connect(account0).fund({ value: sendValue })
                      await fundMe.connect(account1).fund({ value: sendValue })
                  })
                  //         // setup
                  const initialFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const intialDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //         //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceit = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceit
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //         //assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      initialFundMeBalance
                          .add(intialDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  await expect(fundMe.getOwner(0)).to.be.reverted
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(account0.address),
                      0
                  )
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(account1.address),
                      0
                  )
              })

              it("Only owner could withdraw balance", async function () {
                  const [account0, account1] = await ethers.getSigners()

                  await expect(
                      fundMe.connect(account1.address).withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })

              it("Cheaper Withdraw with multiple funder", async function () {
                  const [account0, account1] = await ethers.getSigners()
                  beforeEach(async function () {
                      await fundMe.connect(account0).fund({ value: sendValue })
                      await fundMe.connect(account1).fund({ value: sendValue })
                  })
                  //         // setup
                  const initialFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const intialDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //         //Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceit = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceit
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //         //assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      initialFundMeBalance
                          .add(intialDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
                  await expect(fundMe.getFunders(0)).to.be.reverted
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(account0.address),
                      0
                  )
                  assert.equal(
                      await fundMe.getAddressToAmountFunded(account1.address),
                      0
                  )
              })
          })
      })
