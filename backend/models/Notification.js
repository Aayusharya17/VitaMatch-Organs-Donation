const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  allocationId: { type: mongoose.Schema.Types.ObjectId, ref: "Allocation" },
  read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
