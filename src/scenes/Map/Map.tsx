import React, { useEffect, useRef, useState } from 'react';
import './Map.css';
import onLongPress from './services/onLongPress';
import ActionPanel from './components/ActionPanel/ActionalPanel';
import Button from './components/Button/Button';
import CurrentPositionControl from './components/CurrentPositionControl/CurrentPositionControl';
import { fetchBicingStationsStatus, getBicingStationsGeoData } from './services/bicingApi';
import { GeoJsonFeature } from './services/types';
import { ReactComponent as DirectionsIcon } from '../../assets/directions.svg';
import Typography from './components/Typography/Typography';
import getBikeStationIcon from './services/utils/getBikeStationIcon';
import getStationAvailability from './services/getStationAvailability/getStationAvailability';
import dotStation from '../../assets/dot-station.svg';
import useMap from './services/useMap';

export default function Map() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const marker = useRef<google.maps.Marker | null>(null);
  const centerMapToCurrentPosition = useRef(() => {});
  const [destination, setDestination] = useState<google.maps.LatLng | null>(null);
  const map = useMap(mapDivRef);

  useEffect(() => {
    if (!map) return;

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

        return {
          icon: {
            url:
              'data:image/svg+xml;charset=UTF-8,' +
              encodeURIComponent(
                getBikeStationIcon(getStationAvailability(availableBikes, capacity))
              ),
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
        const distance = google.maps.geometry.spherical.computeDistanceBetween(currentPosition, to);
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

          feature.setProperty('availableMechanical', station.num_bikes_available_types.mechanical);
          feature.setProperty('availableElectric', station.num_bikes_available_types.ebike);
          feature.setProperty('availableDocks', station.num_docks_available);
        });
      }
    );
  }, [map]);

  return (
    <div id="map-container">
      <div id="map" ref={mapDivRef}></div>
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
