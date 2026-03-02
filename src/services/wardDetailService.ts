import { api } from "../plugins/axios";
import type { WardDetailFromDB } from "../types/ward";

export interface UnitDetailResponse {
  success: boolean;
  data: WardDetailFromDB;
}

/**
 * API lấy chi tiết phường: unit + assessment + indicator values
 * GET /map/unit/:id/detail?year=2024
 */
export async function fetchWardDetail(
  unitId: string,
  year: number
): Promise<WardDetailFromDB | null> {
  try {
    const res = await api.get<UnitDetailResponse>(
      `/map/unit/${unitId}/detail`,
      { params: { year } }
    );
    if (res.data?.success && res.data?.data) {
      return res.data.data;
    }
    return null;
  } catch {
    return null;
  }
}
