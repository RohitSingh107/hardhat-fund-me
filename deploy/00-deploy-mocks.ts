import { HardhatRuntimeEnvironment } from "hardhat/types"
// import { DeployFunction } from "hardhat-deploy/types"

// import {
//     developementChain,
//     DECIMALS,
//     INITIAL_ANSWER,
// } from "../helper-hardhat-config"

const DECIMALS = "18"
const INITIAL_PRICE = "2000000000000000000000" // 2000
module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if (developementChain.includes(network.name)) {
    if (chainId == 31337) {
        log("Local Network Detected! Deploying Mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("Mocks deployed!")
        log("----------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
