const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema({

  organId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DonatedOrgan"
  },

  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "RequestedOrgan"
  },

  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital"
  },

  status: {
    type: String,
    enum: [
      "PENDING_CONFIRMATION",
      "MATCHED",
      "DISPATCHED",
      "COMPLETED",
      "FAILED"
    ],
    default: "PENDING_CONFIRMATION"
  },

  matchScore: Number,

  dispatchTime: Date,
  completionTime: Date,
  failureReason: String,

  dispatchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  lastBlockchainHash: {
    type: String,
    default: null
  },

  blockchainHistory: [
    {
      status: String,
      hash: String,
      txHash: String,
      timestamp: Date
    }
  ],
  
}, { timestamps: true });

module.exports = mongoose.model("Allocation", allocationSchema);
