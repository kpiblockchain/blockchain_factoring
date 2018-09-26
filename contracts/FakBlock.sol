pragma solidity ^0.4.24;


contract FakBlock {

  enum FakState { New, Sold }

  struct FakRecord {
      address owner;
      FakState state;
      bytes32 hash
      uint8 hash_function
      uint8 size
  }

	mapping (bytes32 => FakRecord) invoices;

  function getState(bytes32 fakHash) public view returns (FakState) {
    return invoices[fakHash].state;
  }

  function getOwner(bytes32 fakHash) public view returns (address) {
      return invoices[fakHash].owner;
  }

  function createFack(bytes32 fakHash) public returns(bool) {
    require(invoices[fakHash].owner == address(0));
    invoices[fakHash].owner = msg.sender;
    invoices[fakHash].state = FakState.Sold;
    return true;
  }

}
