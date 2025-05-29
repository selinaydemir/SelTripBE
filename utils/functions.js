const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;

  const R = 6371e3;
  const φ1 = toRad(coords1.lat);
  const φ2 = toRad(coords2.lat);
  const Δφ = toRad(coords2.lat - coords1.lat);
  const Δλ = toRad(coords2.lng - coords1.lng);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c;
  return d;
};

module.exports = {
    haversineDistance
}

