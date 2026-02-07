const axios = require("axios");
const { ORS_API_KEY } = require("../config/serverConfig");

class DistanceService {

  async getDistance(origin, destination) {

    try {

      const response = await axios.post(
        "https://api.openrouteservice.org/v2/matrix/driving-car",
        {
          locations: [
            [origin.lng, origin.lat],
            [destination.lng, destination.lat]
          ],
          metrics: ["distance", "duration"]
        },
        {
          headers: {
            Authorization: ORS_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      const distanceMeters = response.data.distances[0][1];
      const durationSeconds = response.data.durations[0][1];

      return {
        distance: (distanceMeters / 1000).toFixed(1) + " km",
        duration: Math.round(durationSeconds / 60) + " mins"
      };

    } catch (err) {
      console.log("Distance API error:", err.message);
      return { distance: null, duration: null };
    }
  }
}

module.exports = DistanceService;
