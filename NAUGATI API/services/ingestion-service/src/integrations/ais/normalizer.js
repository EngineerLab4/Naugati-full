function parseNullableNumber(val) {
  if (val === null || val === undefined || val === "") return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
}

export function normalizeVesselFinderAIS(data) {
  if (!data) return null;

  // VesselFinder can return an array of vessels or a single vessel object
  const vessel = Array.isArray(data) ? data[0] : data;
  if (!vessel) return null;

  // The vessel data typically nests AIS attributes under an 'AIS' property
  const ais = vessel.AIS || vessel;

  // Latitude and Longitude handling
  const rawLat = ais.LATITUDE ?? ais.latitude ?? vessel.LATITUDE ?? null;
  const rawLon = ais.LONGITUDE ?? ais.longitude ?? vessel.LONGITUDE ?? null;

  const lat = parseNullableNumber(rawLat);
  const lon = parseNullableNumber(rawLon);

  const position =
    lat !== null || lon !== null
      ? {
          latitude: lat,
          longitude: lon
        }
      : null;

  // Heading handling: 511 indicates unavailable heading in AIS
  const rawHeading = parseNullableNumber(
    ais.HEADING ?? ais.heading ?? vessel.HEADING
  );
  const heading_deg = rawHeading === 511 ? null : rawHeading;

  // AIS Source handling (TER, SAT, etc.)
  const ais_source =
    ais.SRC ??
    ais.src ??
    vessel.SRC ??
    vessel.src ??
    null;

  return {
    imo: parseNullableNumber(ais.IMO ?? ais.imo ?? vessel.IMO),
    mmsi: parseNullableNumber(ais.MMSI ?? ais.mmsi ?? vessel.MMSI),
    vessel_name: ais.NAME ?? ais.name ?? vessel.NAME ?? null,
    callsign: ais.CALLSIGN ?? ais.callsign ?? vessel.CALLSIGN ?? null,

    position,

    course_deg: parseNullableNumber(ais.COURSE ?? ais.course ?? vessel.COURSE),
    speed_knots: parseNullableNumber(ais.SPEED ?? ais.speed ?? vessel.SPEED),
    heading_deg,

    navigation_status: parseNullableNumber(
      ais.NAVSTAT ?? ais.navstat ?? vessel.NAVSTAT
    ),

    draught_m: parseNullableNumber(
      ais.DRAUGHT ?? ais.draught ?? vessel.DRAUGHT
    ),

    destination:
      ais.DESTINATION ??
      ais.destination ??
      vessel.DESTINATION ??
      ais.DEST ??
      vessel.DEST ??
      null,
    eta:
      ais.ETA ??
      vessel.ETA ??
      ais.ETA_AIS ??
      vessel.ETA_AIS ??
      null,

    vessel_type_code: parseNullableNumber(
      ais.TYPE ?? ais.type ?? vessel.TYPE
    ),

    ais_source,

    position_timestamp:
      ais.TIMESTAMP ?? ais.timestamp ?? vessel.TIMESTAMP ?? null,

    provider: "vesselfinder",

    fetched_at: new Date().toISOString()
  };
}
