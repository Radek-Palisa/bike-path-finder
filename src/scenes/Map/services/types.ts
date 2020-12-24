export type GeoJsonFeature = {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [longitude: number, latitude: number];
  };
  properties: { [key: string]: any };
  /** id not part of GeoJson spec but works with google maps */
  id?: number;
};

export type GeoJsonFeatureCollection = {
  type: 'FeatureCollection';
  features: Array<GeoJsonFeature>;
};

export type BicingApiStationsInfoResponse = {
  last_updated: number;
  ttl: number;
  data: {
    stations: Array<{
      station_id: number;
      name: string;
      physical_configuration: string;
      lat: number;
      lon: number;
      altitude: number;
      address: string;
      post_code: string;
      capacity: number;
      nearby_distance: number;
    }>;
  };
};
