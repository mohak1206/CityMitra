// Location utilities for geolocation

/**
 * Gets the current location using browser geolocation API
 * @returns {Promise<{lat: number, lng: number}>} Location coordinates
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        resolve({
          lat,
          lng,
          accuracy: position.coords.accuracy,
          address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });
      },
      (error) => {
        let message = "Failed to get location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information unavailable";
            break;
          case error.TIMEOUT:
            message = "Location request timed out";
            break;
        }
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
};

/**
 * Gets address from coordinates using reverse geocoding
 * This is a placeholder - implement with your preferred geocoding service
 */
export const getAddressFromCoords = async (lat, lng) => {
  // Placeholder - return coordinates as string
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};
