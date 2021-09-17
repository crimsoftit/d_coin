console.log("app.js loaded");

App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokensSold: 0,
    tokenAvailable: 750000,

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
        if (App.loading) {
            return;
        }
        App.loading = true;

        var loader = $('#preloader');
        var content = $('#content');

        loader.show();
        content.hide();
        
        // load account data
        web3.eth.getCoinbase(function(err, account) {
            if(err === null) {
                App.account = account;
                $('#accountAddress').html("Your account address is " + account);
            } else {
                $('#accountAddress').html("ERROR LOADING ACCOUNT ADDRESS!!!");
            }
        });

        // load DuaraTokenSale contract
        App.contracts.DuaraTokenSale.deployed().then(function (instance) {
            duaraTokenSaleInstance = instance;
            return duaraTokenSaleInstance.tokenPrice();
        }).then(function (tokenPrice) {
            console.log("token price: ", tokenPrice.toNumber());
            App.tokenPrice = tokenPrice;
            $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
            return duaraTokenSaleInstance.tokensSold();
        }).then(function (tokensSold) {
            console.log("total no. of tokens sold: ", tokensSold.toNumber());
            App.tokensSold = tokensSold.toNumber();
            $('.tokens-sold').html(App.tokensSold);
            $('.tokens-available').html(App.tokenAvailable);

            var progress = (App.tokensSold / App.tokenAvailable) * 100;
            console.log(progress);
            $('.progress-bar').css('width', progress + '%');

            // load DuaraToken contract
            App.contracts.DuaraToken.deployed().then(function (instance) {
                duaraTokenInstance = instance;
                return duaraTokenInstance.balanceOf(App.account);
            }).then(function (balance) {
                $('.dapp-balance').html(balance.toNumber());
            });
        });


        App.loading = false;
        loader.hide();
        content.show();
    }
}

$(function () {
    $(window).on('load', function() {
        App.init();
    })
});