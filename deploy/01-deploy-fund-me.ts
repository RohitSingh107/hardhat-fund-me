import { network } from "hardhat"
import { networkConfig } from "../helper-hardhat-config"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deply, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // const address = "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e"
    const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]

    const fundMe = await deply("FundMe", {
        from: deployer,
        args: [address], // Constructor arguments
        log: true,
    })
}
