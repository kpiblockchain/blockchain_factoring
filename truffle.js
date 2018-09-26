var HDWalletProvider = require("truffle-hdwallet-provider");


module.exports = {
    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        rinkeby: {
            host: "localhost", // Connect to geth on the specified
            port: 8545,
            from: "0X5b6ed0b9bb3447b6eb170da313c21337f2e46467", // default address to use for any transaction Truffle makes during migrations
            network_id: 4,
            gas: 4612388 // Gas limit used for deploys
        }
    },
    solc: {
        optimizer: {
           enabled: true,
            runs: 200
        }
    }
};
