import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ContractReceipt } from "ethers";
import { ethers, upgrades } from "hardhat";
import { ClubFactory__factory } from "../typechain-types";

const CLUB_NAME = "my club";

describe("ClubFactory", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployClubFactoryFixture() {
    const CLUB_NAME = "my club";
    // Contracts are deployed using the first signer/account by default
    const [admin, otherAccount] = await ethers.getSigners();
    const ClubFactory = await ethers.getContractFactory("ClubFactory");
    const clubFactory = await ClubFactory.deploy();
    return { clubFactory, admin, otherAccount };
  }

  async function deployClubFixture() {
    const [admin, otherAccount] = await ethers.getSigners();
    const Club = await ethers.getContractFactory("ReleaseClub");
    const club = await Club.deploy();
    return { club, admin, otherAccount };
  }

  it("addClub should create a new club", async function () {
    const { clubFactory, admin, otherAccount } = await loadFixture(deployClubFactoryFixture);

    // let numOfClubOwners = await clubFactory.clubOwners.length;  // will always be 0
    await expect(clubFactory.connect(otherAccount).addClub(CLUB_NAME))
      .to.emit(clubFactory, "ClubCreated");
    // .withArgs(CLUB_NAME);
  });

  it("addClub should create a proxy contract", async function () {
    const { clubFactory, admin, otherAccount } = await loadFixture(deployClubFactoryFixture);
    const ReleaseClub = await ethers.getContractFactory("ReleaseClubUpgradeable");
    await clubFactory.connect(admin).addClub(CLUB_NAME);
    const proxy = await upgrades.deployProxy(ReleaseClub, [CLUB_NAME, admin.address]);
    expect(await proxy.connect(admin).viewName()).to.equal(CLUB_NAME);
    expect(await proxy.connect(otherAccount).viewName()).to.equal(CLUB_NAME);
  });

  it("n calls to addClub should create n clubs", async function () {
    const { clubFactory, admin, otherAccount } = await loadFixture(deployClubFactoryFixture);
    const NUM_OF_CLUBS = 5;
    for (let i = 1; i <= NUM_OF_CLUBS; i++) {
      let tx = await clubFactory.connect(admin).addClub(CLUB_NAME + i);
      let cReceipt: ContractReceipt = await tx.wait();
      console.log(i, " - clone address: ",
        cReceipt.events !== undefined ? cReceipt.events[0].address : undefined);
    }
    let clubsArray = await clubFactory.connect(admin).viewClubs();
    console.log("Array: ", clubsArray);
    expect(clubsArray.length).to.be.equal(NUM_OF_CLUBS);
    let clubsOwnedByAdmin = await clubFactory.connect(admin).getClubs(admin.address);
    console.log("clubsOwnedByAdmin: ", clubsOwnedByAdmin);
    expect(clubsOwnedByAdmin.length).to.be.equal(NUM_OF_CLUBS);
  });

  // TODO let other signer create clubs, not only admin.

  /***************************** Pausable feature *********************************/
  it("addClub should be disabled when the contract is paused", async function () {
    const { clubFactory, admin } = await loadFixture(deployClubFactoryFixture);

    await clubFactory.connect(admin).pauseTheFactory();
    await expect(clubFactory.addClub(CLUB_NAME))
      .to.be.reverted;
  });

  it("addClub should be enabled when the contract is unpaused", async function () {
    const { clubFactory, admin } = await loadFixture(deployClubFactoryFixture);

    await clubFactory.connect(admin).pauseTheFactory();
    await clubFactory.connect(admin).unpauseTheFactory();
    await expect(clubFactory.connect(admin).addClub(CLUB_NAME))
      .to.emit(clubFactory, "ClubCreated");
  });

  it("The contract cannot be unpaused unless it is been paused before", async function () {
    const { clubFactory, admin } = await loadFixture(deployClubFactoryFixture);

    await expect(clubFactory.connect(admin).unpauseTheFactory())
      .to.be.revertedWith('Pausable: not paused');
  });

  it("The contract cannot be paused more than once in a row", async function () {
    const { clubFactory, admin } = await loadFixture(deployClubFactoryFixture);

    await clubFactory.connect(admin).pauseTheFactory();
    await expect(clubFactory.connect(admin).pauseTheFactory())
      .to.be.revertedWith('Pausable: paused');
  });

  it("Only the admin should be allowed to pause the contract", async function () {
    const { clubFactory, admin, otherAccount } = await loadFixture(deployClubFactoryFixture);

    await expect(clubFactory.connect(otherAccount).pauseTheFactory())
      .to.be.revertedWith('Ownable: caller is not the owner');
  });

  it("Only the admin should be allowed to unpause the contract", async function () {
    const { clubFactory, admin, otherAccount } = await loadFixture(deployClubFactoryFixture);

    await expect(clubFactory.connect(otherAccount).unpauseTheFactory())
      .to.be.revertedWith('Ownable: caller is not the owner');
  });

});

