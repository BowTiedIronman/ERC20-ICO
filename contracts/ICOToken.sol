// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";

import "hardhat/console.sol";

error IcoToken__MaxSupplyExceeded();
error IcoToken_FailedToSendEth();
error IcoToken_ICOIsOver();

contract IcoToken is ERC20, ERC20Burnable, Pausable, Ownable {
    uint256 immutable i_maxSupply;
    uint256 immutable i_valueInEth;
    uint256 immutable i_icoStartBlock;
    uint256 immutable i_icoDurationBlocks;
    uint8 immutable i_taxPercent;
    address immutable i_taxAddress;

    // uint256 immutable s_amountLocked;

    constructor(
        uint256 preMint,
        uint256 maxSupply,
        string memory name,
        string memory symbol,
        uint256 valueInEth,
        uint256 icoStartBlock,
        uint256 icoDurationBlocks,
        uint8 taxPercent,
        address taxAddress
    ) ERC20(name, symbol) {
        _mint(address(this), preMint * 10**decimals()); // insiders/investors
        i_maxSupply = maxSupply * 10**decimals();
        i_valueInEth = valueInEth;
        if (icoStartBlock == 0) icoStartBlock = block.number;
        i_icoStartBlock = icoStartBlock;
        i_icoDurationBlocks = icoDurationBlocks;
        i_taxPercent = taxPercent;
        i_taxAddress = taxAddress;
    }

    receive() external payable {}

    /** Getter Functions */

    function getMaxSupply() public view returns (uint256) {
        return i_maxSupply;
    }

    function getValueInEth() public view returns (uint256) {
        return i_valueInEth;
    }

    function getIcoStartBlock() public view returns (uint256) {
        return i_icoStartBlock;
    }

    function getIcoDurationBlocks() public view returns (uint256) {
        return i_icoDurationBlocks;
    }

    function getTaxPercent() public view returns (uint8) {
        return i_taxPercent;
    }

    function getTaxAddress() public view returns (address) {
        return i_taxAddress;
    }
}
