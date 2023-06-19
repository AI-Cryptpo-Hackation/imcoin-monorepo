import { ethers } from "hardhat";

async function main() {
  const IMCToken = await ethers.getContractFactory("IMCToken");
  const imctoken = await IMCToken.deploy(
    "0x1810406E4A76Ba98AaFa399CF860B1FAA8FF0A21"
  );

  await imctoken.deployed();

  console.log("IMCToken deployed to:", imctoken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
