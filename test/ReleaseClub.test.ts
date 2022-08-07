import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import web3 from "web3";
import { ReleaseClub__factory } from "../typechain-types";
import { ReleaseStruct } from "../typechain-types/contracts/ReleaseClub";

const CLUB_NAME = "my club";

describe("ReleaseClub", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployClubFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const CLUB_NAME = "my club";
    // Contracts are deployed using the first signer/account by default
    const [admin, otherAccount] = await ethers.getSigners();

    const Club = await ethers.getContractFactory("ReleaseClub");
    const club = await Club.deploy(CLUB_NAME, admin.address);

    return { club, admin, otherAccount };
  }

  describe("Deployment", function () {
    const CLUB_NAME = "my club";
    const DEFAULT_ADMIN_ROLE = '0';
    const MOD_ROLE = web3.utils.soliditySha3('MOD_ROLE');
    const MEMBER_ROLE = web3.utils.soliditySha3('MEMBER_ROLE');

    it("Arg should have the right value", async function () {
      const { club, admin } = await loadFixture(deployClubFixture);

      expect(await club.clubName()).to.equal(CLUB_NAME);
      // expect(await this.accessControl.hasRole(DEFAULT_ADMIN_ROLE, admin)).to.equal(true);
    });
  });

  it("viewName() function should work", async function () {
    const { club, admin } = await loadFixture(deployClubFixture);
    expect(await club.viewName()).to.equal(CLUB_NAME);
  });

  it("addReleases() function should work", async function () {
    const { club, admin, otherAccount } = await loadFixture(deployClubFixture);
    let release1: ReleaseStruct = { tokenContract: admin.address, tokenID: 4 };
    let release2: ReleaseStruct = { tokenContract: otherAccount.address, tokenID: 6 };
    await club.addReleases([release1, release2]);

    expect(await club.releases.length).to.equal(2);
  });

  it("addRelease() function should emit some events", async function () {
    const { club, admin, otherAccount } = await loadFixture(deployClubFixture);
    let release1: ReleaseStruct = { tokenContract: admin.address, tokenID: 4 };
    let release2: ReleaseStruct = { tokenContract: otherAccount.address, tokenID: 6 };
    await expect(club.addReleases([release1, release2]))
      .to.emit(club, "NewRelease")
      .withArgs(release1.tokenContract, release1.tokenID);
    await expect(club.addReleases([release1, release2]))
      .to.emit(club, "NewRelease")
      .withArgs(release2.tokenContract, release2.tokenID);
  });


  //     expect(await ethers.provider.getBalance(lock.address)).to.equal(
  //       lockedAmount
  //     );
  //   });

  //   it("Should fail if the unlockTime is not in the future", async function () {
  //     // We don't use the fixture here because we want a different deployment
  //     const latestTime = await time.latest();
  //     const Lock = await ethers.getContractFactory("Lock");
  //     await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
  //       "Unlock time should be in the future"
  //     );
  //   });
  // });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});
