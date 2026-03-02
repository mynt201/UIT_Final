import { administrativeUnitService } from "./administrativeUnitService";
import { indicatorValueService, type IndicatorValueRecord } from "./indicatorValueService";
import type { WardDetailFromDB } from "../types/ward";

/**
 * Lấy chi tiết đơn vị hành chính theo đúng cột trong DB:
 * - AdministrativeUnit: name, area_km2
 * - RiskAssessment: total_score, risk_level (từ map)
 * - IndicatorValue: raw_value, normalized_value theo từng indicator
 */
export async function fetchWardDetail(
  unitId: string,
  year: number,
  totalScore: number,
  riskLevel: string
): Promise<WardDetailFromDB | null> {
  try {
    const [unitRes, valuesRes] = await Promise.all([
      administrativeUnitService.getUnitById(unitId),
      indicatorValueService.getValues({ unit_id: unitId, year }),
    ]);

    if (!unitRes?.success || !unitRes.data) return null;

    const unit = unitRes.data;
    const values = (valuesRes?.data ?? []) as IndicatorValueRecord[];

    const indicator_values = values.map((v) => {
      const ind = typeof v.indicator_id === "object" ? v.indicator_id : null;
      const indObj = ind as { _id?: string; code?: string; name?: string; unit?: string; group_type?: string } | null;
      return {
        indicator_code: indObj?.code ?? "—",
        indicator_name: indObj?.name ?? "—",
        unit: indObj?.unit,
        group_type: indObj?.group_type,
        raw_value: v.raw_value ?? 0,
        normalized_value: v.normalized_value ?? 0,
      };
    });

    return {
      unit_id: unitId,
      name: unit.name,
      area_km2: unit.area_km2 ?? 0,
      total_score: totalScore,
      risk_level: riskLevel,
      indicator_values,
    };
  } catch {
    return null;
  }
}
