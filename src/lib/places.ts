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

/**
 * Strips out city, state, country, and university suffixes so that only
 * specific campus locations (hostels, halls, faculties, landmarks) remain.
 */
export function cleanLocationLabel(text: string): string {
  if (!text) return "";
  const filtered = text
    .split(",")
    .map((s) => s.trim())
    .filter((s) => {
      const lower = s.toLowerCase();
      return (
        lower &&
        lower !== "ile-ife" &&
        lower !== "ife" &&
        lower !== "osun" &&
        lower !== "osun state" &&
        lower !== "oyo" &&
        lower !== "oyo state" &&
        lower !== "nigeria" &&
        lower !== "oau campus" &&
        lower !== "o.a.u campus" &&
        lower !== "oau" &&
        lower !== "o.a.u" &&
        lower !== "obafemi awolowo university" &&
        lower !== "campus"
      );
    });

  return unique(filtered).join(", ");
}

export function isGenericLocation(text: string): boolean {
  const cleaned = cleanLocationLabel(text);
  if (!cleaned) return true;
  const n = cleaned.toLowerCase();
  return (
    n === "ile-ife" ||
    n === "ife" ||
    n === "osun" ||
    n === "osun state" ||
    n === "oyo" ||
    n === "oyo state" ||
    n === "nigeria" ||
    n === "oau campus" ||
    n === "oau" ||
    n === "obafemi awolowo university" ||
    n === "campus" ||
    n === "university" ||
    n === "road 1" ||
    n === "road 2" ||
    n.startsWith("road ") ||
    /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/.test(n)
  );
}

export const OAU_CAMPUS_CENTER: [number, number] = [4.5284, 7.5186]; // [lng, lat]

/**
 * Checks if coordinates fall within the broader OAU campus and student residential bounds.
 */
export function isOAUCampus(lat: number, lon: number): boolean {
  return lat >= 7.480 && lat <= 7.555 && lon >= 4.490 && lon <= 4.565;
}

export const OAU_LANDMARKS: Array<{ name: string; coords: [number, number] }> = [
  // Student Hostels & Residential Halls (Verified GPS coordinates)
  { name: "Awolowo Hall (Awo Hall)", coords: [4.51472, 7.52058] },
  { name: "Awolowo Hall Cafe & Quadrangle", coords: [4.51520, 7.52080] },
  { name: "Moremi Hall", coords: [4.51860, 7.51965] },
  { name: "Moremi Hall Car Park", coords: [4.51920, 7.51950] },
  { name: "Fajuyi Hall", coords: [4.51761, 7.51767] },
  { name: "Fajuyi Hall Annex (Block F)", coords: [4.51696, 7.51782] },
  { name: "Angola Hall", coords: [4.51247, 7.52180] },
  { name: "Mozambique Hall", coords: [4.51413, 7.52286] },
  { name: "Anglomoz Car Park", coords: [4.51330, 7.52230] },
  { name: "Alumni Hall", coords: [4.51713, 7.52152] },
  { name: "ETF Hall", coords: [4.51456, 7.51809] },
  { name: "Ladoke Akintola Hall (PG Hall)", coords: [4.52400, 7.51700] },
  { name: "Murtala Muhammed PG Hall", coords: [4.52450, 7.51650] },
  { name: "New Market (Hostels Buka)", coords: [4.51290, 7.51560] },
  { name: "Maintenance & Works", coords: [4.51600, 7.51450] },

  // Academic Core & Lecture Theatres
  { name: "Faculty of Technology Lecture Theatre", coords: [4.52820, 7.51730] },
  { name: "Faculty of Technology", coords: [4.52880, 7.51760] },
  { name: "Spider Building", coords: [4.52700, 7.51650] },
  { name: "Senate Building", coords: [4.52840, 7.51860] },
  { name: "Oduduwa Hall", coords: [4.52750, 7.51900] },
  { name: "Amphitheatre", coords: [4.52730, 7.51880] },
  { name: "Hezekiah Oluwasanmi Library", coords: [4.52620, 7.51950] },
  { name: "Computer Science & Maths Building", coords: [4.52850, 7.51820] },
  { name: "Natural History Museum", coords: [4.52980, 7.51600] },
  { name: "Faculty of Administration (BOOC)", coords: [4.52920, 7.51980] },
  { name: "Faculty of Arts", coords: [4.52780, 7.52050] },
  { name: "Faculty of Social Sciences", coords: [4.52950, 7.52150] },
  { name: "Faculty of Law", coords: [4.53000, 7.52100] },
  { name: "Faculty of Science (White House)", coords: [4.52500, 7.51800] },
  { name: "Faculty of Education", coords: [4.52300, 7.51900] },
  { name: "Faculty of Pharmacy", coords: [4.52400, 7.51750] },
  { name: "College of Health Sciences", coords: [4.52450, 7.51680] },
  { name: "Faculty of Agriculture", coords: [4.52200, 7.51600] },
  { name: "SUB (Student Union Building)", coords: [4.52550, 7.52050] },
  { name: "SUB Car Park & Buka", coords: [4.52520, 7.52000] },
  { name: "Health Centre (Campus Clinic)", coords: [4.53100, 7.51500] },
  { name: "OAU Fire Service Station", coords: [4.53050, 7.51620] },
  { name: "Campus Security Post", coords: [4.52780, 7.51840] },
  { name: "Sports Complex (Main Bowl)", coords: [4.52350, 7.52650] },
  { name: "Swimming Pool & Courts", coords: [4.52450, 7.52600] },
  { name: "Campus Main Gate", coords: [4.53800, 7.50200] },
  { name: "Road 1 Campus Gate", coords: [4.53700, 7.50400] },
  { name: "Staff Quarters", coords: [4.53200, 7.52800] },
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

/**
 * Formats a campus location strictly without city, state, or university redundancies.
 */
export function formatCampusFallbackLocation(lat: number, lon: number): string {
  const nearest = findNearestCampusLandmark(lat, lon);
  if (nearest.distanceMeters <= 85) {
    return nearest.name;
  }
  return `Near ${nearest.name}`;
}

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

  const raw = landmark || street || area;
  let label = cleanLocationLabel(raw);

  // If on campus, or if external geocode produced a generic city/state label like "Ile-Ife, Oyo"
  if (isOAUCampus(lat, lon) || !label || isGenericLocation(label)) {
    label = formatCampusFallbackLocation(lat, lon);
  }

  return {
    id: `${lat.toFixed(5)},${lon.toFixed(5)}`,
    label,
    address: label,
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

  const raw = name || street || area;
  let label = cleanLocationLabel(raw);

  if (isOAUCampus(lat, lon) || !label || isGenericLocation(label)) {
    label = formatCampusFallbackLocation(lat, lon);
  }

  return {
    id: `${lat.toFixed(5)},${lon.toFixed(5)}`,
    label,
    address: label,
    area,
    city,
    state,
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lon.toFixed(6)),
  };
}
