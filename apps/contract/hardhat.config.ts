import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY is not defined");

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

export default config;
