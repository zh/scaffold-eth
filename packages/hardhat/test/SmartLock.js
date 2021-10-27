const { expect } = require("chai");

const timeForward = async (hours) => {
  await ethers.provider.send("evm_increaseTime", [3600 * hours]);
  await ethers.provider.send("evm_mine");
};

describe("SmartLock contract", function () {
  let SmartLock;
  let hardhatSmartLock;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    SmartLock = await ethers.getContractFactory("SmartLock");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    hardhatSmartLock = await SmartLock.deploy();
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    it("Should set the right initial values", async function () {
      expect(await hardhatSmartLock.owner()).to.equal(owner.address);
      expect(await hardhatSmartLock.forRent()).to.equal(true);
      expect(await hardhatSmartLock.rentBy()).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
      expect(await hardhatSmartLock.locked()).to.equal(false);
    });
  });

  describe("Ownable", function () {
    it("Should transfer ownership", async function () {
      const initialOwner = await hardhatSmartLock.owner();
      expect(initialOwner).to.equal(owner.address);

      await hardhatSmartLock.transferOwnership(addr1.address);
      expect(await hardhatSmartLock.owner()).to.equal(addr1.address);
    });
    it("Should renounce ownership", async function () {
      await hardhatSmartLock.renounceOwnership();
      expect(await hardhatSmartLock.owner()).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
    });
    it("Should allow onlyOwner", async function () {
      await expect(
        hardhatSmartLock.connect(addr1).transferOwnership(addr2.address)
      ).to.revertedWith("Ownable: caller is not the owner");
      await expect(
        hardhatSmartLock.connect(addr1).setRenter(addr2.address, 3600)
      ).to.revertedWith("Ownable: caller is not the owner");
      await expect(
        hardhatSmartLock.connect(addr1).setPrice(100)
      ).to.revertedWith("Ownable: caller is not the owner");
    });
    it("Should not change renter if not for rent", async function () {
      await hardhatSmartLock.setPrice(100);
      await hardhatSmartLock.setRenter(addr1.address, 3600);
      expect(await hardhatSmartLock.rentBy()).to.equal(addr1.address);
      await expect(
        hardhatSmartLock.setRenter(addr2.address, 3600)
      ).to.revertedWith("Smart Lock: already rent");
    });
    it("Should not change price if not for rent", async function () {
      await hardhatSmartLock.setPrice(100);
      await hardhatSmartLock.setRenter(addr1.address, 3600);
      await expect(hardhatSmartLock.setPrice(200)).to.revertedWith(
        "Smart Lock: no price changes when rent"
      );
    });
  });

  describe("State changes", function () {
    beforeEach(async function () {
      await hardhatSmartLock.setPrice(100);
      await hardhatSmartLock.setRenter(addr1.address, 3600);
    });
    it("Should allow some actions only to renter", async function () {
      await expect(hardhatSmartLock.open()).to.revertedWith(
        "SmartLock: only renter can call this function"
      );
      await expect(hardhatSmartLock.close()).to.revertedWith(
        "SmartLock: only renter can call this function"
      );
    });
    it("Should change lock state", async function () {
      await expect(hardhatSmartLock.connect(addr1).close())
        .to.emit(hardhatSmartLock, "State")
        .withArgs(addr1.address, "close");
      expect(await hardhatSmartLock.locked()).to.equal(true);
      await expect(hardhatSmartLock.connect(addr1).open())
        .to.emit(hardhatSmartLock, "State")
        .withArgs(addr1.address, "open");
      expect(await hardhatSmartLock.locked()).to.equal(false);
    });
  });

  describe("Rent", function () {
    beforeEach(async function () {
      await hardhatSmartLock.setPrice(100);
      await hardhatSmartLock.connect(addr1).rent(3600, { value: 100 * 3600 });
    });
    it("Should allow rent for price", async function () {
      expect(await hardhatSmartLock.forRent()).to.equal(false);
      expect(await hardhatSmartLock.rentBy()).to.equal(addr1.address);
      expect(await hardhatSmartLock.locked()).to.equal(false);
      expect(await hardhatSmartLock.timeLeft()).to.equal(3600);
    });
    it("Should allow to cancel rent", async function () {
      await hardhatSmartLock.connect(addr1).cancel();
      expect(await hardhatSmartLock.forRent()).to.equal(true);
      expect(await hardhatSmartLock.rentBy()).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
      expect(await hardhatSmartLock.locked()).to.equal(false);
    });
    it("Should not allow rent if not enough funds", async function () {
      await hardhatSmartLock.connect(addr1).cancel();
      await expect(
        hardhatSmartLock.connect(addr1).rent(3600, { value: 50 })
      ).to.revertedWith("Smart Lock: not enough for rent");
    });
    it("Should allow only rent between 5 minutes and 24 hours", async function () {
      await hardhatSmartLock.connect(addr1).cancel();
      await expect(
        hardhatSmartLock.connect(addr1).rent(3600 * 25, { value: 100 * 25 })
      ).to.revertedWith("Smart Lock: rent between 5 minutes and 24 hours");
      await expect(
        hardhatSmartLock.connect(addr1).rent(200, { value: 6 })
      ).to.revertedWith("Smart Lock: rent between 5 minutes and 24 hours");
    });
    it("Should not operate after deadline", async function () {
      await timeForward(3);
      expect(await hardhatSmartLock.timeLeft()).to.equal(0);
      await expect(hardhatSmartLock.open()).to.revertedWith(
        "SmartLock: only renter can call this function"
      );
      await expect(hardhatSmartLock.close()).to.revertedWith(
        "SmartLock: only renter can call this function"
      );
    });
    it("Should cancel rent after deadline", async function () {
      await timeForward(3);
      expect(await hardhatSmartLock.timeLeft()).to.equal(0);
      await hardhatSmartLock.connect(addr2).rent(3600, { value: 100 * 3600 });
      expect(await hardhatSmartLock.forRent()).to.equal(false);
      expect(await hardhatSmartLock.rentBy()).to.equal(addr2.address);
    });
    it("Should allow setting new renter after deadline", async function () {
      await timeForward(3);
      expect(await hardhatSmartLock.timeLeft()).to.equal(0);
      await hardhatSmartLock.setRenter(addr2.address, 3600);
      expect(await hardhatSmartLock.forRent()).to.equal(false);
      expect(await hardhatSmartLock.rentBy()).to.equal(addr2.address);
    });
    it("Should allow owner to set for rent", async function () {
      await expect(
        hardhatSmartLock.connect(addr1).setForRent()
      ).to.revertedWith("Ownable: caller is not the owner");
      await expect(
        hardhatSmartLock.connect(addr2).setForRent()
      ).to.revertedWith("Ownable: caller is not the owner");
      // cannot set before deadline
      await hardhatSmartLock.setForRent();
      expect(await hardhatSmartLock.forRent()).to.equal(false);
      await timeForward(3);
      await hardhatSmartLock.setForRent();
      expect(await hardhatSmartLock.forRent()).to.equal(true);
      expect(await hardhatSmartLock.rentBy()).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
      expect(await hardhatSmartLock.locked()).to.equal(false);
    });
  });
});
