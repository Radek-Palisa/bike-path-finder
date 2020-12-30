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
import getBikeStationIcon from './services/utils/getBikeStationIcon';

import dotStation from '../../assets/dot-station.svg';

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_API_KEY || '',
  version: 'weekly',
  libraries: ['geometry'],
});

export default function Map() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const centerMapToCurrentPosition = useRef(() => {});
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

      centerMapToCurrentPosition.current = currentPositionControl.centerMapToCurrentPosition;

      const stationsInfoPromise = getBicingStationsGeoData().then(data => {
        map.data.addGeoJson(data);
        return data;
      });

      map.data.setStyle(feature => {
        if (feature.getProperty('shouldShowStatus')) {
          const availableMechanical = feature.getProperty('availableMechanical') || 0;
          const availableEbike = feature.getProperty('availableElectric') || 0;
          const availableBikes = availableMechanical + availableEbike;
          const capacity = feature.getProperty('capacity') || 0;
          // Real average capacity is 27.5 but 10 is a reasonably high number
          const halfOfAverageCapacity = 10;

          const dec = availableBikes / capacity;

          const roundToOneDecimal = (number: number, min: number, max: number) =>
            Math.min(Math.max(Math.round((number + Number.EPSILON) * 10) / 10, min), max);

          // For better visibility, if there are bikes available the minimum fill is 0.2
          // and if it's not completely full the max is 0.9.
          const getAvailableTotal = () => {
            if (dec === 0) {
              return 0;
            }
            if (dec > 0.9 && dec < 1) {
              return 0.9;
            }
            // Since 10 bikes is already a pretty high number of bikes, regardless of the actual station capacity,
            // we will show it at least half full. The other half of the fill depends on the stations capacity.
            if (availableBikes >= halfOfAverageCapacity) {
              const intuitiveFillPercentage =
                0.5 +
                ((availableBikes - halfOfAverageCapacity) / (capacity - halfOfAverageCapacity)) *
                  0.5;

              return roundToOneDecimal(intuitiveFillPercentage, 0.2, 1);
            }
            return roundToOneDecimal(dec, 0.2, 1);
          };

          return {
            icon: {
              url:
                'data:image/svg+xml;charset=UTF-8,' +
                encodeURIComponent(getBikeStationIcon(1 - getAvailableTotal())),
            },
          };
        }
        return {
          icon: {
            url: dotStation,
          },
        };
      });

      const nearStationsPromise: Promise<GeoJsonFeature[]> = Promise.all([
        stationsInfoPromise,
        currentPositionPromise,
      ]).then(([stationsInfoGeoJson, currentPosition]) => {
        const nearStations: Array<GeoJsonFeature> = [];

        if (!currentPosition) {
          return nearStations; // empty
        }

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

        return nearStations;
      });

      const stationsStatusesPromise = fetchBicingStationsStatus();

      Promise.all([nearStationsPromise, stationsStatusesPromise]).then(
        ([nearStations, stationStatuses]) => {
          const nearStationsCopy = [...nearStations];

          stationStatuses.data.stations.forEach(station => {
            const feature = map.data.getFeatureById(station.station_id);

            if (!feature) return;

            if (nearStationsCopy.length) {
              const nearStationIndex = nearStationsCopy?.findIndex(s => s.id === feature.getId());

              if (nearStationIndex > -1) {
                nearStationsCopy.splice(nearStationIndex, 1);
                feature.setProperty('shouldShowStatus', true);
              }
            }

            feature.setProperty(
              'availableMechanical',
              station.num_bikes_available_types.mechanical
            );
            feature.setProperty('availableElectric', station.num_bikes_available_types.ebike);
            feature.setProperty('availableDocks', station.num_docks_available);
          });
        }
      );
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
