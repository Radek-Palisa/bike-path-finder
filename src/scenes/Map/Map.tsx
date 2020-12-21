import React, { useEffect } from 'react';
import './Map.css';
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
  version: 'weekly',
});

export default function Map() {
  useEffect(() => {
    loader.load().then(() => {
      const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
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

      // const longpress = false;
      // const start = 0;
      // const end = 0;

      // map.addListener('click', function (event) {
      //   longpress ? console.log('Long Press') : console.log('Short Press');
      // });

      // map.addListener('mousedown', function (event) {
      //   start = new Date().getTime();
      //   setTimeout(() => {}, 500);
      // });

      // map.addListener('mouseup', function (event) {
      //   end = new Date().getTime();
      //   longpress = end - start < 500 ? false : true;
      // });
    });
  }, []);

  return <div id="map"></div>;
}
