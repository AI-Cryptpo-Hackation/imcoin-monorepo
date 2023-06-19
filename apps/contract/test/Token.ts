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
  describe("Token functions", function () {
    it("Should change power correctly", async function () {
      const { imctoken, liver, otherAccount } = await loadFixture(
        deployOneYearLockFixture
      );
      const newPower = 10 ** 7; // new power value
      await imctoken.connect(liver).setPower(newPower);
      expect(await imctoken.power()).to.equal(newPower);
      expect(await imctoken.balanceOf(liver.address)).to.equal(
        ethers.utils.parseUnits("10000000", 18)
      );

      await imctoken
        .connect(liver)
        .mint(otherAccount.address, ethers.utils.parseUnits("1000", 18));
      expect(await imctoken.balanceOf(otherAccount.address)).to.equal(
        ethers.utils.parseUnits("1000", 18)
      );

      const newPower2 = 10 ** 8; // new power value
      await imctoken.connect(liver).setPower(newPower2);
      expect(await imctoken.power()).to.equal(newPower2);
      expect(await imctoken.balanceOf(liver.address)).to.equal(
        ethers.utils.parseUnits("1000000", 18)
      );
      expect(await imctoken.balanceOf(otherAccount.address)).to.equal(
        ethers.utils.parseUnits("100", 18)
      );
    });

    it("Should mint new tokens correctly", async function () {
      const { imctoken, liver, otherAccount } = await loadFixture(
        deployOneYearLockFixture
      );
      const mintAmount = ethers.utils.parseUnits("500", 18);
      await imctoken.connect(liver).mint(otherAccount.address, mintAmount);
      expect(await imctoken.balanceOf(otherAccount.address)).to.equal(
        mintAmount
      );
    });

    it("Should burn tokens correctly", async function () {
      const { imctoken, liver } = await loadFixture(deployOneYearLockFixture);
      const burnAmount = ethers.utils.parseUnits("500", 18);
      await imctoken
        .connect(liver)
        ["burn(address,uint256)"](liver.address, burnAmount);
      expect(await imctoken.balanceOf(liver.address)).to.equal(
        ethers.utils.parseUnits("1000000", 18).sub(burnAmount)
      );
    });

    it("Should transfer tokens correctly", async function () {
      const { imctoken, liver, otherAccount } = await loadFixture(
        deployOneYearLockFixture
      );
      const transferAmount = ethers.utils.parseUnits("500", 18);
      await imctoken
        .connect(liver)
        .transfer(otherAccount.address, transferAmount);
      expect(await imctoken.balanceOf(otherAccount.address)).to.equal(
        transferAmount
      );
    });
  });
});
