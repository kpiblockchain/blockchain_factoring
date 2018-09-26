var FakBlock = artifacts.require("./FakBlock.sol");

module.exports = function(deployer) {
  deployer.deploy(FakBlock);
};
