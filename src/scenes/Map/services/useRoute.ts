import { useCallback, useRef, useState } from 'react';

const getDottedPolyline = ({ strokeColor, zIndex }: { strokeColor: string; zIndex: number }) => ({
  zIndex,
  strokeColor,
  strokeOpacity: 0,
  strokeWeight: 6,
  icons: [
    {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: strokeColor,
        fillOpacity: 1,
        scale: 2,
        strokeColor: strokeColor,
        strokeOpacity: 1,
      },
      offset: '0',
      repeat: '10px',
    },
  ],
});

type FindRoute = (
  origin: google.maps.LatLng,
  originStation: google.maps.LatLng,
  destinationStation: google.maps.LatLng,
  destination: google.maps.LatLng
) => Promise<void>;

export default function useRoute(map: google.maps.Map | null) {
  const currentRenderers = useRef<google.maps.DirectionsRenderer[]>([]);
  const [routes, setRoutes] = useState<google.maps.DirectionsLeg[][] | null>(null);

  const findRoute = useCallback<FindRoute>(
    (origin, originStation, destinationStation, destination) => {
      if (!map) {
        return Promise.resolve(window.alert('Google Maps Api is not loaded yet'));
      }

      // clean up the previously rendered routes
      currentRenderers.current.forEach(renderer => renderer.setMap(null));
      currentRenderers.current = [];

      const directionsService = new google.maps.DirectionsService();

      const getRoute = (request: google.maps.DirectionsRequest) =>
        new Promise<google.maps.DirectionsResult>((resolve, reject) => {
          directionsService.route(request, (result, status) => {
            if (status !== google.maps.DirectionsStatus.OK) {
              return reject(status);
            }
            resolve(result);
          });
        });

      const fromOriginToStation = getRoute({
        origin,
        destination: originStation,
        travelMode: google.maps.TravelMode.WALKING,
        provideRouteAlternatives: false,
      });

      const fromStationToDestination = getRoute({
        origin: destinationStation,
        destination,
        travelMode: google.maps.TravelMode.WALKING,
        provideRouteAlternatives: false,
      });

      const betweenStationsRoutes = getRoute({
        origin: originStation,
        destination: destinationStation,
        travelMode: google.maps.TravelMode.BICYCLING,
        provideRouteAlternatives: true,
      });

      return Promise.all([
        fromOriginToStation,
        betweenStationsRoutes,
        fromStationToDestination,
      ]).then(
        ([fromOriginToStationResult, betweenStationsResult, fromStationToDestinationResult]) => {
          const rendererConfigs = [
            {
              map,
              directions: fromOriginToStationResult,
              suppressMarkers: true,
              preserveViewport: true,
              routeIndex: 0,
              polylineOptions: getDottedPolyline({ strokeColor: '#669df6', zIndex: 0 }),
            },
            ...betweenStationsResult.routes.map((_, index) => ({
              map,
              directions: betweenStationsResult,
              suppressMarkers: true,
              routeIndex: index,
              polylineOptions: {
                strokeColor: index === 0 ? '#669df6' : '#bbbdbf',
                strokeWeight: 6,
                zIndex: 10 - index,
              },
            })),
            {
              map,
              directions: fromStationToDestinationResult,
              suppressMarkers: true,
              preserveViewport: true, // avoid zooming on this leg
              routeIndex: 0,
              polylineOptions: getDottedPolyline({ strokeColor: '#669df6', zIndex: 0 }),
            },
          ];

          currentRenderers.current = rendererConfigs.map(
            // this will actually draw the routes on the map
            config => new google.maps.DirectionsRenderer(config)
          );

          setRoutes(
            betweenStationsResult.routes.map(routeBetweenStations => [
              fromOriginToStationResult.routes[0].legs[0],
              routeBetweenStations.legs[0],
              fromStationToDestinationResult.routes[0].legs[0],
            ])
          );
        }
      );
    },
    [map]
  );

  const clearRoute = useCallback(() => {
    currentRenderers.current.forEach(renderer => renderer.setMap(null));
    currentRenderers.current = [];
    setRoutes(null);
  }, [setRoutes]);

  return {
    routes,
    findRoute,
    clearRoute,
  };
}
