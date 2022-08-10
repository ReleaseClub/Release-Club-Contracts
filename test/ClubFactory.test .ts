import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import web3 from "web3";
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

  it("addClub should create a new club", async function () {
    const { clubFactory, admin, otherAccount } = await loadFixture(deployClubFactoryFixture);

    // let numOfClubOwners = await clubFactory.clubOwners.length;  // will always be 0
    await expect(clubFactory.connect(otherAccount).addClub(CLUB_NAME))
      .to.emit(clubFactory, "ClubCreated");
    // .withArgs(CLUB_NAME);
  });

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

