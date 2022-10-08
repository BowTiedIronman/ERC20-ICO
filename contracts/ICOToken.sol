// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/finance/VestingWallet.sol";

error IcoToken_FailedToSendEth();
error IcoToken_ICOIsOver();

contract IcoToken is ERC20Capped, ERC20Burnable, Pausable, Ownable {
    uint256 private immutable i_valueInEth;
    uint256 private immutable i_icoStartBlock;
    uint256 private immutable i_icoDurationBlocks;
    uint16 private immutable i_taxBasisPoints;
    address private s_taxAddress;

    constructor(
        uint256 preMint,
        uint256 maxSupply,
        string memory name,
        string memory symbol,
        uint256 valueInEth,
        uint256 icoStartBlock,
        uint256 icoDurationBlocks,
        uint16 taxBasisPoints,
        address taxAddress
    )
        ERC20(name, symbol)
        ERC20Capped(maxSupply * 10**decimals())
        ERC20Burnable()
    {
        _mint(address(this), preMint * 10**decimals()); // insiders/investors
        i_valueInEth = valueInEth;
        if (icoStartBlock == 0) icoStartBlock = block.number;
        i_icoStartBlock = icoStartBlock;
        i_icoDurationBlocks = icoDurationBlocks;
        i_taxBasisPoints = taxBasisPoints > 10000 ? 10000 : taxBasisPoints; // including 2 basis points : 10000 = %100.00
        s_taxAddress = taxAddress;
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint() public payable whenNotPaused {
        uint256 amountToMint = msg.value * i_valueInEth;
        if (block.number > i_icoStartBlock + i_icoDurationBlocks)
            revert IcoToken_ICOIsOver();
        _mint(msg.sender, amountToMint);
    }

    function _mint(address to, uint256 amount)
        internal
        override(ERC20Capped, ERC20)
    {
        super._mint(to, amount);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override whenNotPaused {
        uint256 tax = (amount * i_taxBasisPoints) / 10000;

        super._transfer(from, s_taxAddress, tax);
        super._transfer(from, to, amount - tax);
    }

    function setTaxAddress(address newTaxAddress) public onlyOwner {
        s_taxAddress = newTaxAddress;
    }

    /** Special Functions */

    fallback() external payable {
        mint();
    }

    receive() external payable {}

    /** Getter Functions */

    function getValueInEth() public view returns (uint256) {
        return i_valueInEth;
    }

    function getIcoStartBlock() public view returns (uint256) {
        return i_icoStartBlock;
    }

    function getIcoDurationBlocks() public view returns (uint256) {
        return i_icoDurationBlocks;
    }

    function getTaxBasisPoints() public view returns (uint16) {
        return i_taxBasisPoints;
    }

    function getTaxAddress() public view returns (address) {
        return s_taxAddress;
    }
}
