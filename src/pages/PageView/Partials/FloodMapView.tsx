import { useEffect, useRef, useState } from 'react';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import TileLayer from '@arcgis/core/layers/TileLayer';
import Polygon from '@arcgis/core/geometry/Polygon';

import { useWards } from '../../../hooks/useWards';
import {
  calcFloodRiskIndex,
  getRiskLevel,
  getRiskColor,
  getRiskOutlineColor,
  getRiskLevelLabel,
} from './floodRiskUtils';
import FloodMapLegend from './FloodMapLegend';
import WardDetailPanel from './WardDetailPanel';
import type { WardData } from '../../../types/ward';

// Hàm convert GeoJSON MultiPolygon/Polygon sang ArcGIS Polygon rings
const convertGeoJSONToRings = (geometry: WardData['geometry']): number[][][] => {
  // Nếu đã có rings (format cũ), trả về luôn
  if (geometry.rings) {
    return geometry.rings;
  }

  // Nếu có coordinates (GeoJSON format)
  if (geometry.coordinates) {
    const coords = geometry.coordinates;
    
    // MultiPolygon: coordinates là number[][][][]
    if (geometry.type === 'MultiPolygon' && Array.isArray(coords) && coords.length > 0) {
      // Lấy polygon đầu tiên
      const firstPolygon = coords[0] as number[][][];
      if (Array.isArray(firstPolygon) && firstPolygon.length > 0) {
        // Convert từ GeoJSON [lng, lat] sang rings format
        return firstPolygon.map(ring => 
          ring.map(point => [point[0], point[1]]) // [lng, lat]
        );
      }
    }
    
    // Polygon: coordinates là number[][][]
    if (geometry.type === 'Polygon' && Array.isArray(coords) && coords.length > 0) {
      return coords.map(ring => 
        ring.map(point => [point[0], point[1]]) // [lng, lat]
      );
    }
  }

  // Fallback: trả về mảng rỗng
  return [];
};

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

  // Use React Query to fetch ward data
  const { data: wardsResponse, isLoading, error: wardsError } = useWards({ limit: 100 });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const wards = wardsResponse?.wards || [];
  const error = wardsError?.message || null;

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
      basemap: 'gray-vector', // Basemap sáng hơn để giống với hình ảnh
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
      opacity: 0.85, // Tăng opacity một chút để màu rõ hơn
    });
    wardLayerRef.current = wardLayer;

    map.add(wardLayer);

    return () => {
      view.destroy();
    };
  }, [isLoading, showBuildings, showRoads]);

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
                  
                  // Sử dụng popup content đã được tính toán sẵn từ attributes
                  const popupContent = attributes.popup_content;
                  
                  if (popupContent) {
                    // Mở popup ngay lập tức với content đã có sẵn
                    view.popup.open({
                      title: '',
                      content: popupContent,
                      location: event.mapPoint,
                      features: [graphic],
                    });

                    // Set state cho WardDetailPanel với dữ liệu từ attributes
                    setSelectedWardDetail({
                      ward_name: attributes.ward_name,
                      flood_risk: attributes.flood_risk,
                      risk_level: attributes.risk_level,
                      population_density: attributes.population_density,
                      rainfall: attributes.rainfall,
                      low_elevation: attributes.low_elevation,
                      urban_land: attributes.urban_land,
                      drainage_capacity: attributes.drainage_capacity,
                      exposure: attributes.exposure,
                      susceptibility: attributes.susceptibility,
                      resilience: attributes.resilience,
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
  }, [wards]);

  useEffect(() => {
    if (!wardLayerRef.current || wards.length === 0) return;

    wardLayerRef.current.removeAll();

    const filteredWards = wards.filter((ward) => {
      // Tính toán flood_risk nếu chưa có trong database
      let floodRisk: number;
      if (ward.flood_risk !== undefined) {
        floodRisk = ward.flood_risk;
      } else {
        const exposure = ward.population_density / 1000 + ward.rainfall / 200;
        const susceptibility = ward.low_elevation + ward.urban_land;
        const resilience = ward.drainage_capacity || 1;
        floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
      }

      // Filter by risk index range
      const matchesRiskIndex = floodRisk >= riskIndexRange[0] && floodRisk <= riskIndexRange[1];

      // Kiểm tra geometry hợp lệ
      const rings = convertGeoJSONToRings(ward.geometry);
      const hasValidGeometry = rings && rings.length > 0;

      return matchesRiskIndex && hasValidGeometry;
    });

    if (onFilteredCountChange) {
      onFilteredCountChange(filteredWards.length);
    }

    filteredWards.forEach((ward) => {
      const exposure = ward.population_density / 1000 + ward.rainfall / 200;
      const susceptibility = ward.low_elevation + ward.urban_land;
      const resilience = ward.drainage_capacity || 1;

      // Sử dụng flood_risk từ database nếu có, nếu không thì tính toán
      const floodRisk = ward.flood_risk !== undefined 
        ? ward.flood_risk 
        : calcFloodRiskIndex(exposure, susceptibility, resilience);
      const riskLevel = getRiskLevel(floodRisk);
      const color = getRiskColor(riskLevel);
      const outlineColor = getRiskOutlineColor(riskLevel);
      const levelLabel = getRiskLevelLabel(riskLevel);
      const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

      // Convert geometry từ GeoJSON sang ArcGIS format
      const rings = convertGeoJSONToRings(ward.geometry);
      
      // Bỏ qua nếu không có rings hợp lệ
      if (!rings || rings.length === 0) {
        console.warn(`Ward ${ward.ward_name} has no valid geometry`);
        return;
      }

      const polygon = new Polygon({
        rings: rings,
        spatialReference: { wkid: 4326 },
      });

      // Tạo popup content sẵn để không phải tính lại mỗi lần click
      const popupContent = `
        <div style="min-width: 300px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="margin-bottom: 16px;">
            <h2 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 600; color: #1f2937;">
              ${ward.ward_name}
            </h2>
            ${ward.district ? `<p style="margin: 0; color: #6b7280; font-size: 14px;">${ward.district}</p>` : ''}
          </div>
          
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding: 12px; background: #f9fafb; border-radius: 8px;">
            <div style="width: 24px; height: 16px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); background: ${rgbColor};"></div>
            <div>
              <div style="font-size: 12px; color: #6b7280;">Mức độ rủi ro</div>
              <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${levelLabel}</div>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Chỉ số rủi ro</div>
              <div style="font-size: 18px; font-weight: 600; color: #1f2937;">${floodRisk.toFixed(2)}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">Mật độ dân số</div>
              <div style="font-size: 18px; font-weight: 600; color: #1f2937;">${ward.population_density.toLocaleString('vi-VN')}</div>
            </div>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 13px;">
              <div>
                <span style="color: #6b7280;">Lượng mưa:</span>
                <span style="font-weight: 500; color: #1f2937; margin-left: 4px;">${ward.rainfall.toFixed(1)} mm</span>
              </div>
              <div>
                <span style="color: #6b7280;">Độ cao thấp:</span>
                <span style="font-weight: 500; color: #1f2937; margin-left: 4px;">${ward.low_elevation.toFixed(1)} m</span>
              </div>
              <div>
                <span style="color: #6b7280;">Đất đô thị:</span>
                <span style="font-weight: 500; color: #1f2937; margin-left: 4px;">${ward.urban_land.toFixed(1)}%</span>
              </div>
              <div>
                <span style="color: #6b7280;">Khả năng thoát nước:</span>
                <span style="font-weight: 500; color: #1f2937; margin-left: 4px;">${ward.drainage_capacity.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">
            <div style="font-size: 12px; color: #6b7280; margin-bottom: 6px;">Chỉ số thành phần:</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 12px;">
              <div>
                <span style="color: #6b7280;">Exposure:</span>
                <span style="font-weight: 500; color: #1f2937; margin-left: 4px;">${exposure.toFixed(2)}</span>
              </div>
              <div>
                <span style="color: #6b7280;">Susceptibility:</span>
                <span style="font-weight: 500; color: #1f2937; margin-left: 4px;">${susceptibility.toFixed(2)}</span>
              </div>
              <div>
                <span style="color: #6b7280;">Resilience:</span>
                <span style="font-weight: 500; color: #1f2937; margin-left: 4px;">${resilience.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      `;

      const graphic = new Graphic({
        geometry: polygon,
        attributes: {
          ward_name: ward.ward_name,
          flood_risk: floodRisk,
          risk_level: levelLabel,
          risk_level_key: riskLevel,
          population_density: ward.population_density,
          rainfall: ward.rainfall,
          low_elevation: ward.low_elevation,
          urban_land: ward.urban_land,
          drainage_capacity: ward.drainage_capacity,
          exposure: exposure,
          susceptibility: susceptibility,
          resilience: resilience,
          district: ward.district || '',
          popup_content: popupContent, // Lưu popup content sẵn
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
  }, [selectedWard, selectedRiskLevels, riskIndexRange, onFilteredCountChange, wards]);

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
