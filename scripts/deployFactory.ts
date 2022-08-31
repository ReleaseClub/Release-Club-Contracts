import hre, { ethers, upgrades } from "hardhat";

async function main() {

  let CLUB_CONTRACT_ADDRESS = "0xc103A93b31103C98bd6edA7e9CB177e6093Bf6DE";  // Deployed on Rinkeby on the 31st of August 2022
  // let CLUB_CONTRACT_ADDRESS = "0xFb53Ef478Afd65cBCDeF4f82ee85a285bF796B0f";  // Deployed on Rinkeby on the 30th of August 2022
  const WAITING_UNTIL_DEPLOYMENT = 70000;    // in miliseconds
  const ClubFactory = await ethers.getContractFactory("ClubFactory");
  // const factory = await upgrades.deployProxy(ClubFactory, [clubContractAddress]);
  const factory = await ClubFactory.deploy(CLUB_CONTRACT_ADDRESS);
  await factory.deployed();

  console.log("ClubFactory deployed to:", factory.address);
  // ClubFactory or proxy contract deployed to: 0x7EbF7C10dBF69CC1d82ed0EA0B499456f2746C73
  // Verify the contract
  const waitFor = (delay: number) =>
    new Promise((resolve) =>
      setTimeout(() => {
        hre.run("verify:verify", {
          address: factory.address,
          constructorArguments: [CLUB_CONTRACT_ADDRESS],
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
