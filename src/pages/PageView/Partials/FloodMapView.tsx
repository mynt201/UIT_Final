import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import Polygon from "@arcgis/core/geometry/Polygon";
import SimpleFillSymbol from "@arcgis/core/symbols/SimpleFillSymbol";

import i18n from "../../../i18n";
import { useMapWards } from "../../../hooks/useMapWards";
import { useSettings } from "../../../contexts/SettingsContext";
import {
  calcFloodRiskIndex,
  getRiskLevel,
  getRiskColor,
  getRiskOutlineColor,
  getRiskLevelLabel,
  getRiskColorFromBackend,
  getRiskOutlineColorFromBackend,
  type RiskLevelKey,
} from "./floodRiskUtils";
import FloodMapLegend from "./FloodMapLegend";
import WardDetailPanel from "./WardDetailPanel";
import { fetchWardDetail } from "../../../services/wardDetailService";
import type { WardData } from "../../../types/ward";
import type { WardDetailFromDB } from "../../../types/ward";

const convertGeoJSONToRings = (
  geometry: WardData["geometry"],
): number[][][] => {
  if (geometry.rings) {
    return geometry.rings;
  }

  if (geometry.coordinates) {
    const coords = geometry.coordinates;

    if (
      geometry.type === "MultiPolygon" &&
      Array.isArray(coords) &&
      coords.length > 0
    ) {
      const firstPolygon = coords[0] as number[][][];
      if (Array.isArray(firstPolygon) && firstPolygon.length > 0) {
        return firstPolygon.map((ring) =>
          ring.map((point) => [point[0], point[1]] as [number, number]),
        );
      }
    }

    // Polygon: coordinates là number[][][]
    if (
      geometry.type === "Polygon" &&
      Array.isArray(coords) &&
      coords.length > 0
    ) {
      const polygonCoords = coords as number[][][];
      return polygonCoords.map((ring) =>
        ring.map((point) => [point[0], point[1]] as [number, number]),
      );
    }
  }

  // Fallback: trả về mảng rỗng
  return [];
};

function backendLevelToInternal(
  backendLevel: string | undefined,
  floodRisk: number,
): RiskLevelKey {
  const l = backendLevel?.trim?.() ?? "";
  if (l === "Rất cao" || l === "Cao") return "cao";
  if (l === "Trung bình") return "trungBinh";
  if (l === "Thấp" || l === "Rất thấp") return "thap";
  if (l === "Chưa có dữ liệu") return null;
  return getRiskLevel(floodRisk);
}

interface FloodMapViewProps {
  year?: number;
  selectedRiskLevels?: string[];
}

