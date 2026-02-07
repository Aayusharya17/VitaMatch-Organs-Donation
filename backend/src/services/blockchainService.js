const crypto = require("crypto");
const { ethers } = require("ethers");

const ABI = [
  "event AllocationRecorded(bytes32 hash,uint256 timestamp)",
  "function recordAllocation(bytes32 _hash) public"
];

class BlockchainService {

  constructor() {

    this.provider = new ethers.JsonRpcProvider(
      process.env.ALCHEMY_RPC_URL
    );

    this.wallet = new ethers.Wallet(
      process.env.PRIVATE_KEY,
      this.provider
    );

    this.contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      ABI,
      this.wallet
    );
  }

  generateHash(data) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
  }

  async storeHash(hash) {

    const tx =
      await this.contract.recordAllocation(
        "0x" + hash
      );

    await tx.wait();

    return tx.hash;
  }
}

module.exports = BlockchainService;
