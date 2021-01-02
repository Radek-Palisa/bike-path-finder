import { useEffect, useRef } from 'react';

type FindRoute = (origin: google.maps.LatLng, destination: google.maps.LatLng) => void;

type Directions = {
  findRoute: FindRoute;
};

export default function useDirections(map: google.maps.Map | null) {
  const currentRenderers = useRef<google.maps.DirectionsRenderer[]>([]);
  const directions = useRef<Directions>({
    findRoute: () => {},
  });

  useEffect(() => {
    if (!map) return;

    const directionsService = new google.maps.DirectionsService();

    directions.current.findRoute = (
      origin: google.maps.LatLng,
      destination: google.maps.LatLng
    ) => {
      currentRenderers.current.forEach(renderer => renderer.setMap(null));
      currentRenderers.current = [];

      const request = {
        origin,
        destination,
        travelMode: google.maps.TravelMode.BICYCLING,
        provideRouteAlternatives: true,
      };

      directionsService.route(request, (result, status) => {
        console.log(result);
        if (status == 'OK') {
          result.routes.forEach((route, routeIndex) => {
            currentRenderers.current.push(
              new google.maps.DirectionsRenderer({
                map,
                directions: result,
                routeIndex,
                polylineOptions: {
                  strokeColor: routeIndex === 0 ? '#669df6' : '#bbbdbf',
                  strokeWeight: 6,
                  zIndex: 10 - routeIndex,
                },
              })
            );
          });
        }
      });
    };
  }, [map]);

  return directions.current;
}
