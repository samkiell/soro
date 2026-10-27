"use client";

import { useEffect, useRef, useState } from "react";
import type * as MapLibreType from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Check,
  Compass,
  Crosshair,
  Layers,
  Loader2,
  Map as MapIcon,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  LOCATION_MESSAGES,
  LocationError,
  requestDeviceLocation,
  type LocationFailure,
} from "@/lib/geolocation";
import { OAU_CAMPUS_CENTER, type Place } from "@/lib/places";

type LocationPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (locationText: string) => void;
  initialLocation?: string;
};

const OAU_LANDMARKS: Array<{ name: string; coords: [number, number] }> = [
  { name: "Senate Building", coords: [4.5284, 7.5186] },
  { name: "Hezekiah Library", coords: [4.5262, 7.5195] },
  { name: "Amphitheatre", coords: [4.5273, 7.5188] },
  { name: "Spider Building", coords: [4.527, 7.5165] },
  { name: "Moremi Hall", coords: [4.5225, 7.517] },
  { name: "Awo Hall", coords: [4.521, 7.525] },
  { name: "Fajuyi Hall", coords: [4.524, 7.522] },
  { name: "SUB (Student Union)", coords: [4.5255, 7.5205] },
  { name: "Health Centre", coords: [4.531, 7.515] },
];

