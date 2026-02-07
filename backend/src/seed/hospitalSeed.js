const mongoose= require('mongoose');
const dbConnect =require('../config/db');
const Hospital =require("../models/Hospital")

const seedHospitals = async () => {
  try {
    await Hospital.deleteMany();

    const hospitals = [
      { name: "AIIMS Delhi", city: "New Delhi", doctor: [], request: [], donate: [] },
      { name: "Apollo Hospitals", city: "Chennai", doctor: [], request: [], donate: [] },
      { name: "Fortis Memorial", city: "Gurgaon", doctor: [], request: [], donate: [] },
      { name: "Manipal Hospitals", city: "Bangalore", doctor: [], request: [], donate: [] },
      { name: "Tata Memorial Hospital", city: "Mumbai", doctor: [], request: [], donate: [] },
      { name: "Medanta The Medicity", city: "Gurgaon", doctor: [], request: [], donate: [] },
      { name: "PGIMER", city: "Chandigarh", doctor: [], request: [], donate: [] },
      { name: "Narayana Health", city: "Bangalore", doctor: [], request: [], donate: [] },
      { name: "KIMS Hospitals", city: "Hyderabad", doctor: [], request: [], donate: [] },
      { name: "Ruby Hall Clinic", city: "Pune", doctor: [], request: [], donate: [] },
      { name: "Christian Medical College", city: "Vellore", doctor: [], request: [], donate: [] },
      { name: "Lilavati Hospital", city: "Mumbai", doctor: [], request: [], donate: [] }
    ];

    await Hospital.insertMany(hospitals);

    console.log("12 Hospitals seeded successfully");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

dbConnect()
seedHospitals();