import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import web3 from "web3";
import { ReleaseClubUpgradeable__factory } from "../typechain-types";
import { ReleaseStruct } from "../typechain-types/contracts/ReleaseClubUpgradeable";

const CLUB_NAME = "my club";
const DEFAULT_ADMIN_ROLE = '0x'.concat('0'.repeat(64));  // It's a bytes32 type
const MOD_ROLE = web3.utils.soliditySha3('MOD_ROLE');
const MEMBER_ROLE = web3.utils.soliditySha3('MEMBER_ROLE');
// let bobAccountAddress = bobAccount.address.toLowerCase();

describe("ReleaseClub", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployClubFixture() {
    // Contracts are deployed using the first signer/account by default
    const [admin, otherAccount, bobAccount, potentialCreator] = await ethers.getSigners();
    const Club = await ethers.getContractFactory("ReleaseClubUpgradeable");
    const club = await Club.deploy();
    return { club, admin, otherAccount, bobAccount, potentialCreator };
  }

  describe("Deployment", function () {

    it("The state variable should have the right value", async function () {
      const { club, admin } = await loadFixture(deployClubFixture);
      await club.connect(admin).initialize(CLUB_NAME, admin.address);

      expect(await club.connect(admin).clubName()).to.equal(CLUB_NAME);
      // expect(await this.accessControl.hasRole(DEFAULT_ADMIN_ROLE, admin)).to.equal(true);
    });
  });

  it("viewName() function should work", async function () {
    const { club, admin, otherAccount } = await loadFixture(deployClubFixture);
    await club.connect(otherAccount).initialize(CLUB_NAME, otherAccount.address);
    expect(await club.viewName()).to.equal(CLUB_NAME);
  });

  it("addRelease() function should emit some events", async function () {
    const { club, admin, otherAccount } = await loadFixture(deployClubFixture);
    await club.connect(otherAccount).initialize(CLUB_NAME, otherAccount.address);
    let release1: ReleaseStruct = { tokenContract: admin.address, tokenID: 4 };
    let release2: ReleaseStruct = { tokenContract: otherAccount.address, tokenID: 6 };
    await expect(club.connect(otherAccount).addRelease([release1, release2]))
      .to.emit(club, "NewRelease")
      .withArgs(release1.tokenContract, release1.tokenID);
    await expect(club.connect(otherAccount).addRelease([release1, release2]))
      .to.emit(club, "NewRelease")
      .withArgs(release2.tokenContract, release2.tokenID);
  });

  it("addRelease() function should revert when called by a signer without the member role", async function () {
    const { club, admin, otherAccount } = await loadFixture(deployClubFixture);
    await club.connect(otherAccount).initialize(CLUB_NAME, otherAccount.address);
    let release1: ReleaseStruct = { tokenContract: admin.address, tokenID: 4 };
    let release2: ReleaseStruct = { tokenContract: otherAccount.address, tokenID: 6 };
    let adminAddress = admin.address.toLowerCase();
    await expect(club.connect(admin).addRelease([release1, release2]))
      .to.be.revertedWith(`AccessControl: account ${adminAddress} is missing role ${MEMBER_ROLE}`);
  });

  it("Only the creator should be able to add a moderator", async function () {
    const { club, admin, otherAccount, potentialCreator } = await loadFixture(deployClubFixture);
    let otherAccountAddress = otherAccount.address.toLowerCase();
    await club.connect(potentialCreator).initialize(CLUB_NAME, potentialCreator.address);
    await expect(club.connect(potentialCreator).addModerator(otherAccount.address))
      .to.not.be.reverted // .to.emit(club, "GRANTED_ROLE")
    await expect(club.connect(otherAccount).addModerator(otherAccount.address))
      .to.be.revertedWith(`AccessControl: account ${otherAccountAddress} is missing role ${DEFAULT_ADMIN_ROLE}`);
  });

  it("Only the creator should be able to remove a moderator", async function () {
    const { club, admin, otherAccount, potentialCreator } = await loadFixture(deployClubFixture);
    let otherAccountAddress = otherAccount.address.toLowerCase();
    await club.connect(potentialCreator).initialize(CLUB_NAME, potentialCreator.address);
    await expect(club.connect(potentialCreator).addModerator(otherAccount.address))
      .to.not.be.reverted
    await expect(club.connect(potentialCreator).RemoveModerator(otherAccount.address))
      .to.not.be.reverted
    await expect(club.connect(potentialCreator).addModerator(otherAccount.address))
      .to.not.be.reverted
    await expect(club.connect(otherAccount).addModerator(otherAccount.address))
      .to.be.revertedWith(`AccessControl: account ${otherAccountAddress} is missing role ${DEFAULT_ADMIN_ROLE}`);
  });

  it("Only a moderator should be able to add a member", async function () {
    const { club, admin, otherAccount, bobAccount, potentialCreator } = await loadFixture(deployClubFixture);
    let bobAccountAddress = bobAccount.address.toLowerCase();
    await club.connect(potentialCreator).initialize(CLUB_NAME, potentialCreator.address);
    await club.connect(potentialCreator).addModerator(otherAccount.address);

    await expect(club.connect(otherAccount).addMember(admin.address))
      .not.to.be.reverted;
    await expect(club.connect(bobAccount).addMember(admin.address))
      .to.be.revertedWith(`AccessControl: account ${bobAccountAddress} is missing role ${MOD_ROLE}`);
  });

  it("Only a moderator should be able to revoke a member", async function () {
    const { club, admin, otherAccount, bobAccount, potentialCreator } = await loadFixture(deployClubFixture);
    let bobAccountAddress = bobAccount.address.toLowerCase();
    await club.connect(potentialCreator).initialize(CLUB_NAME, potentialCreator.address);
    await club.connect(potentialCreator).addModerator(otherAccount.address);

    await club.connect(otherAccount).addMember(admin.address);
    // otherAccount is a moderator
    await expect(club.connect(otherAccount).revokeMember(admin.address))
      .not.to.be.reverted;
    await club.connect(otherAccount).addMember(admin.address);
    // but bobAccount is not
    await expect(club.connect(bobAccount).revokeMember(admin.address))
      .to.be.revertedWith(`AccessControl: account ${bobAccountAddress} is missing role ${MOD_ROLE}`);
  });

  it("There always should be at least one admin", async function () {
    const { club, admin, otherAccount, potentialCreator } = await loadFixture(deployClubFixture);
    let otherAccountAddress = otherAccount.address.toLowerCase();
    await club.connect(potentialCreator).initialize(CLUB_NAME, potentialCreator.address);
    await expect(club.connect(potentialCreator).addModerator(potentialCreator.address))
      .to.not.be.reverted
    await expect(club.connect(potentialCreator).RemoveModerator(potentialCreator.address))
      .to.not.be.reverted
    await expect(club.connect(potentialCreator).addModerator(otherAccount.address))
      .to.not.be.reverted
  });

});
