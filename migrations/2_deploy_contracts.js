const DuaraToken = artifacts.require("DuaraToken");
const DuaraTokenSale = artifacts.require("DuaraTokenSale");


module.exports = function (deployer) {
  	deployer.deploy(DuaraToken, 1000000).then(function() {

  		// Token price is 0.001 Ether
  		var tokenPrice = 1000000000000000;
  		return deployer.deploy(DuaraTokenSale, DuaraToken.address, tokenPrice);
  	});
};
