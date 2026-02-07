const mongoose = require('mongoose');

const requestedOrganSchema = new mongoose.Schema({
    organName: {
        type: String,
        enum: ["Heart", "Liver", "Lungs", "Kidney", "Eye"]
    },
    bloodGroup: {
        type: String,
        enum: ["A_POS", "A_NEG", "B_POS", "B_NEG", "AB_POS", "AB_NEG", "O_POS", "O_NEG"]
    },
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital"
    },
    doctorId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    },
    doctorName: {
        type : String
    },
    address : {
        type : String
    },
    phoneNumber : {
        type : String
    },
    urgencyScore: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },
    waitingSince: {
        type: Date,
        default: Date.now
    },
    location: {
        lat: Number,
        lng: Number
    },
    allocationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Allocation"
    },
    status: {
        type: String,
        enum: ["WAITING", "MATCHED", "PENDING_CONFIRMATION","TRANSPLANTED", "CANCELLED"],
        default: "WAITING"
    }
}, { timestamps: true });

module.exports = mongoose.model('RequestedOrgan', requestedOrganSchema);
