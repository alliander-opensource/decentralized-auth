pragma solidity ^0.4.10;


contract Owned {

  address owner;

  modifier onlyOwner {
    require(msg.sender == owner);
    _;
  }
}
