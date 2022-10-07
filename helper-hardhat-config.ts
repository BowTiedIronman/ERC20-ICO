import { ethers } from "hardhat"

export const totalSupply = ethers.BigNumber.from(1000)
export const name = "ICOToken"
export const symbol = "TKN"

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
