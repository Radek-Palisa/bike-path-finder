import { get as idbGet, set as idbSet } from 'idb-keyval';
import sampleDataStationsInfo from './sampleData/sample-data-stations-info.json';
import sampleDataStationsStatus from './sampleData/sample-data-stations-status.json';
import { BicingApiStationsInfoResponse, GeoJsonFeatureCollection } from './types';

function getStationsInfoLastFetch() {
  return window.localStorage.getItem('stationsInfoLastFetch');
}

function setStationsInfoLastFetch(dateString: string = new Date().toString()) {
  return window.localStorage.setItem('stationsInfoLastFetch', dateString);
}

function idbSetStationsInfo(stationsInfo: GeoJsonFeatureCollection): Promise<void> {
  return idbSet('stationsInfo', stationsInfo).catch(() => {});
}

function idbGetStationsInfo(): Promise<GeoJsonFeatureCollection | undefined> {
  return idbGet('stationsInfo');
}

function isOlderThanDays(dateString: string, days: number) {
  const diff = new Date().getTime() - new Date(dateString).getTime();
  return diff > days * 24 * 60 * 60 * 1000;
}

function mapBicingStationsInfoToGeoJson(
  rawData: BicingApiStationsInfoResponse
): GeoJsonFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: rawData.data.stations.map(({ station_id, capacity, lat, lon }) => ({
      id: station_id,
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat],
      },
      properties: {
        capacity,
      },
    })),
  };
}

function fetchBicingStationsInfo(): Promise<BicingApiStationsInfoResponse> {
  // fetch('https://api.bsmsa.eu/ext/api/bsm/gbfs/v2/en/station_information').then(response =>
  //   response.json()
  // );
  return Promise.resolve(sampleDataStationsInfo as BicingApiStationsInfoResponse);
}

export function fetchBicingStationsStatus() {
  // return fetch('https://api.bsmsa.eu/ext/api/bsm/gbfs/v2/en/station_status').then(response =>
  //   response.json()
  // );
  return Promise.resolve(sampleDataStationsStatus);
}

export async function getBicingStationsGeoData(): Promise<GeoJsonFeatureCollection> {
  const stationsInfoLastFetch = getStationsInfoLastFetch();

  const currentStationsInfoPromise = idbGetStationsInfo();

  const shouldFetchFreshData = stationsInfoLastFetch
    ? isOlderThanDays(stationsInfoLastFetch, 7)
    : true;

  if (!shouldFetchFreshData) {
    const currentStationsInfo = await currentStationsInfoPromise;

    if (currentStationsInfo) {
      return currentStationsInfo;
    }
  }

  const bicingStationsData = await fetchBicingStationsInfo();

  const mappedData = mapBicingStationsInfoToGeoJson(bicingStationsData);

  idbSetStationsInfo(mappedData);

  setStationsInfoLastFetch();

  return mappedData;
}
