import sampleDataStationsInfo from '../../../../sample-data-stations-info.json';
import sampleDataStationsStatus from '../../../../sample-data-stations-status.json';

export function fetchBicingStationsInfo() {
  // fetch('https://api.bsmsa.eu/ext/api/bsm/gbfs/v2/en/station_information').then(response =>
  //   response.json()
  // );
  return Promise.resolve(sampleDataStationsInfo);
}

export function fetchBicingStationsStatus() {
  // return fetch('https://api.bsmsa.eu/ext/api/bsm/gbfs/v2/en/station_status').then(response =>
  //   response.json()
  // );
  return Promise.resolve(sampleDataStationsStatus);
}
