import * as dotenv from "dotenv"

import { HardhatUserConfig, task } from "hardhat/config"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import "@typechain/hardhat"
import "hardhat-gas-reporter"
import "solidity-coverage"
import "hardhat-deploy"
import "@nomiclabs/hardhat-ethers"
import "dotenv/config"

dotenv.config()

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners()

    for (const account of accounts) {
        console.log(account.address)
    }
})

// You need to export an object to set up your

const config: HardhatUserConfig = {
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },

    defaultNetwork: "hardhat",

    networks: {
        hardhat: {
            chainId: 31337,
            // gasPrice: 130000000000,
        },
        // kovan: {
        //     url: process.env.KOVAN_RPC_URL,
        // accounts: [process.env.PRIVATE_KEY],
        // 	chainId: 42,
        // },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
    },
    etherscan: {
        apiKey: process.env.ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
		},
	},
}

export default config
