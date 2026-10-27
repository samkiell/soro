/**
 * Place types and geocoding converters for Nigerian addresses and OAU campus landmarks.
 */

export type Place = {
  id: string;
  label: string;
  address: string;
  area: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
};

export type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
  name?: string;
  address?: Partial<
    Record<
      | "amenity"
      | "building"
      | "university"
      | "college"
      | "house_number"
      | "road"
      | "pedestrian"
      | "suburb"
      | "neighbourhood"
      | "quarter"
      | "city_district"
      | "city"
      | "town"
      | "village"
      | "county"
      | "state"
      | "country_code",
      string
    >
  >;
};

export type PhotonFeature = {
  geometry: { coordinates: [number, number] };
  properties: Partial<
    Record<
      | "name"
      | "housenumber"
      | "street"
      | "district"
      | "locality"
      | "city"
      | "county"
      | "state"
      | "countrycode",
      string
    >
  >;
};

const clean = (val?: string) => (val ?? "").trim();
const unique = (vals: string[]) => vals.filter((v, i) => v && vals.indexOf(v) === i);

export function fromNominatim(result: NominatimResult): Place | null {
  const lat = Number(result.lat);
  const lon = Number(result.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const addr = result.address ?? {};
  if (addr.country_code && addr.country_code !== "ng") return null;

  const landmark =
    clean(result.name) ||
    clean(addr.building) ||
    clean(addr.amenity) ||
    clean(addr.university) ||
    clean(addr.college);

  const street = unique([clean(addr.house_number), clean(addr.road ?? addr.pedestrian)]).join(" ");
  const area = clean(addr.suburb ?? addr.neighbourhood ?? addr.quarter ?? addr.city_district);
  const city = clean(addr.city ?? addr.town ?? addr.village ?? "Ile-Ife");
  const state = clean(addr.state ?? "Osun State").replace(/\s+State$/i, "");

  const primary = landmark || street || area || city;

  const label = landmark
    ? unique([landmark, street, area, city, state]).join(", ")
    : unique([street, area, city, state]).join(", ");

  return {
    id: `${lat.toFixed(5)},${lon.toFixed(5)}`,
    label: label || clean(result.display_name),
    address: primary,
    area,
    city,
    state,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
  };
}

export function fromPhoton(feature: PhotonFeature): Place | null {
  const p = feature.properties;
  if (p.countrycode && p.countrycode.toUpperCase() !== "NG") return null;

  const [lon, lat] = feature.geometry.coordinates;
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

  const name = clean(p.name);
  const street = unique([clean(p.housenumber), clean(p.street)]).join(" ");
  const area = clean(p.district ?? p.locality);
  const city = clean(p.city ?? p.county ?? "Ile-Ife");
  const state = clean(p.state ?? "Osun").replace(/\s+State$/i, "");

  const label = unique([name, street, area, city, state]).join(", ");

  return {
    id: `${lat.toFixed(5)},${lon.toFixed(5)}`,
    label,
    address: name || street || area,
    area,
    city,
    state,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
  };
}

export const OAU_CAMPUS_CENTER: [number, number] = [4.5284, 7.5186]; // [lng, lat]
