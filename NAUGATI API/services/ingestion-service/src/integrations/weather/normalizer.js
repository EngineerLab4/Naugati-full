export function normalizeOpenMeteoMarine(data) {
  const current = data?.current || {};

  return {
    latitude: data?.latitude ?? null,
    longitude: data?.longitude ?? null,

    wave_height_m: current.wave_height ?? null,
    wave_direction_deg: current.wave_direction ?? null,
    wave_period_s: current.wave_period ?? null,

    swell_height_m: current.swell_wave_height ?? null,
    swell_direction_deg: current.swell_wave_direction ?? null,
    swell_period_s: current.swell_wave_period ?? null,

    sea_surface_temperature_c: current.sea_surface_temperature ?? null,
    ocean_current_velocity: current.ocean_current_velocity ?? null,

    provider: "open-meteo",
    fetched_at: new Date().toISOString()
  };
}
