class MatchScoreService {

  calculateScore({
    organName,
    urgencyScore,
    distanceKm
  }) {

    // ---- Normalize inputs ----
    urgencyScore = Number(urgencyScore ?? 5);

    // distance can be 0, so check null/undefined only
    if (distanceKm === null || distanceKm === undefined) {
      distanceKm = 2000;
    }

    // ---- Organ specific safe transport distance ----
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

    // ---- Distance impact ----
    const distanceFactor =
      Math.exp(-distanceKm / safeDistance);

    // ---- Weighted scoring ----
    const urgencyComponent =
      (urgencyScore / 10) * 70;

    const distanceComponent =
      distanceFactor * 30;

    const matchScore =
      urgencyComponent + distanceComponent;

    // ---- Risk calculation ----
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
