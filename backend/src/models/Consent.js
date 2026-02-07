const mongoose = require("mongoose");

const consentSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    consentType: {
        type: String,
        enum: ["LIVING", "POST_DEATH"],
        required: true
    },
    status: {
        type: String,
        enum: ["PENDING", "VERIFIED", "REVOKED"],
        default: "PENDING"
    },
    signedAt: {
        type: Date,
        default: Date.now
    }

}, { timestamps: true });

module.exports = mongoose.model("Consent", consentSchema);
