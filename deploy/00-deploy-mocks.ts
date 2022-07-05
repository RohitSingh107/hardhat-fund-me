import { network } from "hardhat"

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deply, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
}
