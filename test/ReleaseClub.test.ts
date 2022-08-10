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

});
