import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import {
  icoDurationBlocks,
  maxSupply,
  name,
  networkConfig,
  premint,
  symbol,
  taxBasisPoints,
  valueInEth
} from "../helper-hardhat-config"

const deployIco: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId: number = network.config.chainId!

  // if (chainId == 31337) {
  // } else {
  // }

  const args: any[] = [
    premint,
    maxSupply,
    name,
    symbol,
    valueInEth,
    0, //icoStartBlock // if 0, constructor sets icoStartBlock = block.number;
    icoDurationBlocks,
    taxBasisPoints,
    deployer // taxAddress
  ]

  console.log({ args })

  const icoToken = await deploy("IcoToken", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: 1
  })
}

export default deployIco
//  tags are useful when you dont want to deploy all scripts
// yarn hardhat deploy --netowrk rinkeby --tags fundMe
deployIco.tags = ["all", "token"]
