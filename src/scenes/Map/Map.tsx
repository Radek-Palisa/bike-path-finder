import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import { Loader } from '@googlemaps/js-api-loader';
import onLongPress from './services/onLongPress';
import ActionPanel from './components/ActionPanel/ActionalPanel';
import CurrentPositionControl from './components/CurrentPositionControl/CurrentPositionControl';
import { fetchBicingStationsStatus, getBicingStationsGeoData } from './services/bicingApi';
import { GeoJsonFeature } from './services/types';

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
  version: 'weekly',
  libraries: ['geometry'],
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

      const currentPositionControl = new CurrentPositionControl(map);
      const currentPositionPromise = currentPositionControl.getCurrentPosition();

      const stationsInfoPromise = getBicingStationsGeoData().then(data => {
        map.data.addGeoJson(data);
        return data;
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
      <ActionPanel isOn={Boolean(destination)}>{destination?.toUrlValue()}</ActionPanel>
    </div>
  );
}