export function LocationPickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialLocation,
}: LocationPickerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreType.Map | null>(null);

  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "failed">("loading");
  const [mapMode, setMapMode] = useState<"satellite" | "streets">("satellite");
  const [isMoving, setIsMoving] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string>("");
  const [isResolving, setIsResolving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  function toggleMapMode(mode: "satellite" | "streets") {
    setMapMode(mode);
    const map = mapRef.current;
    if (!map) return;
    try {
      if (mode === "satellite") {
        map.setLayoutProperty("satellite-layer", "visibility", "visible");
        map.setLayoutProperty("satellite-labels-layer", "visibility", "visible");
        map.setLayoutProperty("osm-layer", "visibility", "none");
      } else {
        map.setLayoutProperty("satellite-layer", "visibility", "none");
        map.setLayoutProperty("satellite-labels-layer", "visibility", "none");
        map.setLayoutProperty("osm-layer", "visibility", "visible");
      }
    } catch {
      // Map style might still be loading
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    let timer: number = 0;
    let lookupAbort: AbortController | null = null;

    async function initMap() {
      setMapStatus("loading");
      setErrorMessage(null);

      try {
        const maplibre = await import("maplibre-gl");
        if (cancelled || !containerRef.current) return;

        const map = new maplibre.Map({
          container: containerRef.current,
          style: {
            version: 8,
            sources: {
              satellite: {
                type: "raster",
                tiles: [
                  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                ],
                tileSize: 256,
                attribution: "Esri, Maxar, Earthstar Geographics",
                maxzoom: 19,
              },
              satelliteLabels: {
                type: "raster",
                tiles: [
                  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
                ],
                tileSize: 256,
                attribution: "",
                maxzoom: 19,
              },
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution: "© OpenStreetMap contributors",
                maxzoom: 19,
              },
            },
            layers: [
              {
                id: "satellite-layer",
                type: "raster",
                source: "satellite",
                minzoom: 0,
                maxzoom: 19,
                layout: {
                  visibility: "visible",
                },
              },
              {
                id: "satellite-labels-layer",
                type: "raster",
                source: "satelliteLabels",
                minzoom: 0,
                maxzoom: 19,
                layout: {
                  visibility: "visible",
                },
              },
              {
                id: "osm-layer",
                type: "raster",
                source: "osm",
                minzoom: 0,
                maxzoom: 19,
                layout: {
                  visibility: "none",
                },
              },
            ],
          },
          center: OAU_CAMPUS_CENTER,
          zoom: 16.5,
          attributionControl: { compact: true },
        });

        mapRef.current = map;

        const performLookup = (lng: number, lat: number) => {
          lookupAbort?.abort();
          lookupAbort = new AbortController();
          const signal = lookupAbort.signal;

          setIsResolving(true);
          window.clearTimeout(timer);

          timer = window.setTimeout(async () => {
            try {
              const res = await fetch(`/api/places?lat=${lat}&lon=${lng}`, { signal });
              if (signal.aborted || cancelled) return;
              if (res.ok) {
                const data = (await res.json()) as { place?: Place | null };
                if (data.place?.label) {
                  setResolvedAddress(data.place.label);
                } else {
                  setResolvedAddress(`Coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                }
              }
            } catch {
              if (!signal.aborted) {
                setResolvedAddress(`OAU Campus (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
              }
            } finally {
              if (!signal.aborted) setIsResolving(false);
            }
          }, 450);
        };

        map.once("load", () => {
          if (cancelled) return;
          setMapStatus("ready");
          const c = map.getCenter();
          performLookup(c.lng, c.lat);
        });

        map.on("movestart", () => setIsMoving(true));
        map.on("moveend", () => {
          setIsMoving(false);
          const c = map.getCenter();
          performLookup(c.lng, c.lat);
        });
      } catch {
        if (!cancelled) setMapStatus("failed");
      }
    }

    void initMap();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      lookupAbort?.abort();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [isOpen]);

  async function handleUseDeviceLocation() {
    setIsLocating(true);
    setErrorMessage(null);
    try {
      const coords = await requestDeviceLocation();
      mapRef.current?.flyTo({
        center: [coords.longitude, coords.latitude],
        zoom: 17,
        duration: 1000,
      });
    } catch (err) {
      if (err instanceof LocationError) {
        setErrorMessage(LOCATION_MESSAGES[err.failure as LocationFailure]);
      } else {
        setErrorMessage("Failed to acquire device location.");
      }
    } finally {
      setIsLocating(false);
    }
  }

  async function handleSearch(q: string) {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const center = mapRef.current?.getCenter();
      const params = new URLSearchParams({ q: q.trim() });
      if (center) {
        params.set("lat", String(center.lat));
        params.set("lon", String(center.lng));
      }
      const res = await fetch(`/api/places?${params}`);
      if (res.ok) {
        const data = (await res.json()) as { places?: Place[] };
        setSearchResults(data.places ?? []);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  function handleSelectPlace(place: Place) {
    setSearchResults([]);
    setSearchQuery("");
    setResolvedAddress(place.label);
    mapRef.current?.flyTo({
      center: [place.longitude, place.latitude],
      zoom: 17,
      duration: 800,
    });
  }

  function handleSelectLandmark(landmark: (typeof OAU_LANDMARKS)[0]) {
    setResolvedAddress(`${landmark.name}, Obafemi Awolowo University, Ile-Ife`);
    mapRef.current?.flyTo({
      center: landmark.coords,
      zoom: 17.5,
      duration: 800,
    });
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs sm:p-6 animate-in fade-in duration-200">
      <div className="relative flex h-[90vh] max-h-[720px] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-warm-cream/50 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-gold">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-brand">Pin Incident Location</h2>
              <p className="text-xs text-text-secondary">
                Drag the map to position the center pin on the exact location.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-text-secondary hover:bg-black/5 hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="border-b border-border bg-white p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                type="text"
                placeholder="Search campus buildings, hostels, landmarks..."
                value={searchQuery}
                onChange={(e) => void handleSearch(e.target.value)}
                className="pl-9 text-sm"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-text-muted" />
              )}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void handleUseDeviceLocation()}
              disabled={isLocating}
              className="shrink-0 border-brand/30 text-brand hover:bg-brand/5 gap-1.5 font-semibold"
            >
              {isLocating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-brand" /> Finding you...
                </>
              ) : (
                <>
                  <Crosshair className="h-4 w-4 text-gold" /> My Location
                </>
              )}
            </Button>
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute left-3 right-3 top-28 z-50 max-h-56 overflow-y-auto rounded-lg border border-border bg-white shadow-xl">
              {searchResults.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleSelectPlace(place)}
                  className="flex w-full items-start gap-2.5 px-4 py-2.5 text-left text-xs hover:bg-warm-cream transition-colors border-b border-border/50 last:border-0"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-gold mt-0.5" />
                  <div>
                    <p className="font-semibold text-ink">{place.address || place.label}</p>
                    <p className="text-text-muted">{place.label}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Quick Landmark Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="shrink-0 font-medium text-text-muted text-[11px] flex items-center gap-1">
              <Compass className="h-3 w-3" /> Quick:
            </span>
            {OAU_LANDMARKS.map((lm) => (
              <button
                key={lm.name}
                type="button"
                onClick={() => handleSelectLandmark(lm)}
                className="shrink-0 rounded-full border border-amber-200/80 bg-warm-cream/60 px-2.5 py-0.5 text-[11px] font-medium text-brand hover:border-gold hover:bg-gold/15 transition-colors"
              >
                {lm.name}
              </button>
            ))}
          </div>
        </div>

        {/* Map Stage */}
        <div className="relative flex-1 overflow-hidden bg-slate-100">
          <div ref={containerRef} className="h-full w-full" />

          {/* Satellite / Streets Mode Toggle */}
          <div className="absolute right-3 top-3 z-30 flex items-center rounded-lg border border-border/80 bg-white/95 p-1 shadow-md backdrop-blur-xs">
            <button
              type="button"
              onClick={() => toggleMapMode("satellite")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all",
                mapMode === "satellite"
                  ? "bg-brand text-white shadow-xs"
                  : "text-text-secondary hover:text-ink",
              )}
            >
              <Layers className="h-3.5 w-3.5 text-gold" /> Satellite
            </button>
            <button
              type="button"
              onClick={() => toggleMapMode("streets")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold transition-all",
                mapMode === "streets"
                  ? "bg-brand text-white shadow-xs"
                  : "text-text-secondary hover:text-ink",
              )}
            >
              <MapIcon className="h-3.5 w-3.5" /> Streets
            </button>
          </div>

          {/* Fixed Center Pin */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div
              className={`flex flex-col items-center transition-transform duration-150 ${
                isMoving ? "-translate-y-3 scale-110" : "translate-y-0"
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-gold shadow-xl border-2 border-white">
                <MapPin className="h-6 w-6 text-gold fill-gold/30" />
              </div>
              <div className="h-2 w-2 rotate-45 bg-brand -mt-1" />
              {/* Pin Shadow */}
              <div
                className={`h-2 w-4 rounded-full bg-black/30 blur-[1px] transition-all duration-150 ${
                  isMoving ? "scale-75 opacity-40 mt-3" : "scale-100 opacity-70 mt-1"
                }`}
              />
            </div>
          </div>

          {mapStatus === "loading" && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-xs">
              <div className="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 shadow-md border border-border">
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
                <span className="text-xs font-semibold text-ink">Loading OAU Campus Map...</span>
              </div>
            </div>
          )}

          {mapStatus === "failed" && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/90 p-4 text-center">
              <div className="max-w-sm rounded-xl border border-danger/30 bg-red-50 p-4">
                <p className="text-sm font-semibold text-danger">Unable to load interactive map tiles.</p>
                <p className="mt-1 text-xs text-text-secondary">
                  Please use device location or enter the building name manually.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Confirmation Bar */}
        <div className="border-t border-border bg-white p-4">
          {errorMessage && (
            <p className="mb-3 rounded-md border border-amber-300 bg-amber-50 p-2.5 text-xs text-amber-900" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <MapPin className="h-5 w-5 shrink-0 text-brand mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Selected Location</p>
                {isResolving ? (
                  <p className="text-xs text-text-muted animate-pulse">Resolving location details...</p>
                ) : (
                  <p className="truncate text-sm font-bold text-ink">
                    {resolvedAddress || initialLocation || "OAU Campus, Ile-Ife"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const finalLoc = resolvedAddress || initialLocation || "OAU Campus, Ile-Ife";
                  onConfirm(finalLoc);
                  onClose();
                }}
                disabled={isResolving}
                className="bg-brand text-white hover:bg-brand-hover font-semibold gap-1.5 shadow-sm"
              >
                <Check className="h-4 w-4 text-gold" /> Confirm Location
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
