import { HardhatUserConfig } from "hardhat/config"
import "@nomiclabs/hardhat-waffle"
import "@idle-finance/hardhat-proposals-plugin"

require('dotenv').config()

import "./scripts/iip-11"
import "./scripts/iip-12"
import "./scripts/iip-13"
import "./scripts/iip-14"
import "./scripts/iip-15"
import "./scripts/iip-upgrade"
import "./scripts/generic-test"
import "./scripts/test-idle-token"
import "./scripts/example-upgrade"
import "./scripts/execute-proposal-or-simulate"
import "./scripts/deploy-rebalancer-polygon"
import "./scripts/upgrade-and-call-polygon"

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 25
          }
        }
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
        // blockNumber: 12725152, // iip-11
        // blockNumber: 13235728, // iip-12
        // blockNumber: 13334600, // iip-13
        // blockNumber: 13372333, // iip-14
        blockNumber: 13416755, // iip-15
        // url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        // blockNumber: 19645454,
      },
      // chainId: 137,
      chainId: 1
      // allowUnlimitedContractSize: true
    },
    mainnet: {
      url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      gasPrice: 'auto',
      gas: 'auto',
      timeout: 1200000
    },
    matic: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      gasPrice: 'auto',
      gas: 'auto',
      timeout: 1200000,
      chainId: 137
    }
  },
  proposals: {
    governor: "0x2256b25CFC8E35c3135664FD03E77595042fe31B",
    votingToken: "0x875773784Af8135eA0ef43b5a374AaD105c5D39e"
  }
}

export default config;
