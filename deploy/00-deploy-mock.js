const { network } = require("hardhat")

const {
    devlopmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { log, deploy } = deployments
    const { deployer } = await getNamedAccounts()

    // const chainId = network.config.chainId

    if (devlopmentChains.includes(network.name)) {
        log("Devlopment network detected")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks Deployed")
        log("---------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
