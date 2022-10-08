import { ethers } from "ethers"

export const provider = new ethers.providers.AlchemyProvider(
  "homestead",
  process.env.NODE_PROVIDER_KEY
)
