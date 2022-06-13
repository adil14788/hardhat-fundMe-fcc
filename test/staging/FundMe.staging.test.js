const { ethers } = require("ethers")
const { getUnnamedAccounts, network } = require("hardhat")

const { devlopmentChains } = require("../../helper-hardhat-config")

devlopmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe, deployer
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function () {
              deployer = (await getUnnamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })
      })
