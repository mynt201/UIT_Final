// services/gis.service.ts
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

export const layers = {
  terrain: new FeatureLayer({ url: 'TERRAIN_URL' }),
  rivers: new FeatureLayer({ url: 'RIVER_URL' }),
  rainfall: new FeatureLayer({ url: 'RAINFALL_URL' }),
  population: new FeatureLayer({ url: 'POPULATION_URL' }),
  landuse: new FeatureLayer({ url: 'LANDUSE_URL' }),
};
