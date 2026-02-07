const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    hospitalId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Hospital" 
    },
    name : {
        type : mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }
})

const Doctor = mongoose.model('Doctor' , doctorSchema);
module.exports = Doctor;