export default function FloodMapView({
  year = new Date().getFullYear(),
  selectedRiskLevels = ["cao", "trungBinh", "thap"],
}: FloodMapViewProps) {
  const { t } = useTranslation();
  const mapDiv = useRef<HTMLDivElement>(null);
  const wardLayerRef = useRef<GraphicsLayer | null>(null);
  const roadsLayerRef = useRef<TileLayer | null>(null);
  const buildingsLayerRef = useRef<FeatureLayer | null>(null);
  const viewRef = useRef<MapView | null>(null);
  const initialCenter = useRef<[number, number]>([106.7, 10.78]);
  const { settings } = useSettings();
  const mapZoom = settings.mapDefaultZoom ?? 13;
  const mapAnimation = settings.mapAnimation ?? true;

  const initialZoom = useRef<number>(mapZoom);

  // Fetch phường từ API map/flood-risk (GeoJSON: id, name, total_score, risk_level), filter theo năm
  const {
    data: wardsResponse,
    isLoading,
    error: wardsError,
  } = useMapWards({ year });

  const wards = wardsResponse?.wards || [];
  const error = wardsError?.message || null;

  const [showRoads, setShowRoads] = useState<boolean>(false);
  const [showBuildings, setShowBuildings] = useState<boolean>(false);
  const [selectedWardDetail, setSelectedWardDetail] =
    useState<WardDetailFromDB | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

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

    const mapSettings = {
      animation: mapAnimation,
      zoom: mapZoom,
    };

    // Create additional layers for better map visualization (i18n.t for initial so effect doesn't depend on t)
    const roadsLayer = new TileLayer({
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer",
      title: i18n.t("pageView.layerRoads"),
      visible: showRoads,
    });

    const buildingsLayer = new FeatureLayer({
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/World_Administrative_Divisions/FeatureServer/0",
      title: i18n.t("pageView.layerAdmin"),
      visible: showBuildings,
      opacity: 0.3,
    });

    roadsLayerRef.current = roadsLayer;
    buildingsLayerRef.current = buildingsLayer;

    const map = new Map({
      basemap: "gray-vector",
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
      title: i18n.t("pageView.layerFloodRisk"),
      opacity: 0.85,
    });
    wardLayerRef.current = wardLayer;

    map.add(wardLayer);

    return () => {
      view.destroy();
    };
  }, [isLoading, showBuildings, showRoads, mapZoom, mapAnimation]);

  // Update layer titles when language changes (avoid recreating whole map)
  useEffect(() => {
    if (roadsLayerRef.current) roadsLayerRef.current.title = i18n.t("pageView.layerRoads");
    if (buildingsLayerRef.current) buildingsLayerRef.current.title = i18n.t("pageView.layerAdmin");
    if (wardLayerRef.current) wardLayerRef.current.title = i18n.t("pageView.layerFloodRisk");
    // i18n.language changes when user switches language; useTranslation() triggers re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

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
              if ("graphic" in result && result.graphic) {
                const graphic = result.graphic;

                if (
                  graphic &&
                  graphic.geometry &&
                  graphic.attributes &&
                  graphic.attributes.ward_name
                ) {
                  const attributes = graphic.attributes;
                  const unitId = attributes.unit_id as string;
                  const wardName = attributes.ward_name as string;
                  const totalScore = attributes.flood_risk as number;
                  const riskLevel = attributes.risk_level as string;
                  const popupContent = attributes.popup_content as string;

                  if (popupContent) {
                    view.popup?.open({
                      title: "",
                      content: popupContent,
                      location: event.mapPoint,
                      features: [graphic],
                    });
                  }

                  setDetailLoading(true);
                  setSelectedWardDetail({
                    unit_id: unitId ?? "",
                    name: wardName,
                    area_km2: 0,
                    total_score: totalScore ?? 0,
                    risk_level: riskLevel,
                    indicator_values: [],
                  });
                  setSelectedUnitId(unitId);
                  const detail = unitId
                    ? await fetchWardDetail(unitId, year)
                    : null;
                  setSelectedWardDetail(
                    detail ?? {
                      unit_id: unitId ?? "",
                      name: wardName,
                      area_km2: 0,
                      total_score: totalScore ?? 0,
                      risk_level: riskLevel,
                      indicator_values: [],
                    },
                  );
                  setDetailLoading(false);
                }
              }
            }
          } catch {
            setDetailLoading(false);
          }
        };

        clickHandle = view.on("click", handleClick);
      })
      .catch(() => {});

    return () => {
      if (clickHandle) {
        clickHandle.remove();
      }
    };
  }, [wards, year]);

  useEffect(() => {
    if (!wardLayerRef.current || wards.length === 0) return;

    wardLayerRef.current.removeAll();

    const filteredWards = wards.filter((ward) => {
      const internalLevel = backendLevelToInternal(
        ward.risk_level as string | undefined,
        ward.flood_risk ?? 0,
      );
      const matchesRiskLevel =
        internalLevel != null && selectedRiskLevels.includes(internalLevel);

      const rings = convertGeoJSONToRings(ward.geometry);
      const hasValidGeometry = rings && rings.length > 0;

      return matchesRiskLevel && hasValidGeometry;
    });

    filteredWards.forEach((ward) => {
      const exposure = ward.population_density / 1000 + ward.rainfall / 200;
      const susceptibility = ward.low_elevation + ward.urban_land;
      const resilience = ward.drainage_capacity || 1;

      // Sử dụng flood_risk từ database nếu có, nếu không thì tính toán
      const hasData = ward.risk_level !== "Chưa có dữ liệu";
      const floodRisk =
        hasData && ward.flood_risk != null
          ? ward.flood_risk
          : hasData
            ? calcFloodRiskIndex(exposure, susceptibility, resilience)
            : null;
      const riskLevel = backendLevelToInternal(
        ward.risk_level as string | undefined,
        floodRisk ?? 0,
      );
      const backendLevel = ward.risk_level as string | undefined;
      const color = backendLevel
        ? getRiskColorFromBackend(backendLevel)
        : getRiskColor(riskLevel);
      const outlineColor = backendLevel
        ? getRiskOutlineColorFromBackend(backendLevel)
        : getRiskOutlineColor(riskLevel);
      const levelLabel = backendLevel || getRiskLevelLabel(riskLevel);
      const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

      // Convert geometry từ GeoJSON sang ArcGIS format
      const rings = convertGeoJSONToRings(ward.geometry);

      if (!rings || rings.length === 0) {
        console.warn(`Ward ${ward.ward_name} has no valid geometry`);
        return;
      }

      const polygon = new Polygon({
        rings: rings,
        spatialReference: { wkid: 4326 },
      });

      const riskLevelLabel = t("pageView.riskLevelLabel");
      const totalScoreLabel = t("pageView.totalScoreLabel");
      const clickForDetail = t("pageView.clickForDetail");
      const popupContent = `
        <div style="min-width: 260px; font-family: 'Be Vietnam Pro', 'Montserrat', 'Segoe UI', system-ui, sans-serif;">
          <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #1f2937;">${ward.ward_name}</h2>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding: 12px; background: #f9fafb; border-radius: 8px;">
            <div style="width: 24px; height: 16px; border-radius: 4px; border: 1px solid rgba(0,0,0,0.1); background: ${rgbColor};"></div>
            <div>
              <div style="font-size: 12px; color: #6b7280;">${riskLevelLabel}</div>
              <div style="font-size: 16px; font-weight: 600; color: #1f2937;">${levelLabel}</div>
            </div>
          </div>
          <div style="font-size: 13px;">
            <span style="color: #6b7280;">${totalScoreLabel}</span>
            <span style="font-weight: 600; color: #1f2937; margin-left: 6px;">${floodRisk != null ? Number(floodRisk).toFixed(2) : "—"}</span>
          </div>
          <div style="font-size: 11px; color: #9ca3af; margin-top: 8px;">${clickForDetail}</div>
        </div>
      `;

      const graphic = new Graphic({
        geometry: polygon,
        attributes: {
          unit_id: ward._id ?? "",
          ward_name: ward.ward_name,
          flood_risk: floodRisk,
          risk_level: levelLabel,
          risk_level_key: riskLevel,
          _outlineColor: outlineColor,
          population_density: ward.population_density,
          rainfall: ward.rainfall,
          low_elevation: ward.low_elevation,
          urban_land: ward.urban_land,
          drainage_capacity: ward.drainage_capacity,
          exposure: exposure,
          susceptibility: susceptibility,
          resilience: resilience,
          district: ward.district || "",
          popup_content: popupContent,
        },
        symbol: {
          type: "simple-fill",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- i18n.language: re-run when language changes (useTranslation re-renders)
  }, [selectedRiskLevels, wards, t, i18n.language]);

  useEffect(() => {
    const layer = wardLayerRef.current;
    if (!layer || layer.graphics.length === 0) return;

    layer.graphics.forEach((graphic) => {
      if (!graphic.symbol || graphic.symbol.type !== "simple-fill") return;
      const uid = graphic.attributes?.unit_id as string | undefined;
      const stored = graphic.attributes?._outlineColor as number[] | undefined;
      const fillColor = (graphic.symbol as __esri.SimpleFillSymbol).color;

      const isSelected = uid === selectedUnitId;
      graphic.symbol = new SimpleFillSymbol({
        color: fillColor,
        outline: {
          width: isSelected ? 3 : 0.8,
          color: isSelected ? [0, 112, 255, 1] : (stored ?? [0, 0, 0, 0.5]),
        },
      });
    });
  }, [selectedUnitId, wards]);

  if (isLoading) {
    return (
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">{t("pageView.loadingMap")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ {error}</div>
          <p className="text-gray-600">{t("pageView.tryAgainMap")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex-1 min-h-[400px]">
      <div
        ref={mapDiv}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: "auto" }}
      />

      {/* Layer Controls */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <h4 className="text-sm font-semibold mb-2 text-gray-800">{t("pageView.layerTitle")}</h4>
        <div className="space-y-2">
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showRoads}
              onChange={(e) => setShowRoads(e.target.checked)}
              className="mr-2"
            />
            {t("pageView.layerRoads")}
          </label>
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showBuildings}
              onChange={(e) => setShowBuildings(e.target.checked)}
              className="mr-2"
            />
            {t("pageView.layerAdmin")}
          </label>
        </div>
      </div>

      <FloodMapLegend />
      {(selectedWardDetail || detailLoading) && (
        <WardDetailPanel
          ward={selectedWardDetail}
          loading={detailLoading}
          onClose={() => {
            setSelectedUnitId(null);
            setSelectedWardDetail(null);
            setDetailLoading(false);
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
