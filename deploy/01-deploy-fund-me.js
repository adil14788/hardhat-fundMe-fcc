const { network } = require("hardhat")
const { networkConfig, devlopmentChains } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    console.log(deployer)
    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress
    // were are using the address based on the chain id to recognize which blockchain it is
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    if (devlopmentChains.includes(network.name)) {
        const ethAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    //the basic idea ofa mock contract is if the eth/usd chainlink contract boesnt exist
    // we will have to deploy a minimal version of our contract

    const FundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress],
        log: true,
        // waitConfirmations: network.config.blockConfirmations || 1,
    })

    log(
        "__________________________---------------------------________________________________________"
    )
}

module.exports.tags = ["all", "fundme"]
