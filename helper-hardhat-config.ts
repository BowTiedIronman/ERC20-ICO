import { ethers } from "hardhat"

// {chainId : {name, eth/usd oracle address}}
export const networkConfig: {
  [key: number]: { name: string }
} = {
  4: {
    name: "rinkeby"
  },
  5: {
    name: "goerli"
  }
}

export const totalSupply = ethers.BigNumber.from(1000)
