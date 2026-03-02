import { useQuery } from "@tanstack/react-query";
import { riskAssessmentService } from "../services/riskAssessmentService";
import type { WardData } from "../types/ward";

function transformGeoJSONToWards(
  geojson: Awaited<ReturnType<typeof riskAssessmentService.getFloodRiskGeoJSON>>
): WardData[] {
  if (!geojson?.features?.length) return [];

  return geojson.features.map((f) => {
    const props = f.properties || {};
    return {
      _id: props.id,
      ward_name: props.name || "",
      geometry: f.geometry
        ? { type: f.geometry.type, coordinates: f.geometry.coordinates }
        : { type: "Polygon" as const, coordinates: [] },
      population_density: 0,
      rainfall: 0,
      low_elevation: 0,
      urban_land: 0,
      drainage_capacity: 1,
      flood_risk: props.total_score ?? undefined,
      risk_level: props.risk_level || "Chưa có dữ liệu",
    };
  });
}

export interface UseMapWardsParams {
  year?: number;
}

export function useMapWards(params?: UseMapWardsParams) {
  const year = params?.year ?? new Date().getFullYear();

  return useQuery({
    queryKey: ["map-wards", year],
    queryFn: async () => {
      const geojson = await riskAssessmentService.getFloodRiskGeoJSON(year);
      return { wards: transformGeoJSONToWards(geojson) };
    },
    staleTime: 2 * 60 * 1000,
  });
}
