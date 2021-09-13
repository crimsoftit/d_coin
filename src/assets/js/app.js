console.log("app.js loaded");

App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',

    init: function() {
        console.log("App initialized...")
        return App.initWeb3();
    },

    initWeb3: function () {
        if (typeof web3 !== 'undefined') {
            // if a web3 instance is already provided by MetaMask...
            App.web3Provider = web3.currentProvider;
            web3 = new Web3(web3.currentProvider);
        } else {
            // specify default instance if no web3 instance is prvided
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
            web3 = new Web3(App.web3Provider);
        }

        return App.initContracts();
    },

    initContracts: function() {
		$.getJSON("DuaraTokenSale.json", function(DuaraTokenSale) {
			App.contracts.DuaraTokenSale = TruffleContract(DuaraTokenSale);
			App.contracts.DuaraTokenSale.setProvider(App.web3Provider);
			App.contracts.DuaraTokenSale.deployed().then(function(DuaraTokenSale) {
				console.log("DuaraCoin Token Sale Address: ", DuaraTokenSale.address);
			});
		}).done(function() {
			$.getJSON("DuaraToken.json", function(DuaraToken) {
				App.contracts.DuaraToken = TruffleContract(DuaraToken);
				App.contracts.DuaraToken.setProvider(App.web3Provider);
				App.contracts.DuaraToken.deployed().then(function(DuaraToken) {
					console.log("DuaraCoin Token Address: ", DuaraToken.address);
				});
                return App.render();
			});
		});
	},

    render: function () {
        // load account data
        web3.eth.getCoinbase(function(err, account) {
            App.account = account;
            $('#accountAddress').html("Your account address is " + account);
        })
    }
}

$(function () {
    $(window).on('load', function() {
        App.init();
    })
});