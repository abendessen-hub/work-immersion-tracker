export type LocationFix = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

export function getCurrentLocation(): Promise<LocationFix> {
  if (!navigator.geolocation) {
    return Promise.reject(new Error("This device does not support location."));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }),
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Allow location access and try again."
            : error.code === error.POSITION_UNAVAILABLE
              ? "Your location is unavailable. Check location services and try again."
              : error.code === error.TIMEOUT
                ? "Getting your location timed out. Try again."
                : "Could not get your location.";
        reject(new Error(message));
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 },
    );
  });
}
