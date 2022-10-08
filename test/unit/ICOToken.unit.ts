import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import {
  name,
  premint,
  symbol,
  maxSupply,
  valueInEth,
  icoDurationBlocks,
  taxPercent
} from "../../helper-hardhat-config"
import { deployments, ethers } from "hardhat"
import { IcoToken } from "../../typechain-types"

describe("unit tests", () => {
  let icoToken: IcoToken
  let deployer: SignerWithAddress
  before(async () => {
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    await deployments.fixture(["all"])
    icoToken = await ethers.getContract(name, deployer)
  })

  describe("Constructor", () => {
    it("correct premint supply", async () => {
      const supply = await icoToken.totalSupply()
      expect(supply).to.be.equal(ethers.utils.parseUnits(premint.toString()))
    })

    it("correct max supply", async () => {
      const supply = await icoToken.getMaxSupply()
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
      const tax = await icoToken.getTaxPercent()
      expect(tax).to.be.equal(taxPercent)
    })
    it("correct tax address", async () => {
      const address = await icoToken.getTaxAddress()
      expect(address).to.be.equal(deployer.address)
    })
  })
})
