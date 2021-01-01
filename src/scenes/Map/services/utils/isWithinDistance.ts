export default function isWithinDistance(
  distanceInMeters: number,
  origin: google.maps.LatLng,
  destination: google.maps.LatLng
) {
  const distance = google.maps.geometry.spherical.computeDistanceBetween(origin, destination);
  return distance <= distanceInMeters;
}
