import hre, { ethers } from "hardhat";
import { MinEthersFactory } from "../typechain-types/common";

async function main() {

  const CLUB_NAME = "My second club";
  const CREATOR = "0x816eDa251829F0219D405E3112b1CCf31279f522";
  const WAITING_UNTIL_DEPLOYMENT = 70000;    // in miliseconds
  const Club = await ethers.getContractFactory("ReleaseClub");
  const club = await Club.deploy(CLUB_NAME, CREATOR);
  await club.deployed();

  console.log("ClubFactory contract deployed to:", club.address);

  // Verify the contract
  const waitFor = (delay: number) =>
    new Promise((resolve) =>
      setTimeout(() => {
        hre.run("verify:verify", {
          address: club.address,
          constructorArguments: [CLUB_NAME, CREATOR],
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
