require("dotenv").config();

const dbConnect = require('../config/db');
const axios = require("axios");

const Hospital = require("../models/Hospital");
const User = require("../models/User");

const firstNames = ["Arjun", "Meera", "Rohan", "Ananya", "Vikram", "Priya", "Kabir", "Isha"];
const lastNames = ["Sharma", "Verma", "Reddy", "Patel", "Nair", "Gupta", "Kapoor", "Menon"];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const hospitalsData = [
  { name: "AIIMS Delhi", address: "New Delhi" },
  { name: "Apollo Hospitals", address: "Chennai" },
  { name: "Fortis Memorial", address: "Gurgaon" },
  { name: "Manipal Hospitals", address: "Bangalore" },
  { name: "Tata Memorial Hospital", address: "Mumbai" }
];


// ✅ OpenCage geocoding helper
async function getCoordinates(city) {
  try {
    const response = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          q: city,
          key: process.env.OPENCAGE_API_KEY,
          limit: 1
        }
      }
    );

    if (!response.data.results.length) {
      throw new Error(`Coordinates not found for ${city}`);
    }

    const geometry = response.data.results[0].geometry;

    return {
      lat: geometry.lat,
      lng: geometry.lng
    };

  } catch (err) {
    console.log("Geocoding error:", err.message);
    return null;
  }
}

const seed = async () => {
  try {

    await dbConnect();

    console.log("🧹 Clearing old data...");

    await Hospital.deleteMany();
    await User.deleteMany({ role: "DOCTOR" });

    for (const hosp of hospitalsData) {

      // ✅ Get coordinates once per hospital
      const coordinates = await getCoordinates(hosp.address);

      const hospital = await Hospital.create({
        ...hosp,
        doctor: [],
        request: [],
        donate: []
      });

      const numDoctors = Math.floor(Math.random() * 2) + 2;

      for (let i = 0; i < numDoctors; i++) {

        const first = getRandom(firstNames);
        const last = getRandom(lastNames);

        const doctor = await User.create({
          name: `Dr. ${first} ${last}`,
          email: `${first.toLowerCase()}${last.toLowerCase()}@vitamatch.com`,
          password: "doctor123",
          role: "DOCTOR",
          hospitalId: hospital._id,
          phoneNumber: 9000000000 + Math.floor(Math.random() * 1000),
          address: hosp.address,
          location: coordinates   // ✅ IMPORTANT
        });

        hospital.doctor.push(doctor._id);
      }

      await hospital.save();
    }

    console.log("🏥 Hospitals & Doctors seeded successfully");
    process.exit();

  } catch (error) {
    console.error("ERROR:", error.message);
    process.exit(1);
  }
};

seed();
