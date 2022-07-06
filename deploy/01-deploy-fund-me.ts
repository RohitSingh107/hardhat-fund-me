import { networkConfig } from "../helper-hardhat-config"
import { HardhatRuntimeEnvironment } from "hardhat/types"

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId!

    // const address = "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e"
    let ethUsdPriceFeedAddress: string
    // ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[network.name].ethUsdPriceFeed!
    }
    log("----------------------------------------------------")
    log("Deploying FundMe and waiting for confirmations...")

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // Constructor arguments
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 0,
    })
    log(`FundMe deployed at ${fundMe.address}`)
}

module.exports.tags = ["all", "fundMe"]
