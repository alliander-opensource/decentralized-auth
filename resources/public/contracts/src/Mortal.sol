pragma solidity ^0.4.10;


import "Owned.sol";

contract Mortal is Owned {
  function remove() onlyOwner {
    selfdestruct(owner);
  }
}
