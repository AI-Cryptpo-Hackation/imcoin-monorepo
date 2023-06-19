// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract IMCToken is ERC20, ERC20Burnable, Pausable, Ownable, ERC20Permit {
    uint256 public scalar = 10 ** 8; // 1 IMC = 10 ** decimal / scalar

    constructor() ERC20("I'm Coin.", "IMC") ERC20Permit("I'm Coin.") {}

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function mint(address to, uint256 amount) public onlyOwner {
        uint amount_ = amount * scalar;
        _mint(to, amount_);
    }

    function burn(address from, uint256 amount) public onlyOwner {
        uint amount_ = amount * scalar;
        _burn(from, amount_);
    }

    function balanceOf(address account) public view override returns (uint256) {
        uint256 amount = super.balanceOf(account);
        return amount / scalar;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        uint amount_ = amount * scalar;
        super._beforeTokenTransfer(from, to, amount_);
    }
}