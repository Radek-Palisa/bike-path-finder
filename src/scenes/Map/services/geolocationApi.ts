export function getCurrentPosition() {
  return new Promise<google.maps.LatLngLiteral>((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error("Browser doesn't support geolocation"));
    }
    navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      resolve(pos);
    }, reject);
  });
}

type WatchCurrentPositionCallback = (currentPosition: google.maps.LatLngLiteral | null) => void;

export function watchCurrentPosition(callback: WatchCurrentPositionCallback) {
  const watchId = navigator.geolocation.watchPosition(
    position => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    () => callback(null)
  );

  return () => navigator.geolocation.clearWatch(watchId);
}
