require("dotenv").config();

const dbConnect = require('../config/db');
const axios = require("axios");
const User = require('../models/User');

const firstNames = ["Aarav", "Diya", "Vivaan", "Ira", "Reyansh", "Anika", "Advik", "Myra", "Krish", "Sara"];
const lastNames = ["Sharma", "Patel", "Rao", "Singh", "Khan", "Nair", "Joshi", "Kapoor", "Mehta", "Verma"];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ✅ Cities instead of fake addresses (important for geocoding)
const cities = [
  "Delhi",
  "Mumbai",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Jaipur",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Lucknow"
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

const seedUsers = async () => {
  try {
    await dbConnect();

    console.log("🧹 Removing old demo donors...");

    await User.deleteMany({ role: "DONOR", email: /user/ });

    for (let i = 1; i <= 20; i++) {

      const first = getRandom(firstNames);
      const last = getRandom(lastNames);
      const city = getRandom(cities);

      // ✅ Convert city → coordinates
      const coordinates = await getCoordinates(city);

      await User.create({
        name: `${first} ${last}`,
        email: `user${i}@vitamatch.com`,
        password: "user123",
        role: "DONOR",
        phoneNumber: 8700000000 + i,
        address: city,
        location: coordinates
      });

      console.log(`Created user${i} (${city})`);
    }

    console.log("👤 Donors seeded successfully");
    process.exit();

  } catch (error) {
    console.error("ERROR:", error.message);
    process.exit(1);
  }
};

seedUsers();
