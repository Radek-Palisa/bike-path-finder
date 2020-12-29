import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import { Loader } from '@googlemaps/js-api-loader';
import onLongPress from './services/onLongPress';
import ActionPanel from './components/ActionPanel/ActionalPanel';
import Button from './components/Button/Button';
import CurrentPositionControl from './components/CurrentPositionControl/CurrentPositionControl';
import { fetchBicingStationsStatus, getBicingStationsGeoData } from './services/bicingApi';
import { GeoJsonFeature } from './services/types';
import { ReactComponent as DirectionsIcon } from '../../assets/directions.svg';
import Typography from './components/Typography/Typography';

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
  version: 'weekly',
  libraries: ['geometry'],
});

export default function Map() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const [destination, setDestination] = useState<google.maps.LatLng | null>(null);

  const bikeStationIcon = (emptyPercentage: number) =>
    `<svg width="34" height="46" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="myGradient" x1="16.77" y1="0" x2="16.77" y2="47.92" gradientUnits="userSpaceOnUse"><stop offset="${emptyPercentage}" stop-color="rgb(249, 221, 219)"></stop><stop offset="{{emptyPercentage}}" stop-color="rgb(219, 80, 74)"></stop></linearGradient></defs><path d="M16.77 0A16.79 16.79 0 000 16.77c0 9.29 9.14 21.83 13.92 27.77a3.62 3.62 0 005.7 0c4.78-5.94 13.92-18.48 13.92-27.77C33.54 7.52 26.02 0 16.77 0z" fill="url(#myGradient)"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M16.77 1.5A15.3 15.3 0 001.5 16.77c0 4.23 2.11 9.4 4.97 14.4a98.87 98.87 0 008.62 12.43 2.13 2.13 0 003.36 0 98.86 98.86 0 008.62-12.43c2.86-5 4.97-10.17 4.97-14.4A15.3 15.3 0 0016.77 1.5zM0 16.77C0 7.52 7.52 0 16.77 0s16.77 7.52 16.77 16.77c0 9.29-9.14 21.83-13.92 27.77a3.62 3.62 0 01-5.7 0C9.14 38.6 0 26.06 0 16.77z" fill="white"></path><circle cx="11" cy="20" r="3.36" stroke="white" stroke-width="1.29"></circle><circle cx="22.69" cy="20" r="3.36" stroke="white" stroke-width="1.29"></circle><path d="M16.85 20H11.3l3.38-5.54M16.85 20l3.07-5.54M16.85 20l-2.16-5.54m5.23 0h1.85m-1.85 0H14.7m7.08 0l.92 5.85m-.92-5.85l-.3-2.46H19m-4.3 2.46L13.76 12m-1.54 0h1.54m2.15 0h-2.15" stroke="white" stroke-width="1.29" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16.87 21.9c-.68 0-1.25-.58-1.25-1.26 0-.69.57-1.26 1.25-1.26s1.25.57 1.25 1.26c.06.68-.51 1.25-1.25 1.25zm0-1.95a.7.7 0 00-.68.69c0 .34.34.68.68.68s.68-.34.68-.68a.7.7 0 00-.68-.69z" fill="white"></path><path d="M17.84 22.58c-.12 0-.17-.06-.23-.12l-1.08-1.65c-.12-.11-.06-.29.05-.4.12-.11.29-.06.4.06l1.09 1.65c.11.11.05.28-.06.4-.06.06-.12.06-.17.06z" fill="white"></path><path d="M18.4 22.69h-1.08c-.17 0-.28-.11-.28-.29 0-.17.11-.28.28-.28h1.09c.17 0 .28.11.28.29 0 .17-.11.28-.28.28z" fill="white"></path></svg>`;

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

      const currentPositionControl = new CurrentPositionControl(map);
      const currentPositionPromise = currentPositionControl.getCurrentPosition();

      const stationsInfoPromise = getBicingStationsGeoData().then(data => {
        map.data.addGeoJson(data);
        return data;
      });

      map.data.setStyle({
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(bikeStationIcon(0.6)),
        },
      });

      Promise.all([stationsInfoPromise, currentPositionPromise]).then(
        ([stationsInfoGeoJson, currentPosition]) => {
          if (!currentPosition) {
            return;
          }

          const nearStations: Array<GeoJsonFeature> = [];

          stationsInfoGeoJson.features.forEach(feature => {
            const { geometry } = feature;
            const to = new google.maps.LatLng({
              lng: geometry.coordinates[0],
              lat: geometry.coordinates[1],
            });
            const distance = google.maps.geometry.spherical.computeDistanceBetween(
              currentPosition,
              to
            );
            // meters
            if (distance < 600) {
              nearStations.push(feature);
            }
          });
          console.log(nearStations);
        }
      );

      // const stationsStatusesPromise = fetchBicingStationsStatus();

      // Promise.all([stationsInfoPromise, stationsStatusesPromise]).then(([, stationStatuses]) => {
      //   console.log(stationStatuses);
      // });
    });
  }, []);

  return (
    <div id="map-container">
      <div id="map" ref={mapDiv}></div>
      <ActionPanel isOn={Boolean(destination)}>
        <Typography gutterBottom>Dropped pin</Typography>
        <Typography color="textSecondary" paragraph>
          {destination?.toUrlValue()}
        </Typography>
        <Button variant="contained" startIcon={<DirectionsIcon />} color="primary">
          Directions
        </Button>
      </ActionPanel>
    </div>
  );
}
