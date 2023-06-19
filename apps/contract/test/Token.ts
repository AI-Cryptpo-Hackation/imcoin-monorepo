import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Token", function () {
  async function deployOneYearLockFixture() {
    const [owner, liver, otherAccount] = await ethers.getSigners();

    const IMCToken = await ethers.getContractFactory("IMCToken");
    const imctoken = await IMCToken.deploy(liver.address);

    return { imctoken, owner, liver, otherAccount };
  }

  describe("Deployment", function () {
    //Write test cases here
    it("Should set the right owner", async function () {
      const { imctoken, owner } = await loadFixture(deployOneYearLockFixture);
      const ownerRole = await imctoken.DEFAULT_ADMIN_ROLE();
      expect(await imctoken.hasRole(ownerRole, owner.address)).to.equal(true);
    });

    it("Should set the right liver", async function () {
      const { imctoken, liver } = await loadFixture(deployOneYearLockFixture);
      const liverRole = await imctoken.LIVER_ROLE();
      expect(await imctoken.hasRole(liverRole, liver.address)).to.equal(true);
    });

    it("Should set the right balance for liver", async function () {
      const { imctoken, liver } = await loadFixture(deployOneYearLockFixture);
      const liverBalance = ethers.utils.parseUnits("1000000", 18);
      expect(await imctoken.balanceOf(liver.address)).to.equal(liverBalance);
    });
  });

  describe("Events", function () {});

  describe("Transfers", function () {});
});
