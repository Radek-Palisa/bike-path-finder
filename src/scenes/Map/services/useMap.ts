import { Loader } from '@googlemaps/js-api-loader';
import { useEffect, useState } from 'react';
import {
  getLastMapCenterFromLocalStorage,
  setLastMapCenterToLocalStorage,
} from './localStorage/lastMapCenter';

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
  version: 'weekly',
  libraries: ['geometry'],
});

const defaultMapCenter = {
  lat: 41.384832,
  lng: 2.1722708,
  zoom: 14,
} as const;

const mapUIoptions = {
  disableDefaultUI: true,
  // mapTypeControl: false,
  // streetViewControl: false,
  // zoomControl: false,
  // fullscreenControl: false,
  // rotateControl: true,
  // scaleControl: false,
  gestureHandling: 'greedy',
} as const;

export default function useMap(
  divRef: React.RefObject<HTMLDivElement>
): google.maps.Map<HTMLDivElement> | null {
  const [map, setMap] = useState<google.maps.Map<HTMLDivElement> | null>(null);

  useEffect(() => {
    loader.load().then(() => {
      const lastMapCenter = getLastMapCenterFromLocalStorage();

      const { zoom, ...center } = lastMapCenter || defaultMapCenter;

      const _map = new window.google.maps.Map(divRef.current as HTMLDivElement, {
        center,
        zoom,
        ...mapUIoptions,
      });

      setMap(_map);

      _map.addListener('idle', () => {
        setLastMapCenterToLocalStorage({ ..._map.getCenter().toJSON(), zoom: _map.getZoom() });
      });
    });
  }, []);

  return map;
}
