import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import { Loader } from '@googlemaps/js-api-loader';
import onLongPress from './services/onLongPress';

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
  version: 'weekly',
});

export default function Map() {
  const mapDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loader.load().then(() => {
      const map = new google.maps.Map(mapDiv.current as HTMLDivElement, {
        center: { lat: 41.4013398, lng: 2.2028568 },
        zoom: 15,
        // disableDefaultUI: true,
        // mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        fullscreenControl: false,
        rotateControl: true,
        scaleControl: true,
        gestureHandling: 'greedy',
      });

      onLongPress(map, e => {
        console.log(e);
      });
    });
  }, []);

  return <div id="map" ref={mapDiv}></div>;
}
