import hre from "hardhat"
import { setBalance } from "@nomicfoundation/hardhat-network-helpers"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import {
  name,
  premint,
  symbol,
  maxSupply,
  valueInEth,
  icoDurationBlocks,
  taxBasisPoints
} from "../../helper-hardhat-config"
import { deployments, ethers, network } from "hardhat"
import { IcoToken } from "../../typechain-types"
import { BigNumber } from "ethers"

describe("unit tests", () => {
  let icoToken: IcoToken
  let deployer: SignerWithAddress
  let minter: SignerWithAddress
  let accounts: SignerWithAddress[]
  beforeEach(async () => {
    accounts = await ethers.getSigners()
    deployer = accounts[0]
    minter = accounts[1]
    await deployments.fixture(["all"])
    icoToken = await ethers.getContract(name, deployer)
  })

  describe("Constructor", () => {
    it("correct premint supply", async () => {
      const supply = await icoToken.totalSupply()
      expect(supply.toString()).to.be.equal(
        ethers.utils.parseUnits(premint.toString())
      )
    })
    it("correct premint amount owned by contract", async () => {
      const supply = await icoToken.totalSupply()
      const expectedSupply = ethers.utils.parseUnits(premint.toString())
      expect(supply.toString()).to.be.equal(expectedSupply.toString())
    })
    it("correct max supply", async () => {
      const supply = await icoToken.cap()
      expect(supply).to.be.equal(ethers.utils.parseUnits(maxSupply.toString()))
    })
    it("correct name", async () => {
      const response = await icoToken.name()
      expect(response).to.be.equal(name)
    })
    it("correct symbol", async () => {
      const response = await icoToken.symbol()
      expect(response).to.be.equal(symbol)
    })
    it("correct value per ETH", async () => {
      const value = await icoToken.getValueInEth()
      expect(value).to.be.equal(valueInEth)
    })
    it("correct ICO duration", async () => {
      const duration = await icoToken.getIcoDurationBlocks()
      expect(duration).to.be.equal(icoDurationBlocks)
    })
    it("correct tax percent", async () => {
      const tax = await icoToken.getTaxBasisPoints()
      expect(tax).to.be.equal(taxBasisPoints)
    })
    it("correct tax address", async () => {
      const address = await icoToken.getTaxAddress()
      expect(address).to.be.equal(deployer.address)
    })
  })
  describe("Basic Specs", () => {
    describe("mint", () => {
      beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["all"])
        icoToken = await ethers.getContract(name, deployer)
      })
      it("should revert with MaxSupplyExceeded", async () => {
        const revertedMintAmount = maxSupply - premint + 1
        const revertedMintAmountInEth = revertedMintAmount / valueInEth
        const minterStartBalance = await (
          await minter.getBalance()
        ).add(ethers.utils.parseEther(maxSupply.toString()))
        setBalance(minter.address, minterStartBalance)
        await expect(
          icoToken.connect(minter).mint({
            value: ethers.utils.parseEther(revertedMintAmountInEth.toString())
          })
        ).to.be.revertedWith("ERC20Capped: cap exceeded")
      })
      it("should revert with ICOIsOver", async () => {
        await hre.network.provider.send("evm_increaseTime", [3600])
        await hre.network.provider.send("hardhat_mine", [
          ethers.utils.hexlify(icoDurationBlocks + 1)
        ])
        await expect(
          icoToken.connect(minter).mint({
            value: ethers.utils.parseEther("1")
          })
        ).to.be.revertedWithCustomError(icoToken, "IcoToken_ICOIsOver")
      })
      it("should mint correct amount", async () => {
        const mintedInEth = 2
        await icoToken.connect(minter).mint({
          value: ethers.utils.parseEther(mintedInEth.toString())
        })
        const expectedAmountMinted = valueInEth * mintedInEth
        const minted = (await icoToken.balanceOf(minter.address)).toString()
        expect(
          ethers.utils.parseEther(expectedAmountMinted.toString())
        ).to.be.equal(minted)
      })
    })
    describe("burn", () => {
      beforeEach(async () => {
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        await deployments.fixture(["all"])
        icoToken = await ethers.getContract(name, deployer)
        const mintedInEth = 2
        await icoToken.connect(minter).mint({
          value: ethers.utils.parseEther(mintedInEth.toString())
        })
      })
      it("token owner can burn", async () => {
        const balance = icoToken.balanceOf(minter.address)
        const burning = await icoToken.connect(minter).burn(balance)
        const afterBalance = await icoToken.balanceOf(minter.address)
        expect(afterBalance).to.be.equal("0")
      })
    })
  })

  describe("Pausable", () => {
    it("should revert mint with Pausable: paused", async () => {
      await icoToken.pause()
      await expect(
        icoToken.connect(minter).mint({
          value: ethers.utils.parseEther("1")
        })
      ).to.be.revertedWith("Pausable: paused")
    })
    it("should revert transfer with Pausable: paused", async () => {
      const minter = accounts[1]
      await icoToken.connect(minter).mint({
        value: ethers.utils.parseEther("1")
      })
      await icoToken.pause()

      await expect(
        icoToken.connect(minter).transfer(accounts[2].address, 1)
      ).to.be.revertedWith("Pausable: paused")
    })
    it("shoud unpause", async () => {
      await icoToken.pause()
      await icoToken.unpause()
      const txResponse = await icoToken.connect(minter).mint({
        value: ethers.utils.parseEther("1")
      })
      const txReceipt = await txResponse.wait(1)
      expect(txReceipt.status).to.be.equal(1)
    })
  })

  describe("Taxation", () => {
    let balance: BigNumber
    let destination: SignerWithAddress
    let finalBalance: BigNumber
    let expectedTaxedAmount: BigNumber
    beforeEach(async () => {
      accounts = await ethers.getSigners()
      deployer = accounts[0]
      await deployments.fixture(["all"])
      icoToken = await ethers.getContract(name, deployer)
      const mintedInEth = 2
      const txResponse = await icoToken.connect(minter).mint({
        value: ethers.utils.parseEther(mintedInEth.toString())
      })
      const txReceipt = await txResponse.wait(1)
      const event = txReceipt.events![0]
      balance = event.args?.value
      destination = accounts[2]
      await icoToken.connect(minter).transfer(destination.address, balance)
      finalBalance = await icoToken.balanceOf(destination.address)
      expectedTaxedAmount = balance.mul(taxBasisPoints).div(10000)
    })
    it("should tax", async () => {
      expect(balance.toString()).to.be.equal(
        finalBalance.add(expectedTaxedAmount)
      )
    })
    it("should send tax to wallet", async () => {
      expect(
        (await icoToken.balanceOf(deployer.address)).toString()
      ).to.be.equal(expectedTaxedAmount.toString())
    })
    it("should change tax wallet", async () => {
      const newTaxAddress = accounts[3].address
      await icoToken.setTaxAddress(newTaxAddress)
      expect(await icoToken.getTaxAddress()).to.be.eq(newTaxAddress)
    })
  })
})
