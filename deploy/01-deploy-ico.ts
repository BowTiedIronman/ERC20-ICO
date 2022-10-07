import { HardhatRuntimeEnvironment } from "hardhat/types"
import { DeployFunction } from "hardhat-deploy/types"
import { networkConfig, totalSupply } from "../helper-hardhat-config"

const deployIco: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { getNamedAccounts, deployments, network } = hre
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId: number = network.config.chainId!

  console.log({ deployer })

  if (chainId == 31337) {
  } else {
  }

  const args: any[] = [totalSupply]
  const goFundMe = await deploy("ICOToken", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: 1
  })
}

export default deployIco
//  tags are useful when you dont want to deploy all scripts
// yarn hardhat deploy --netowrk rinkeby --tags fundMe
deployIco.tags = ["all", "ico"]
