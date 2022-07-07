import { deployments, ethers, network } from "hardhat"
import { FundMe, MockV3Aggregator } from "../../typechain-types"
import { assert, expect } from "chai"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { developmentChains } from "../../helper-hardhat-config"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
          let fundMe: FundMe
          let mockV3Aggregator: MockV3Aggregator
          let deployer: SignerWithAddress
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async () => {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]
              // deployer = (await getNamedAccounts()).deployer
              await deployments.fixture("all")
              fundMe = await ethers.getContract("FundMe", deployer.address)
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
          })

          describe("constructor", () => {
              it("Sets the aggregator address correctly", async () => {
                  const response = await fundMe.getPriceFeed()
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
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmount(
                      deployer.address
                  )
                  assert.equal(
                      response.toString(),
                      ethers.utils.parseEther("1").toString()
                  )
              })

              it("Adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getFunder(0)
                  assert.equal(response, deployer.address)
              })
          })

          describe("widhdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })

              it("Withdraw ETH from a single funder", async () => {
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer.address)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer.address)

                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("CheaperWithdraw ETH from a single funder", async () => {
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer.address)

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer.address)

                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allows us to withdraw with multiple funders", async () => {
                  const account_list = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const funMeConnectedContract = fundMe.connect(
                          account_list[i]
                      )
                      await funMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer.address)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer.address)

                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmount(
                                  account_list[i].address
                              )
                          ).toString(),
                          "0"
                      )
                  }
              })

              it("Only allows the owner to withdraw", async () => {
                  const account_list = await ethers.getSigners()
                  const attacker = account_list[1]
                  const attackConnectedContract = fundMe.connect(attacker)
                  await expect(
                      attackConnectedContract.withdraw()
                  ).to.be.revertedWith("FundMe__NotOwner")
              })

              it("cheaperWithdraw testing", async () => {
                  const account_list = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const funMeConnectedContract = fundMe.connect(
                          account_list[i]
                      )
                      await funMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer.address)

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer.address)

                  assert.equal(endingFundMeBalance.toString(), "0")
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          (
                              await fundMe.getAddressToAmount(
                                  account_list[i].address
                              )
                          ).toString(),
                          "0"
                      )
                  }
              })
          })
      })
