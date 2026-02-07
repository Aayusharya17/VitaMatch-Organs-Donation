const mongoose =require("mongoose");

function dbConnect(){
    try{
    mongoose.connect('mongodb://127.0.0.1:27017/VitaMatch');
    }
    catch(e){
        console.log("Error Connecting Database");
    }
}

module.exports = dbConnect;