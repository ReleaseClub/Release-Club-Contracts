import hre, { ethers } from "hardhat";

async function main() {

  let clubContractAddress = "0xFb53Ef478Afd65cBCDeF4f82ee85a285bF796B0f";
  const WAITING_UNTIL_DEPLOYMENT = 70000;    // in miliseconds
  const ClubFactory = await ethers.getContractFactory("ClubFactory");
  const factory = await ClubFactory.deploy(clubContractAddress);
  await factory.deployed();

  console.log("ClubFactory or proxy contract deployed to:", factory.address);
  // ClubFactory or proxy contract deployed to: 0x7EbF7C10dBF69CC1d82ed0EA0B499456f2746C73
  // Verify the contract
  const waitFor = (delay: number) =>
    new Promise((resolve) =>
      setTimeout(() => {
        hre.run("verify:verify", {
          address: clubContractAddress,
        });
      }, delay)
    );
  await waitFor(WAITING_UNTIL_DEPLOYMENT);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
