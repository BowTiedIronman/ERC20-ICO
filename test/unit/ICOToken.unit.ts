import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { assert, expect } from "chai"
import { networkConfig, totalSupply } from "../../helper-hardhat-config"
import { deployments, ethers } from "hardhat"
import { ICOToken, ICOToken__factory } from "../../typechain-types"
import { BigNumber } from "ethers"

describe("unit tests", () => {
  let icoToken: ICOToken
  let deployer: SignerWithAddress
  beforeEach(async () => {
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    await deployments.fixture(["all"])
    icoToken = await ethers.getContract("ICOToken", deployer)
  })

  it("should mint initial supply", async () => {
    const response = await icoToken.totalSupply()
    expect(response).to.be.equal(totalSupply)
  })
})
