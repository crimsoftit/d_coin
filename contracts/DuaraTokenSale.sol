pragma solidity ^0.5.0;

import "./DuaraToken.sol";


contract DuaraTokenSale {

	address admin;
	DuaraToken public tokenContract;
	uint256 public tokenPrice;
	uint256 public tokensSold;

	event Sell(address _buyer, uint256 _amount);
	


  	constructor(DuaraToken _tokenContract, uint256 _tokenPrice) public {
    	// assign an admin
    	admin = msg.sender;

    	// add token contract (to purchase tokens)
    	tokenContract = _tokenContract;

    	// token price
    	tokenPrice = _tokenPrice;
  	}


  	function buyTokens (uint256 _numberOfTokens) public payable {

  		// require that the contract has enough tokens
  		require (tokenContract.balanceOf(address(this )) >= _numberOfTokens);

  		// require that value (numberOfTokens * tokenPrice) is equal to tokens
  		require (msg.value == multiply(_numberOfTokens, tokenPrice));
  		
  		// require that a transfer is successful
  		require (tokenContract.transfer(msg.sender, _numberOfTokens));  		

  		// keep track of the no. of tokens sold
  		tokensSold += _numberOfTokens;

  		// trigger sell event
  		emit Sell(msg.sender, _numberOfTokens);
  	}


  	// safe math (multiply)
  	function multiply (uint x, uint y) internal pure returns(uint z) {
  		require (y == 0 || (z = x * y) / y == x);  		
  	}
  	  	  	
}
