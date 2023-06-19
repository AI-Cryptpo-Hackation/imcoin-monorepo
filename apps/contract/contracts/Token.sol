// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract IMCToken is
    ERC20,
    ERC20Burnable,
    Pausable,
    AccessControl,
    ERC20Permit
{
    event UpdateScalar(uint256 newScalar);

    uint256 public scalar = 10 ** 8; // 1 IMC = 10 ** decimal / scalar
    bytes32 public constant LIVER_ROLE = keccak256("LIVER_ROLE");

    constructor(
        address liver
    ) ERC20("I'm Coin.", "IMC") ERC20Permit("I'm Coin.") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(LIVER_ROLE, liver);
        _mint(liver, 1_000_000 ether); // 1,000,000 IMC for liver
    }

    function pause() public onlyRole(LIVER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(LIVER_ROLE) {
        _unpause();
    }

    function _mint(address to, uint256 amount) internal override {
        uint amount_ = amount * scalar;
        super._mint(to, amount_);
    }

    function mint(address to, uint256 amount) public onlyRole(LIVER_ROLE) {
        _mint(to, amount);
    }

    function _burn(address from, uint256 amount) internal override {
        uint amount_ = amount * scalar;
        super._burn(from, amount_);
    }

    function burn(address from, uint256 amount) public onlyRole(LIVER_ROLE) {
        _burn(from, amount);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        uint amount_ = amount * scalar;
        super._transfer(from, to, amount_);
    }

    function transfer(
        address from,
        address to,
        uint256 amount
    ) public onlyRole(LIVER_ROLE) {
        _transfer(from, to, amount);
    }

    function totalSupply() public view override returns (uint256) {
        uint256 amount = super.totalSupply();
        return amount / scalar;
    }

    function balanceOf(address account) public view override returns (uint256) {
        uint256 amount = super.balanceOf(account);
        return amount / scalar;
    }

    function setScalar(uint256 newScalar) public onlyRole(LIVER_ROLE) {
        require(newScalar > 0, "IMCToken: new scalar is 0");
        scalar = newScalar;
        emit UpdateScalar(newScalar);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
