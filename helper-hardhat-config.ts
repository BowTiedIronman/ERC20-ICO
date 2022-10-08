export const maxSupply = 21 * 10 ** 6 // 21 million
export const premint = 21 * 10 ** 5
export const name = "IcoToken"
export const symbol = "TKN"
export const valueInEth = 100
export const icoDurationBlocks = 50
export const taxBasisPoints = 100 // 1%

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
