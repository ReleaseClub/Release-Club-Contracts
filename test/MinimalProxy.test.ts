import web3 from "web3";
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

const CLUB_NAME = "my club";
const DEFAULT_ADMIN_ROLE = '0x'.concat('0'.repeat(64));  // It's a bytes32 type
const MOD_ROLE = web3.utils.soliditySha3('MOD_ROLE');
const MEMBER_ROLE = web3.utils.soliditySha3('MEMBER_ROLE');

describe("Minimal Proxy | EIP-1167", function () {

    it("The proxy should forward all the calls to the ReleaseClub contract", async function () {
        const [admin, otherAccount] = await ethers.getSigners();
        const ReleaseClub = await ethers.getContractFactory("ReleaseClub");
        let otherAccountAddress = otherAccount.address.toLowerCase();
        // const releaseClub = await ReleaseClub.deploy();
        const proxy = await upgrades.deployProxy(ReleaseClub, [CLUB_NAME, admin.address]);
        await proxy.deployed();
        expect(await proxy.connect(admin).viewName()).to.equal(CLUB_NAME);
        expect(await proxy.connect(otherAccount).viewName()).to.equal(CLUB_NAME);
        await expect(proxy.connect(admin).addModerator(otherAccount.address))
            .to.not.be.reverted;
        await expect(proxy.connect(otherAccount).addModerator(otherAccount.address))
            .to.be.revertedWith(`AccessControl: account ${otherAccountAddress} is missing role ${DEFAULT_ADMIN_ROLE}`);

        console.log("Proxy deployed to: ", proxy.address);
    });
});
