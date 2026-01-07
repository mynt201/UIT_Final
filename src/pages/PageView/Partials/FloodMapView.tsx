import { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import Polygon from '@arcgis/core/geometry/Polygon';

import { wardService } from '../../../services/wardService';
import type { WardData } from '../../../types/ward';
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

export default function FloodMapView({
  selectedWard = '',
  selectedRiskLevels = ['cao', 'trungBinh', 'thap'],
  riskIndexRange = [0, 10],
  onFilteredCountChange,
}: FloodMapViewProps) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const wardLayerRef = useRef<GraphicsLayer | null>(null);
  const roadsLayerRef = useRef<TileLayer | null>(null);
  const buildingsLayerRef = useRef<FeatureLayer | null>(null);
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
  const [wards, setWards] = useState<WardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRoads, setShowRoads] = useState(false);
  const [showBuildings, setShowBuildings] = useState(false);
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

  // Fetch ward data from backend
  useEffect(() => {
    const fetchWards = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await wardService.getWards({ limit: 1000 }); // Get all wards
        setWards(response.wards);
      } catch (err) {
        console.error('Failed to fetch ward data:', err);
        setError('Không thể tải dữ liệu phường/xã. Sử dụng dữ liệu mẫu.');
        // Fallback to mock data if backend is not available
        try {
          const { mockWards } = await import('../../../mockData');
          setWards(mockWards);
        } catch (mockErr) {
          console.error('Failed to load mock data:', mockErr);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWards();
  }, []);

  // Handle roads layer visibility
  useEffect(() => {
    if (roadsLayerRef.current) {
      roadsLayerRef.current.visible = showRoads;
    }
  }, [showRoads]);

  // Handle buildings layer visibility
  useEffect(() => {
    if (buildingsLayerRef.current) {
      buildingsLayerRef.current.visible = showBuildings;
    }
  }, [showBuildings]);

  useEffect(() => {
    if (!mapDiv.current || isLoading) return;

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

    // Create additional layers for better map visualization
    const roadsLayer = new TileLayer({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer',
      title: 'Đường giao thông',
      visible: showRoads,
    });

    const buildingsLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Administrative_Divisions/FeatureServer/0',
      title: 'Khu vực hành chính',
      visible: showBuildings,
      opacity: 0.3,
    });

    roadsLayerRef.current = roadsLayer;
    buildingsLayerRef.current = buildingsLayer;

    const map = new Map({
      basemap: 'dark-gray-vector',
      layers: [roadsLayer, buildingsLayer],
    });

    const view = new MapView({
      container: mapDiv.current,
      map,
      center: initialCenter.current,
      zoom: mapSettings.zoom,
      animationsEnabled: mapSettings.animation,
    });

    viewRef.current = view;

    const wardLayer = new GraphicsLayer({
      title: 'Bản đồ rủi ro ngập lụt',
      opacity: 0.8,
    });
    wardLayerRef.current = wardLayer;

    map.add(wardLayer);

    return () => {
      view.destroy();
    };
  }, [isLoading]);

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
                  const ward = wards.find((w) => w.ward_name === attributes.ward_name);

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
    if (!wardLayerRef.current || wards.length === 0) return;

    wardLayerRef.current.removeAll();

    const filteredWards = wards.filter((ward) => {
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

  if (isLoading) {
    return (
      <div className='relative w-full flex items-center justify-center' style={{ height: '495px' }}>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Đang tải bản đồ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='relative w-full flex items-center justify-center' style={{ height: '495px' }}>
        <div className='text-center'>
          <div className='text-red-500 mb-4'>⚠️ {error}</div>
          <p className='text-gray-600'>Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='relative w-full' style={{ height: '495px' }}>
      <div
        ref={mapDiv}
        className='absolute inset-0 w-full h-full'
        style={{ pointerEvents: 'auto' }}
      />

      {/* Layer Controls */}
      <div className='absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg'>
        <h4 className='text-sm font-semibold mb-2 text-gray-800'>Lớp bản đồ</h4>
        <div className='space-y-2'>
          <label className='flex items-center text-sm'>
            <input
              type='checkbox'
              checked={showRoads}
              onChange={(e) => setShowRoads(e.target.checked)}
              className='mr-2'
            />
            Đường giao thông
          </label>
          <label className='flex items-center text-sm'>
            <input
              type='checkbox'
              checked={showBuildings}
              onChange={(e) => setShowBuildings(e.target.checked)}
              className='mr-2'
            />
            Khu vực hành chính
          </label>
        </div>
      </div>

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
