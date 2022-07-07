import { deployments, ethers, getNamedAccounts } from "hardhat"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { assert, expect } from "chai"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

describe("FundMe", () => {
    let fundMe: FundMe
    let mockV3Aggregator: MockV3Aggregator
    let deployer: SignerWithAddress
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async () => {
        const accounts = await ethers.getSigners()
        deployer = accounts[0]
        // deployer = (await getNamedAccounts()).deployer
        await deployments.fixture("all")
        fundMe = await ethers.getContract("FundMe")
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
    })

    describe("constructor", () => {
        it("Sets the aggregator address correctly", async () => {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", () => {
        it("It fails if we don't send enough ETH", async () => {
            await expect(fundMe.fund()).to.be.revertedWith(
                "Ditn't send enough! reverting changes"
            )
        })

        it("updated the amount funded data structure", async () => {
            await fundMe.fund({ value: ethers.utils.parseEther("1") })
            const response = await fundMe.addressToAmount(deployer.address)
            assert.equal(
                response.toString(),
                ethers.utils.parseEther("1").toString()
            )
        })

        it("Adds funder to array of funders", async () => {
            await fundMe.fund({ value: ethers.utils.parseEther("1") })
            const response = await fundMe.funders(0)
            assert.equal(response, deployer.address)
        })
    })
})
