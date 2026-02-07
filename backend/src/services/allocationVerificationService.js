const crypto = require("crypto");
const Allocation = require("../models/Allocation");

class AllocationVerificationService {

  generateHash(data) {
    return crypto
      .createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");
  }

  async verifyAllocation(allocationId) {

    const allocation =
      await Allocation.findById(allocationId);

    if (!allocation)
      throw new Error("Allocation not found");

    const history = allocation.blockchainHistory;

    if (!history || history.length === 0) {
      return {
        status: "NO_BLOCKCHAIN_DATA"
      };
    }

    let previousHash = null;

    for (let entry of history) {

        const recalculatedHash = this.generateHash({
        allocationId: allocation._id.toString(),
        status: entry.status,
        previousHash,
        timestamp: entry.timestamp
        });

      if (recalculatedHash !== entry.hash) {
        console.log("EXPECTED HASH:", entry.hash);
        console.log("RECALCULATED:", recalculatedHash);
        console.log("DATA USED:", {
        allocationId: allocation._id,
        status: entry.status,
        previousHash,
        timestamp: entry.timestamp
        });

        return {
          status: "TAMPERED",
          failedAt: entry.status
        };
      }

      previousHash = entry.hash;
    }

    return {
      status: "VERIFIED"
    };
  }
}

module.exports = AllocationVerificationService;
