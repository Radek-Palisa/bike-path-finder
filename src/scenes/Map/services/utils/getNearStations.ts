type NearbyStation = {
  distance: number;
  station: google.maps.Data.Feature;
};

type Props = {
  mapDataLayer: google.maps.Data;
  to: google.maps.LatLng;
  onEach?: (feature: google.maps.Data.Feature) => void;
};

export default function getThreeClosestStations({ mapDataLayer, to, onEach }: Props) {
  const nearStations: NearbyStation[] = [];

  mapDataLayer.forEach(feature => {
    const geometry = feature.getGeometry() as google.maps.Data.Point;
    const latLng = geometry.get();
    const distance = google.maps.geometry.spherical.computeDistanceBetween(latLng, to);

    if (!nearStations[0]?.distance) {
      nearStations[0] = {
        distance,
        station: feature,
      };
    } else if (distance < nearStations[0]?.distance) {
      nearStations[2] = nearStations[1];
      nearStations[1] = nearStations[0];
      nearStations[0] = {
        distance,
        station: feature,
      };
    } else if (distance < nearStations[1]?.distance) {
      nearStations[2] = nearStations[1];
      nearStations[1] = {
        distance,
        station: feature,
      };
    } else if (distance < nearStations[2]?.distance) {
      nearStations[2] = {
        distance,
        station: feature,
      };
    }

    if (onEach) {
      onEach(feature);
    }
  });

  return nearStations.map(nearStation => nearStation?.station);
}
