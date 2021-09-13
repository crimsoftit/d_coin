const DuaraToken = artifacts.require("DuaraToken");
const DuaraTokenSale = artifacts.require("DuaraTokenSale");


contract ("DuaraTokenSale", function(accounts) {
	var tokenInstance;
	var tokenSaleInstance;
	var admin = accounts[0];
	var buyer = accounts[1];
	var tokenPrice = 1000000000000000; // in wei
	var tokensAvailable = 750000;
	var numberOfTokens;

	it("initializes the contract with the correct values", function() {
		return DuaraTokenSale.deployed().then(function(instance) {
			tokenSaleInstance = instance;
			return tokenSaleInstance.address;
		}).then(function(tokenSaleAddress) {
			assert.notEqual(tokenSaleAddress, 0x0, "token sale contract has address");
			return tokenSaleInstance.tokenContract();
		}).then(function(tokenAddress) {
			assert.notEqual(tokenAddress, 0x0, "token contract has address");
			return tokenSaleInstance.tokenPrice();
		}).then(function(price) {
			assert.equal(price, tokenPrice, "token price is correct");
		});
	});

	it("facilitates purchase of tokens", function () {
		return DuaraToken.deployed().then(function (tInstance) {

			// grab token instance first
			tokenInstance = tInstance;
			return DuaraTokenSale.deployed();
		}).then(function (tSaleInstance) {

			// then grab token sale instance
			tokenSaleInstance = tSaleInstance;

			// provision 75% of all tokens to the token sale contract
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin });
		}).then(function (receipt) {

			numberOfTokens = 10;
			assert.equal(receipt.logs.length, 1, "triggers one event");
			assert.equal(receipt.logs[0].event, "Transfer", "should be the Transfer event");
			assert.equal(receipt.logs[0].args._from, admin, "logs the sender (admin) account");
			assert.equal(receipt.logs[0].args._to, tokenSaleInstance.address, "logs the token sale account address");
			assert.equal(receipt.logs[0].args._value, tokensAvailable, "logs the transfer amount");
			return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });
		}).then(function (receipt) {
			assert.equal(receipt.logs.length, 1, "triggers one event");
			assert.equal(receipt.logs[0].event, "Sell", "should be the Sell event");
			assert.equal(receipt.logs[0].args._buyer, buyer, "logs the buyer account");
			assert.equal(receipt.logs[0].args._amount, numberOfTokens, "logs the no. of tokens purchased")
			return tokenSaleInstance.tokensSold();
		}).then(function (amount) {
			assert.equal(amount.toNumber(), numberOfTokens, "increments the no. of tokens sold");
			return tokenInstance.balanceOf(buyer);
		}).then(function (buyerBal) {
			assert.equal(buyerBal.toNumber(), numberOfTokens);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function (icoBal) {
			assert.equal(icoBal.toNumber(), tokensAvailable - numberOfTokens);

			// try to purchase tokens worth an insignificant value of ether (very little)
			return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
		}).then(assert.fail).catch(function (error) {
			assert(error.message.indexOf("revert") >= 0, "msg.value must equal no. of tokens in wei");

			// try to purchase more tokens than available
			return tokenSaleInstance.buyTokens(750001, { from: buyer, value: numberOfTokens * tokenPrice });
		}).then(assert.fail).catch(function (error) {
			assert(error.message.indexOf("revert") >= 0, "cannot purchase more tokens than available");
		});
	});
});