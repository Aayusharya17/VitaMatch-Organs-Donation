const axios = require("axios");

class GeocodingService {

  async getCoordinates(city) {

    if (!city) {
      throw new Error("City is required for geocoding");
    }

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
      throw new Error("Location not found");
    }

    const geometry = response.data.results[0].geometry;

    return {
      lat: geometry.lat,
      lng: geometry.lng
    };
  }
}

module.exports = GeocodingService;
