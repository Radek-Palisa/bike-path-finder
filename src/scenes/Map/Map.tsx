import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import { Loader } from '@googlemaps/js-api-loader';
import onLongPress from './services/onLongPress';
import ActionPanel from './components/ActionPanel/ActionalPanel';
import CurrentPositionControl from './components/CurrentPositionControl/CurrentPositionControl';
import { getBicingStationsGeoData } from './services/bicingApi';

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
  version: 'weekly',
});

export default function Map() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const [destination, setDestination] = useState<google.maps.LatLng | null>(null);

  useEffect(() => {
    loader.load().then(() => {
      const map = new google.maps.Map(mapDiv.current as HTMLDivElement, {
        center: { lat: 41.4013398, lng: 2.2028568 },
        zoom: 15,
        disableDefaultUI: true,
        // mapTypeControl: false,
        // streetViewControl: false,
        // zoomControl: false,
        // fullscreenControl: false,
        // rotateControl: true,
        // scaleControl: false,
        gestureHandling: 'greedy',
      });

      onLongPress(map, e => {
        if (marker.current) {
          marker.current.setMap(null);
        }

        marker.current = new google.maps.Marker({
          position: e.latLng,
          map: map,
        });

        setDestination(e.latLng);
      });

      map.addListener('click', () => {
        if (marker.current) {
          marker.current.setMap(null);
          setDestination(null);
        }
      });

      new CurrentPositionControl(map);

      getBicingStationsGeoData().then(data => {
        map.data.addGeoJson(data);
      });
    });
  }, []);

  return (
    <div id="map-container">
      <div id="map" ref={mapDiv}></div>
      <ActionPanel isOn={Boolean(destination)}>{destination?.toUrlValue()}</ActionPanel>
    </div>
  );
}
