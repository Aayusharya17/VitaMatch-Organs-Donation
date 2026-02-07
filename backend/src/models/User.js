const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ["DONOR", "DOCTOR", "ADMIN"]
    },

    hospitalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hospital"
    },

    phoneNumber: {
        type: String
    },

    address: {   // city name
        type: String
    },

    location: {
        lat: Number,
        lng: Number
    }

}, { timestamps: true });

userSchema.pre('save', async function () {
    this.password = await bcrypt.hash(this.password, saltRounds);
});

module.exports = mongoose.model("User", userSchema);
