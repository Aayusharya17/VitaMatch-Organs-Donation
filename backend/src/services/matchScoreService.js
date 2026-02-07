class MatchScoreService {

  calculateScore({
    organName,
    urgencyScore,
    distanceKm
  }) {

    urgencyScore = Number(urgencyScore || 5);

    if (!distanceKm) distanceKm = 2000;

    let safeDistance;

    switch (organName) {
      case "Heart":
        safeDistance = 500;
        break;
      case "Liver":
        safeDistance = 800;
        break;
      case "Kidney":
        safeDistance = 1500;
        break;
      default:
        safeDistance = 1000;
    }

    const distanceFactor =
      Math.exp(-distanceKm / safeDistance);

    const urgencyComponent =
      urgencyScore * 10 * 0.7;

    const distanceComponent =
      distanceFactor * 100 * 0.3;

    const matchScore =
      urgencyComponent + distanceComponent;

    let riskLevel;
    let recommendation;

    if (distanceKm <= safeDistance * 0.5) {
      riskLevel = "LOW";
      recommendation = "RECOMMENDED";
    }
    else if (distanceKm <= safeDistance) {
      riskLevel = "MODERATE";
      recommendation = "ACCEPTABLE";
    }
    else {
      riskLevel = "HIGH";
      recommendation = "RISKY";
    }

    return {
      matchScore: Math.round(matchScore),
      riskLevel,
      recommendation
    };
  }
}

module.exports = MatchScoreService;
