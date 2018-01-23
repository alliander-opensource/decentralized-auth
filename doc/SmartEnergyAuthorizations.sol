pragma solidity ^0.4.10;


import "Mortal.sol";


contract SmartEnergyAuthorizations is Mortal {

  // Mapping from data provider to prosumer
  mapping(address => address) claims;

  // Mapping from data provider to service provider to authorization flag
  mapping(address => mapping(address => bool)) authorizations;

  // Constructor
  function SmartEnergyAuthorizations() {
    owner = msg.sender;
  }

  function claimDataProvider(address prosumer) {
    address dataProvider = msg.sender;
    claims[dataProvider] = prosumer;
  }

  function authorize(address dataProvider, address serviceProvider) {
    address prosumer = msg.sender;

    require(claims[dataProvider] == prosumer);

    authorizations[dataProvider][serviceProvider] = true;
  }

  function revoke(address dataProvider, address serviceProvider) {
    address prosumer = msg.sender;

    require(claims[dataProvider] == prosumer);

    authorizations[dataProvider][serviceProvider] = false;
  }

  function isAuthorized(address serviceProvider) constant returns (bool) {
    address dataProvider = msg.sender;

    // NOTE: Returns false when no entry for dataProvider, or for dataProvider
    // and serviceProvider, exists in the `authorizations` mapping.
    return authorizations[dataProvider][serviceProvider];
  }

}
