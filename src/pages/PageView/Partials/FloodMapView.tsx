import { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import Polygon from '@arcgis/core/geometry/Polygon';

import { mockWards } from './mockData';
import {
  calcFloodRiskIndex,
  getRiskLevel,
  getRiskColor,
  getRiskOutlineColor,
  getRiskLevelLabel,
} from './floodRiskUtils';
import FloodMapLegend from './FloodMapLegend';
import WardDetailPanel from './WardDetailPanel';

interface FloodMapViewProps {
  selectedWard?: string;
  selectedRiskLevels?: string[];
  riskIndexRange?: [number, number];
  onFilteredCountChange?: (count: number) => void;
}

export default function FloodMapMock({
  selectedWard = '',
  selectedRiskLevels = ['cao', 'trungBinh', 'thap'],
  riskIndexRange = [0, 10],
  onFilteredCountChange,
}: FloodMapViewProps) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const wardLayerRef = useRef<GraphicsLayer | null>(null);
  const viewRef = useRef<MapView | null>(null);
  const initialCenter = useRef<[number, number]>([106.7, 10.78]);

  const getInitialZoom = () => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return parsed.mapDefaultZoom || 13;
      }
    } catch {
      // Ignore
    }
    return 13;
  };

  const initialZoom = useRef<number>(getInitialZoom());
  const [selectedWardDetail, setSelectedWardDetail] = useState<{
    ward_name: string;
    flood_risk: number;
    risk_level: string;
    population_density: number;
    rainfall: number;
    low_elevation: number;
    urban_land: number;
    drainage_capacity: number;
    exposure: number;
    susceptibility: number;
    resilience: number;
  } | null>(null);

  useEffect(() => {
    if (!mapDiv.current) return;

    const getMapSettings = () => {
      try {
        const savedSettings = localStorage.getItem('appSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          return {
            animation: parsed.mapAnimation !== false,
            zoom: parsed.mapDefaultZoom || 13,
          };
        }
      } catch {
        // Ignore
      }
      return {
        animation: true,
        zoom: 13,
      };
    };

    const mapSettings = getMapSettings();
    const map = new Map({ basemap: 'dark-gray-vector' });
    const view = new MapView({
      container: mapDiv.current,
      map,
      center: initialCenter.current,
      zoom: mapSettings.zoom,
      animationsEnabled: mapSettings.animation,
    });

    viewRef.current = view;

    const wardLayer = new GraphicsLayer({ title: 'Bản đồ rủi ro ngập lụt' });
    wardLayerRef.current = wardLayer;

    map.add(wardLayer);

    return () => {
      view.destroy();
    };
  }, []);

  useEffect(() => {
    if (!viewRef.current) return;

    const view = viewRef.current;
    let clickHandle: __esri.Handle | null = null;

    view
      .when(() => {
        const handleClick = async (event: __esri.ViewClickEvent) => {
          const layer = wardLayerRef.current;
          if (!layer) return;

          try {
            const response = await view.hitTest(event, { include: [layer] });

            if (response.results.length > 0) {
              const result = response.results[0];
              if ('graphic' in result && result.graphic) {
                const graphic = result.graphic;

                if (
                  graphic &&
                  graphic.geometry &&
                  graphic.attributes &&
                  graphic.attributes.ward_name
                ) {
                  const attributes = graphic.attributes;
                  const ward = mockWards.find((w) => w.ward_name === attributes.ward_name);

                  if (ward) {
                    if (view.popup) {
                      view.popup.close();
                    }

                    const exposure = ward.population_density / 1000 + ward.rainfall / 200;
                    const susceptibility = ward.low_elevation + ward.urban_land;
                    const resilience = ward.drainage_capacity || 1;
                    const floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
                    const riskLevel = getRiskLevel(floodRisk);
                    const levelLabel = getRiskLevelLabel(riskLevel);

                    setSelectedWardDetail({
                      ward_name: ward.ward_name,
                      flood_risk: floodRisk,
                      risk_level: levelLabel,
                      population_density: ward.population_density,
                      rainfall: ward.rainfall,
                      low_elevation: ward.low_elevation,
                      urban_land: ward.urban_land,
                      drainage_capacity: ward.drainage_capacity,
                      exposure: exposure,
                      susceptibility: susceptibility,
                      resilience: resilience,
                    });

                    view
                      .goTo({
                        target: graphic.geometry,
                        zoom: 15,
                      })
                      .catch(() => {});
                  }
                }
              }
            }
          } catch {
            // Silent fail
          }
        };

        clickHandle = view.on('click', handleClick);
      })
      .catch(() => {});

    return () => {
      if (clickHandle) {
        clickHandle.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!wardLayerRef.current) return;

    wardLayerRef.current.removeAll();

    const filteredWards = mockWards.filter((ward) => {
      const exposure = ward.population_density / 1000 + ward.rainfall / 200;
      const susceptibility = ward.low_elevation + ward.urban_land;
      const resilience = ward.drainage_capacity || 1;
      const floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
      const riskLevel = getRiskLevel(floodRisk);

      const matchesWard = !selectedWard || ward.ward_name === selectedWard;
      const matchesRiskLevel = selectedRiskLevels.includes(riskLevel);
      const matchesRiskIndex = floodRisk >= riskIndexRange[0] && floodRisk <= riskIndexRange[1];

      return matchesWard && matchesRiskLevel && matchesRiskIndex;
    });

    if (onFilteredCountChange) {
      onFilteredCountChange(filteredWards.length);
    }

    filteredWards.forEach((ward) => {
      const exposure = ward.population_density / 1000 + ward.rainfall / 200;
      const susceptibility = ward.low_elevation + ward.urban_land;
      const resilience = ward.drainage_capacity || 1;

      const floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
      const riskLevel = getRiskLevel(floodRisk);
      const color = getRiskColor(riskLevel);
      const outlineColor = getRiskOutlineColor(riskLevel);
      const levelLabel = getRiskLevelLabel(riskLevel);

      const polygon = new Polygon({
        rings: ward.geometry.rings,
        spatialReference: { wkid: 4326 },
      });

      const graphic = new Graphic({
        geometry: polygon,
        attributes: {
          ward_name: ward.ward_name,
          flood_risk: floodRisk,
          risk_level: levelLabel,
          population_density: ward.population_density,
          rainfall: ward.rainfall,
          low_elevation: ward.low_elevation,
          urban_land: ward.urban_land,
          drainage_capacity: ward.drainage_capacity,
          exposure: exposure,
          susceptibility: susceptibility,
          resilience: resilience,
        },
        symbol: {
          type: 'simple-fill',
          color,
          outline: {
            width: 0.8,
            color: outlineColor,
          },
        },
      });

      if (wardLayerRef.current) {
        wardLayerRef.current.add(graphic);
      }
    });
  }, [selectedWard, selectedRiskLevels, riskIndexRange, onFilteredCountChange]);

  return (
    <div className='relative w-full' style={{ height: '495px' }}>
      <div
        ref={mapDiv}
        className='absolute inset-0 w-full h-full'
        style={{ pointerEvents: 'auto' }}
      />
      <FloodMapLegend />
      {selectedWardDetail && (
        <WardDetailPanel
          ward={selectedWardDetail}
          onClose={() => {
            setSelectedWardDetail(null);
            if (viewRef.current) {
              viewRef.current
                .goTo({
                  center: initialCenter.current,
                  zoom: initialZoom.current,
                })
                .catch(() => {});
            }
          }}
        />
      )}
    </div>
  );
}
