const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
    name: {
        type: String
    },
    address: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    doctor: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    request: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RequestedOrgan'
        }
    ],
    donate: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'DonatedOrgan'
        }
    ]
}, { timestamps: true });

const Hospital = mongoose.model('Hospital', hospitalSchema);
module.exports = Hospital;