pragma solidity ^0.4.24;


contract FakBlock {

    enum FakState { New, Sold }

    struct FakRecord {
        address owner;
        FakState state;
        bytes32 ipfs_hash; //TODO replace with smaller type
    }

    mapping (bytes32 => FakRecord) invoices;
    mapping (address => bytes32[]) owners;

    function getState(bytes32 fakHash) public view returns (FakState) {
        return invoices[fakHash].state;
    }

    function getOwner(bytes32 fakHash) public view returns (address) {
        return invoices[fakHash].owner;
    }

    function getIpfsHash(bytes32 fakHash) public view returns (address) {
        return invoices[fakHash].owner;
    }

    function getFakByOwner(address owner) public view returns (bytes32[]) {
        return owners[owner];
    }

    function createFack(bytes32 fakHash, bytes32 ipfs_hash) public returns(bool) {
        require(invoices[fakHash].owner == address(0), "duplicate");
        invoices[fakHash].owner = msg.sender;
        invoices[fakHash].ipfs_hash = ipfs_hash;
        invoices[fakHash].state = FakState.Sold;
        owners[msg.sender].push(fakHash);
        return true;
    }

}
