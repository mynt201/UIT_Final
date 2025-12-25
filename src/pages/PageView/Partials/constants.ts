import { useEffect, useRef } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Legend from '@arcgis/core/widgets/Legend';
import LayerList from '@arcgis/core/widgets/LayerList';

// Hàm giả lập tính flood risk
const calcFloodRiskIndex = (exposure: number, susceptibility: number, resilience: number) => {
  return (exposure + susceptibility) / resilience;
};

// Dữ liệu phường giả lập
const mockWards = [
  {
    ward_name: 'Phường 1',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.7, 10.81],
          [106.71, 10.81],
          [106.71, 10.82],
          [106.7, 10.82],
          [106.7, 10.81],
        ],
      ],
    },
    population_density: 5000,
    rainfall: 120,
    low_elevation: 2,
    urban_land: 3,
    drainage_capacity: 5,
  },
  {
    ward_name: 'Phường 2',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.705, 10.805],
          [106.715, 10.805],
          [106.715, 10.815],
          [106.705, 10.815],
          [106.705, 10.805],
        ],
      ],
    },
    population_density: 8000,
    rainfall: 200,
    low_elevation: 4,
    urban_land: 5,
    drainage_capacity: 4,
  },
  {
    ward_name: 'Phường 3',
    geometry: {
      type: 'polygon',
      rings: [
        [
          [106.71, 10.8],
          [106.72, 10.8],
          [106.72, 10.81],
          [106.71, 10.81],
          [106.71, 10.8],
        ],
      ],
    },
    population_density: 3000,
    rainfall: 80,
    low_elevation: 1,
    urban_land: 2,
    drainage_capacity: 6,
  },
];

export default function FloodMapMock() {
  const mapDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapDiv.current) return;

    const map = new Map({ basemap: 'dark-gray-vector' });
    const view = new MapView({
      container: mapDiv.current,
      map,
      center: [106.71, 10.805],
      zoom: 14,
    });

    // Layer chứa các phường
    const wardLayer = new GraphicsLayer({ title: 'Bản đồ rủi ro ngập lụt' });

    // Thêm từng phường
    mockWards.forEach((ward) => {
      const exposure = ward.population_density / 1000 + ward.rainfall / 200;
      const susceptibility = ward.low_elevation + ward.urban_land;
      const resilience = ward.drainage_capacity || 1;

      const floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
      const floodRiskColorScale = Math.min(1, floodRisk / 5); // scale 0→1 để màu

      // Màu đỏ gradient
      const color = [
        255,
        200 - 120 * floodRiskColorScale, // đỏ nhạt → đỏ đậm
        200 - 200 * floodRiskColorScale,
        0.5 + 0.4 * floodRiskColorScale, // alpha tăng theo rủi ro
      ];

      const graphic = new Graphic({
        geometry: ward.geometry,
        attributes: { ward_name: ward.ward_name, flood_risk: floodRisk },
        symbol: {
          type: 'simple-fill',
          color,
          outline: { width: 0.5, color: [100, 0, 0, 0.8] },
        },
        popupTemplate: {
          title: '{ward_name}',
          content: `
            <b>Flood Risk Index:</b> {flood_risk}
          `,
        },
      });

      wardLayer.add(graphic);
    });

    map.add(wardLayer);

    // UI
    view.ui.add(new Legend({ view }), 'bottom-left');
    view.ui.add(new LayerList({ view }), 'top-right');

    return () => view.destroy();
  }, []);

  return <div ref={mapDiv} style={{ height: '500px', width: '100%' }} />;
}
