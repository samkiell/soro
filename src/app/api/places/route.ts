import { NextResponse } from "next/server";
import { fromNominatim, fromPhoton, type NominatimResult, type PhotonFeature, type Place } from "@/lib/places";

const USER_AGENT = "Soro-OAU-Campus-Safety/1.0 (campus-safety@oauife.edu.ng)";
const TIMEOUT_MS = 6000;
const NIGERIA_BBOX = "2.67,4.27,14.68,13.89";

async function fetchJson<T>(url: string, revalidateSecs = 3600): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json",
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: revalidateSecs },
    });
    return res.ok ? ((await res.json()) as T) : null;
  } catch {
    return null;
  }
}

async function reverse(lat: number, lon: number): Promise<Place | null> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "jsonv2",
    addressdetails: "1",
    zoom: "18",
  });
  const data = await fetchJson<NominatimResult>(`https://nominatim.openstreetmap.org/reverse?${params}`, 86400);
  return data ? fromNominatim(data) : null;
}

async function search(text: string, near?: { lat: number; lon: number } | null): Promise<Place[]> {
  const photonParams = new URLSearchParams({
    q: text,
    limit: "6",
    lang: "en",
    bbox: NIGERIA_BBOX,
  });
  if (near) {
    photonParams.set("lat", String(near.lat));
    photonParams.set("lon", String(near.lon));
  }

  const photonData = await fetchJson<{ features?: PhotonFeature[] }>(
    `https://photon.komoot.io/api/?${photonParams}`,
    86400,
  );

  if (photonData?.features && photonData.features.length > 0) {
    const list: Place[] = [];
    for (const f of photonData.features) {
      const p = fromPhoton(f);
      if (p && !list.some((existing) => existing.label === p.label)) {
        list.push(p);
      }
    }
    if (list.length > 0) return list;
  }

  const nomParams = new URLSearchParams({
    q: `${text}, Nigeria`,
    format: "jsonv2",
    addressdetails: "1",
    countrycodes: "ng",
    limit: "6",
  });
  const nomData = await fetchJson<NominatimResult[]>(
    `https://nominatim.openstreetmap.org/search?${nomParams}`,
    86400,
  );

  if (nomData) {
    const list: Place[] = [];
    for (const item of nomData) {
      const p = fromNominatim(item);
      if (p && !list.some((existing) => existing.label === p.label)) {
        list.push(p);
      }
    }
    return list;
  }

  return [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");
  const q = (searchParams.get("q") ?? "").trim().slice(0, 100);

  if (q) {
    if (q.length < 2) return NextResponse.json({ places: [] });
    const lat = latStr ? Number(latStr) : null;
    const lon = lonStr ? Number(lonStr) : null;
    const near = lat !== null && lon !== null && Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
    const places = await search(q, near);
    return NextResponse.json({ places });
  }

  if (latStr && lonStr) {
    const lat = Number(latStr);
    const lon = Number(lonStr);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
    }
    const place = await reverse(lat, lon);
    return NextResponse.json({ place });
  }

  return NextResponse.json({ error: "Missing required query parameters: lat/lon or q" }, { status: 400 });
}
