pragma solidity ^0.4.10;


import "Mortal.sol";


contract SmartEnergyAuthorizations is Mortal {

  // Mapping from device to consumer
  mapping(address => address) claims;

  // Mapping from device to app to authorization flag
  mapping(address => mapping(address => bool)) authorizations;

  // Constructor
  function SmartEnergyAuthorizations() {
    owner = msg.sender;
  }

  function claimDevice(address consumer) {
    address device = msg.sender;
    claims[device] = consumer;
  }

  function authorize(address device, address app) {
    address consumer = msg.sender;

    require(claims[device] == consumer);

    authorizations[device][app] = true;
  }

  function revoke(address device, address app) {
    address consumer = msg.sender;

    require(claims[device] == consumer);

    authorizations[device][app] = false;
  }

  function isAuthorized(address app) constant returns (bool) {
    address device = msg.sender;

    // NOTE: Returns false when no entry for device, or for
    // device and app, exists in the `authorizations` mapping.
    return authorizations[device][app];
  }

}
