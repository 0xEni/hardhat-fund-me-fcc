// function deployFunc() {
//     console.log("Hi!")
// }

// module.exports.default = deployFunc

const { networkConfig, developmentChains } = require("../helper-hardhat-cofig")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    //if chainId is x use address 1
    //if chain is z use address 2
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    // if contract doesnt exist, deploy minimal version for local testing
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //Put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    //if not on development chain
    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args)
    }
    log("----------------------")
}

module.exports.tags = ["all", "fundme"]
