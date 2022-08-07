import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337   // We set 1337 to make interacting with MetaMask simpler
    },
    rinkeby: {
      url: process.env.RINKEBY_API_URL || "",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY !== undefined ? process.env.POLYGONSCAN_API_KEY : "",
      goerli: process.env.ETHERSCAN_API_KEY !== undefined ? process.env.ETHERSCAN_API_KEY : "",
    },
  },
}

export default config;
