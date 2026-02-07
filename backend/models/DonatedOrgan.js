const mongoose = require("mongoose");

const donatedOrganSchema = new mongoose.Schema({
    organName: {
        type: String,
        enum: ["Heart", "Liver", "Lungs", "Kidney", "Eye"]
    },
    location: {
        lat: Number,
        lng: Number
    },
    bloodGroup: {
        type: String,
        enum: ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"]
    },
    role: {
        type: String,
        enum: ["DONOR", "DOCTOR"],
        required: true
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "role"
    },
    phoneNumber : {
        type : String
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital",
        default : null
    },
    address :{
        type : String
    },
    consentId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Consent",
        default : null
    },
    status: {
        type: String,
        enum: ["PENDING_CONSENT","AVAILABLE", "RESERVED" , "ALLOCATED", "TRANSPLANTED", "EXPIRED"],
        default: "PENDING_CONSENT"
    },
    allocationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"Allocation",
        default : null
    }
}, { timestamps: true });

module.exports = mongoose.model("DonatedOrgan", donatedOrganSchema);
