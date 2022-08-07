import hre, { ethers } from "hardhat";

async function main() {

  const WAITING_UNTIL_DEPLOYMENT = 70000;    // in miliseconds
  const ClubFactory = await ethers.getContractFactory("ClubFactory");
  const factory = await ClubFactory.deploy();
  await factory.deployed();

  console.log("ClubFactory contract deployed to:", factory.address);

  // Verify the contract
  const waitFor = (delay: number) =>
    new Promise((resolve) =>
      setTimeout(() => {
        hre.run("verify:verify", {
          address: factory.address,
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
