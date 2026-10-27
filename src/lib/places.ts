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

  let label = landmark
    ? unique([landmark, street, area, city, state]).join(", ")
    : unique([street, area, city, state]).join(", ");

  if (isOAUCampus(lat, lon)) {
    if (landmark) {
      label = unique([landmark, "OAU Campus", "Ile-Ife"]).join(", ");
    } else if (street && !isGenericLocation(street)) {
      label = unique([street, "OAU Campus", "Ile-Ife"]).join(", ");
    } else {
      label = formatCampusFallbackLocation(lat, lon);
    }
  } else if (isGenericLocation(label)) {
    label = formatCampusFallbackLocation(lat, lon);
  }

  return {
    id: `${lat.toFixed(5)},${lon.toFixed(5)}`,
    label,
    address: primary || label,
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

  let label = unique([name, street, area, city, state]).join(", ");

  if (isOAUCampus(lat, lon)) {
    if (name) {
      label = unique([name, "OAU Campus", "Ile-Ife"]).join(", ");
    } else if (street && !isGenericLocation(street)) {
      label = unique([street, "OAU Campus", "Ile-Ife"]).join(", ");
    } else {
      label = formatCampusFallbackLocation(lat, lon);
    }
  } else if (isGenericLocation(label)) {
    label = formatCampusFallbackLocation(lat, lon);
  }

  return {
    id: `${lat.toFixed(5)},${lon.toFixed(5)}`,
    label,
    address: name || street || area || label,
    area,
    city,
    state,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
  };
}

export const OAU_CAMPUS_CENTER: [number, number] = [4.5284, 7.5186]; // [lng, lat]

export function isOAUCampus(lat: number, lon: number): boolean {
  return lat >= 7.500 && lat <= 7.545 && lon >= 4.505 && lon <= 4.550;
}

export function isGenericLocation(text: string): boolean {
  const n = text.trim().toLowerCase();
  return (
    !n ||
    n === "ile-ife, osun" ||
    n === "ife, osun" ||
    n === "ile-ife" ||
    n === "ife" ||
    n === "osun" ||
    n === "osun state" ||
    n === "nigeria" ||
    /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(n)
  );
}

export const OAU_LANDMARKS: Array<{ name: string; coords: [number, number] }> = [
  { name: "Faculty of Technology Lecture Theatre", coords: [4.5282, 7.5173] },
  { name: "Faculty of Technology", coords: [4.5288, 7.5176] },
  { name: "Spider Building", coords: [4.527, 7.5165] },
  { name: "Senate Building", coords: [4.5284, 7.5186] },
  { name: "Oduduwa Hall", coords: [4.5275, 7.519] },
  { name: "Amphitheatre", coords: [4.5273, 7.5188] },
  { name: "Hezekiah Library", coords: [4.5262, 7.5195] },
  { name: "Computer Science & Maths Building", coords: [4.5285, 7.5182] },
  { name: "Natural History Museum", coords: [4.5298, 7.516] },
  { name: "Faculty of Administration (BOOC)", coords: [4.5292, 7.5198] },
  { name: "Faculty of Arts", coords: [4.5278, 7.5205] },
  { name: "Faculty of Social Sciences", coords: [4.5295, 7.5215] },
  { name: "Faculty of Law", coords: [4.53, 7.521] },
  { name: "Faculty of Science (White House)", coords: [4.525, 7.518] },
  { name: "Faculty of Education", coords: [4.523, 7.519] },
  { name: "Faculty of Pharmacy", coords: [4.524, 7.5175] },
  { name: "College of Health Sciences", coords: [4.5245, 7.5168] },
  { name: "Faculty of Agriculture", coords: [4.522, 7.516] },
  { name: "SUB (Student Union Building)", coords: [4.5255, 7.5205] },
  { name: "Health Centre (Campus Clinic)", coords: [4.531, 7.515] },
  { name: "Sports Complex (Main Bowl)", coords: [4.5235, 7.5265] },
  { name: "Moremi Hall", coords: [4.5225, 7.517] },
  { name: "Awo Hall (Obafemi Awolowo)", coords: [4.521, 7.525] },
  { name: "Fajuyi Hall", coords: [4.524, 7.522] },
  { name: "Angola Hall", coords: [4.52, 7.523] },
  { name: "Mozambique Hall", coords: [4.5205, 7.522] },
  { name: "Ladoke Akintola Hall (PG Hall)", coords: [4.523, 7.524] },
  { name: "Alumni Hall", coords: [4.5215, 7.5185] },
  { name: "ETF Hall", coords: [4.5235, 7.5245] },
  { name: "Campus Main Gate", coords: [4.538, 7.502] },
];

export function findNearestCampusLandmark(lat: number, lon: number): { name: string; distanceMeters: number } {
  let nearest = OAU_LANDMARKS[0];
  let minDistance = Infinity;

  for (const lm of OAU_LANDMARKS) {
    const dLat = (lat - lm.coords[1]) * 111000;
    const dLon = (lon - lm.coords[0]) * 111000 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = lm;
    }
  }

  return { name: nearest.name, distanceMeters: Math.round(minDistance) };
}

export function formatCampusFallbackLocation(lat: number, lon: number): string {
  const nearest = findNearestCampusLandmark(lat, lon);
  if (nearest.distanceMeters <= 75) {
    return `${nearest.name}, OAU Campus, Ile-Ife`;
  }
  return `Near ${nearest.name}, OAU Campus, Ile-Ife`;
}
