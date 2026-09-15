export function normalizeSeaRoutesRoute(data, context = {}) {
  const feature = Array.isArray(data?.features)
    ? data.features[0]
    : data?.geometry
    ? data
    : null;

  const properties = feature?.properties || data?.properties || {};
  const geometry = feature?.geometry || data?.geometry || null;
  const coordinates =
    geometry?.coordinates ||
    (Array.isArray(data?.coordinates) ? data.coordinates : []);

  // Distance conversion (SeaRoutes reports distance in meters)
  const distanceMeters = properties.distance ?? data?.distance ?? null;
  let distance_km = null;
  let distance_nm = null;

  if (typeof distanceMeters === "number") {
    distance_km = Math.round((distanceMeters / 1000) * 100) / 100;
    distance_nm = Math.round((distance_km / 1.852) * 100) / 100;
  }

  // Duration conversion (SeaRoutes reports duration in milliseconds)
  const durationMilliseconds = properties.duration ?? data?.duration ?? null;
  let duration_hours = null;

  if (typeof durationMilliseconds === "number") {
    duration_hours = Math.round((durationMilliseconds / 3600000) * 100) / 100;
  }

  // Coordinate resolution
  const firstCoord = Array.isArray(coordinates) && coordinates.length > 0 ? coordinates[0] : null;
  const lastCoord = Array.isArray(coordinates) && coordinates.length > 0 ? coordinates[coordinates.length - 1] : null;

  const originLat =
    context.origin?.latitude ??
    properties.origin?.latitude ??
    (firstCoord ? firstCoord[1] : null);
  const originLon =
    context.origin?.longitude ??
    properties.origin?.longitude ??
    (firstCoord ? firstCoord[0] : null);

  const destLat =
    context.destination?.latitude ??
    properties.destination?.latitude ??
    (lastCoord ? lastCoord[1] : null);
  const destLon =
    context.destination?.longitude ??
    properties.destination?.longitude ??
    (lastCoord ? lastCoord[0] : null);

  const origin =
    originLat != null || originLon != null
      ? { latitude: originLat, longitude: originLon }
      : null;

  const destination =
    destLat != null || destLon != null
      ? { latitude: destLat, longitude: destLon }
      : null;

  const avoidedAreas = Array.isArray(properties.avoided_areas)
    ? properties.avoided_areas
    : Array.isArray(properties.avoidedAreas)
    ? properties.avoidedAreas
    : Array.isArray(properties.areas)
    ? properties.areas
    : [];

  return {
    origin,
    destination,

    distance_km,
    distance_nm,

    duration_hours,

    route_geometry: geometry,
    route_coordinates: Array.isArray(coordinates) ? coordinates : [],

    vessel_constraints: properties.vessel_constraints ?? properties.vessel ?? null,

    avoided_areas: avoidedAreas,

    provider: "searoutes",

    fetched_at: new Date().toISOString()
  };
}
