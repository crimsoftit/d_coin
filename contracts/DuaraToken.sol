pragma solidity ^0.5.0;

contract DuaraToken {

	// set the token name
	string public name = "Duara Coin";

	// set the token symbol
	string public symbol = "DHC";

	// set the token standard
	string public standard = "DHC v1.0.0";

	// set the total no. of tokens
	uint256 public totalSupply;

	mapping (address => uint256) public balanceOf;
	mapping (address => mapping (address => uint256)) public allowance;

	// declare transfer event
	event Transfer (
		address indexed _from,
		address indexed _to,
		uint256 _value
	);
	
	// declare approval event
	event Approval (
		address indexed _owner,
		address indexed _spender,
		uint256 _value
	);
	

	// constructor
  	constructor(uint256 _initialSupply) public {
  		// allocate the initial supply to the admin account
  		balanceOf[msg.sender] =_initialSupply;
    	totalSupply = _initialSupply;
  	}


  	// transfer tokens function
  	function transfer (address _to, uint256 _value) public returns(bool success) {
  		// throw exception for insufficient funds
  		require (balanceOf[msg.sender] >= _value);
  		
  		// update the balances
  		balanceOf[msg.sender] -= _value;
  		balanceOf[_to] += _value;
	  	

	  	// emit transfer event
	  	emit Transfer (msg.sender, _to, _value);

	  	// return a boolean
	  	return true;
  	}

  	
  	// approve delegated transfer of tokens
  	function approve (address _spender, uint256 _value) public returns(bool success) {
  		// set the allowance
  		allowance[msg.sender][_spender] = _value;

  		// trigger the approval event
  		emit Approval (msg.sender, _spender, _value);
  		
  		return true;
  	}


  	// transferFrom function
  	function transferFrom (address _from, address _to, uint256 _value) public returns(bool success) {

  		// require that the _from account has sufficient tokens
  		require (balanceOf[_from] >= _value);
  		
  		// require that the allowance is big enough
  		require (allowance[_from][msg.sender] >= _value);  		

  		// update the sender's balance
  		balanceOf[_from] -= _value;

  		// update the receiver's balance
  		balanceOf[_to] += _value;

  		// update the allowance
  		allowance[_from][msg.sender] -= _value;

  		// trigger a transfer event
  		emit Transfer(_from, _to, _value);

  		// return a boolean
  		return true;
  	}
  	
}

