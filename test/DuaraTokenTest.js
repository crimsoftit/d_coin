const DuaraToken = artifacts.require("DuaraToken");


contract('DuaraToken', function (accounts) {

	var tokenInstance;

	it ('initializes the contract with the correct token values', function () {
		return DuaraToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.name();
		}).then(function(name) {
			assert.equal(name, "Duara Coin", "token has the correct name");
			return tokenInstance.symbol();
		}).then(function(symbol) {
			assert.equal(symbol, "DHC", "token has the correct symbol");
			return tokenInstance.standard();
		}).then(function(standard) {
			assert.equal(standard, "DHC v1.0.0", "token has the correct standard");
		});
	});

	it ('allocates the initial supply of tokens upon deployment', function () {
		return DuaraToken.deployed().then(function(instance) {
			tokenInstance = instance;
			return tokenInstance.totalSupply();
		}).then(function(totalSupply) {
			assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply of tokens to 1,000,000');
			return tokenInstance.balanceOf(accounts[0]);
		}).then(function(adminBalance) {
			assert.equal(adminBalance.toNumber(), 1000000, 'allocates the initial supply to the admin account');
		});
	});

	it ('transfers token ownership', function() {
		return DuaraToken.deployed().then(function(instance) {
			tokenInstance = instance;

			// test require statement first by transfering a value larger than the sender balance
			return tokenInstance.transfer.call(accounts[1], 1000001);
		}).then(assert.fail).catch(function (error) {
			assert(error.message.indexOf('revert') >= 0, "error msg must contain revert");
			return tokenInstance.transfer.call(accounts[1], 250000, { from: accounts[0] });
		}).then (function (success) {
			assert.equal(success, true, "should return true");
			return tokenInstance.transfer(accounts[1], 250000, { from: accounts[0] });
		}).then(function (receipt) {
			assert.equal(receipt.logs.length, 1, "triggers one event");
			assert.equal(receipt.logs[0].event, "Transfer", "should be the Transfer event");
			assert.equal(receipt.logs[0].args._from, accounts[0], "logs the sender account");
			assert.equal(receipt.logs[0].args._to, accounts[1], "logs the receiver account");
			assert.equal(receipt.logs[0].args._value, 250000, "logs the transfer amount");
			return tokenInstance.balanceOf(accounts[1]);
		}).then (function (receiverBal) {
			assert.equal(receiverBal.toNumber(), 250000, "adds transfer amount to the receiving account");
			return tokenInstance.balanceOf(accounts[0]);
		}).then (function (senderBal) {
			assert.equal(senderBal.toNumber(), 750000, "deducts transfer amount from sender account");
		});
	});


	it ('approves tokens for delegated transfer', function () {
		return DuaraToken.deployed().then(function (instance) {
			tokenInstance = instance;
			return tokenInstance.approve.call(accounts[1], 100);
		}).then (function (success) {
			assert.equal(success, true, 'returns true');
			return tokenInstance.approve(accounts[1], 100);
		}).then (function (receipt) {
			assert.equal(receipt.logs.length, 1, "triggers one event");
			assert.equal(receipt.logs[0].event, "Approval", "should be the Approval event");
			assert.equal(receipt.logs[0].args._owner, accounts[0], "logs the owner account");
			assert.equal(receipt.logs[0].args._spender, accounts[1], "logs the spender account");
			assert.equal(receipt.logs[0].args._value, 100, "logs the approved amount");
			return tokenInstance.allowance(accounts[0], accounts[1]);
		}).then (function (allowance) {
			assert.equal(allowance.toNumber(), 100, "stores the allowance for delegated transfer");
		});
	});


	it ('handles delegated transfers', function () {
		return DuaraToken.deployed().then(function (instance) {
			tokenInstance = instance;
			fromAccount = accounts[2];
			toAccount = accounts[3];
			spendingAccount = accounts[4];

			// transfer some tokens to fromAccount
			return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
		}).then (function(receipt) {

			// approve spendingAccount to spend 10 tokens from fromAccount
			return tokenInstance.approve(spendingAccount, 10, { from: fromAccount });
		}).then (function (receipt) {

			// try transfering a value larger than the sender balance
			return tokenInstance.transferFrom(fromAccount, toAccount, 101, { from: spendingAccount });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf("revert") >= 0, "error! insufficient balance in sender account");

			// try transfering a value larger than the approved amount
			return tokenInstance.transferFrom(fromAccount, toAccount, 11, { from: spendingAccount });
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf("revert") >= 0, "error! transfer amount not approved");
			return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount });
		}).then(function(success) {
			assert.equal(success, true, 'returns true');
			return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount });
		}).then(function(receipt) {
			assert.equal(receipt.logs.length, 1, "triggers one event");
			assert.equal(receipt.logs[0].event, "Transfer", "should be the Transfer event");
			assert.equal(receipt.logs[0].args._from, fromAccount, "logs the sender's a/c");
			assert.equal(receipt.logs[0].args._to, toAccount, "logs the receiver's a/c");
			assert.equal(receipt.logs[0].args._value, 10, "logs the transfer amount");
			return tokenInstance.balanceOf(fromAccount);
		}).then(function(fromAccountBal) {
			assert.equal(fromAccountBal.toNumber(), 90, "deducts funds from sender's account");
			return tokenInstance.balanceOf(toAccount);
		}).then(function(toAccountBal) {
			assert.equal(toAccountBal.toNumber(), 10, "adds funds to the receiver's account");
			return tokenInstance.allowance(fromAccount, spendingAccount);
		}).then(function(allowance) {
			assert.equal(allowance.toNumber(), 0, "updates the allowance");
		});
	});
});
