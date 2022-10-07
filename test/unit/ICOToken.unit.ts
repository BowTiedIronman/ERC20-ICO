import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { expect } from "chai"
import { name, symbol, totalSupply } from "../../helper-hardhat-config"
import { deployments, ethers } from "hardhat"
import { ICOToken } from "../../typechain-types"

describe("unit tests", () => {
  let icoToken: ICOToken
  let deployer: SignerWithAddress
  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    await deployments.fixture(["all"])
    icoToken = await ethers.getContract("ICOToken", deployer)
  })

  describe("initial arguments", () => {
    it("correct supply", async () => {
      const response = await icoToken.totalSupply()
      expect(response).to.be.equal(totalSupply)
    })
    it("correct name", async () => {
      const response = await icoToken.name()
      expect(response).to.be.equal(name)
    })
    it("correct symbol", async () => {
      const response = await icoToken.symbol()
      expect(response).to.be.equal(symbol)
    })
  })
})
