/**
 * Device geolocation helper with high accuracy fallback and descriptive error messages.
 */

export type Coordinates = { latitude: number; longitude: number };
export type LocationFailure = "unsupported" | "insecure" | "denied" | "unavailable" | "timeout";

export const LOCATION_MESSAGES: Record<LocationFailure, string> = {
  unsupported: "Your browser does not support location sharing. Please enter your location manually.",
  insecure: "Location detection requires a secure (HTTPS) connection. Please enter your location manually.",
  denied: "Location access was denied. Please enable location permissions in your browser or type the location manually.",
  unavailable: "Could not determine your current location. Please verify that your device location services are turned on.",
  timeout: "Location request timed out. Please try again or type the location manually.",
};

export class LocationError extends Error {
  constructor(public failure: LocationFailure) {
    super(LOCATION_MESSAGES[failure]);
  }
}

function failureFrom(error: GeolocationPositionError | null | undefined): LocationFailure {
  if (error?.code === 1) return "denied";
  if (error?.code === 3) return "timeout";
  return "unavailable";
}

function attempt(options: PositionOptions): Promise<GeolocationPosition> {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

/**
 * Requests device GPS coordinates with a quick network fix first,
 * falling back to high-accuracy GPS if needed.
 */
export async function requestDeviceLocation(): Promise<Coordinates> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    throw new LocationError("unsupported");
  }

  if (window.isSecureContext === false && window.location.hostname !== "localhost") {
    throw new LocationError("insecure");
  }

  let position: GeolocationPosition;
  try {
    position = await attempt({ enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 });
  } catch (first) {
    const failure = failureFrom(first as GeolocationPositionError);
    if (failure === "denied") throw new LocationError(failure);
    try {
      position = await attempt({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    } catch (second) {
      throw new LocationError(failureFrom(second as GeolocationPositionError));
    }
  }

  return {
    latitude: Number(position.coords.latitude.toFixed(6)),
    longitude: Number(position.coords.longitude.toFixed(6)),
  };
}
