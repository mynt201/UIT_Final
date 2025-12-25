import { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Legend from '@arcgis/core/widgets/Legend';
import LayerList from '@arcgis/core/widgets/LayerList';
import { calcFloodRiskIndex } from './constants';

export default function FloodMap() {
  const mapDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapDiv.current) return;

    /* ================= MAP ================= */

    const map = new Map({
      basemap: 'dark-gray-vector',
    });

    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [106.7, 10.8], // TP.HCM
      zoom: 11,
    });

    /* ================= BASE DATA LAYERS ================= */

    const riverLayer = new FeatureLayer({
      url: 'RIVER_LAYER_URL',
      title: 'Sông rạch',
      opacity: 0.7,
    });

    const terrainLayer = new FeatureLayer({
      url: 'TERRAIN_LAYER_URL',
      title: 'Địa hình',
      visible: false,
    });

    const rainfallLayer = new FeatureLayer({
      url: 'RAINFALL_LAYER_URL',
      title: 'Lượng mưa',
      visible: false,
    });

    const populationLayer = new FeatureLayer({
      url: 'POPULATION_LAYER_URL',
      title: 'Dân số',
      visible: false,
    });

    /* ================= FLOOD RISK LAYER ================= */

    const wardLayer = new FeatureLayer({
      url: 'WARD_LAYER_URL',
      title: 'Bản đồ rủi ro ngập lụt',
      outFields: ['*'],
      popupTemplate: {
        title: '{ward_name}',
        content: `
          <b>Mật độ dân số:</b> {population_density}<br/>
          <b>Lượng mưa:</b> {rainfall}<br/>
          <b>Độ trũng:</b> {low_elevation}<br/>
          <b>Thoát nước:</b> {drainage_capacity}<br/>
          <hr/>
          <b>Flood Risk Index:</b> {flood_risk}
        `,
      },
    });

    /* ========== TÍNH RỦI RO TRỰC TIẾP ========== */

    wardLayer.when(async () => {
      const result = await wardLayer.queryFeatures();

      result.features.forEach((feature) => {
        const exposure =
          feature.attributes.population_density / 1000 + feature.attributes.rainfall / 200;

        const susceptibility = feature.attributes.low_elevation + feature.attributes.urban_land;

        const resilience = feature.attributes.drainage_capacity || 1;

        feature.attributes.flood_risk = calcFloodRiskIndex(exposure, susceptibility, resilience);
      });
    });

    /* ========== STYLE GIỐNG HÌNH BẠN GỬI ========== */

    wardLayer.renderer = {
      type: 'class-breaks',
      field: 'flood_risk',
      classBreakInfos: [
        {
          minValue: 0,
          maxValue: 0.4,
          label: 'Rủi ro thấp',
          symbol: {
            type: 'simple-fill',
            color: [180, 230, 220, 0.75],
            outline: { width: 0.2, color: [30, 30, 30, 0.3] },
          },
        },
        {
          minValue: 0.4,
          maxValue: 0.7,
          label: 'Rủi ro trung bình',
          symbol: {
            type: 'simple-fill',
            color: [255, 190, 190, 0.75],
            outline: { width: 0.2, color: [30, 30, 30, 0.3] },
          },
        },
        {
          minValue: 0.7,
          maxValue: 2,
          label: 'Rủi ro cao',
          symbol: {
            type: 'simple-fill',
            color: [220, 70, 70, 0.85],
            outline: { width: 0.2, color: [30, 30, 30, 0.3] },
          },
        },
      ],
    } as unknown;

    /* ================= ADD LAYERS ================= */

    map.addMany([terrainLayer, riverLayer, rainfallLayer, populationLayer, wardLayer]);

    /* ================= UI ================= */

    view.ui.add(new Legend({ view }), 'bottom-left');
    view.ui.add(new LayerList({ view }), 'top-right');

    return () => view.destroy();
  }, []);

  return <div ref={mapDiv} style={{ height: '700px', width: '100%' }} />;
}
