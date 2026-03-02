import { IoMdClose } from "react-icons/io";
import { getRiskColor } from "./floodRiskUtils";
import { useTheme } from "../../../contexts/ThemeContext";
import { formatNumber } from "../../../utils/formatUtils";
import type { WardDetailFromDB } from "../../../types/ward";

interface WardDetailPanelProps {
  ward: WardDetailFromDB | null;
  loading?: boolean;
  onClose: () => void;
}

function riskLevelToKey(level: string): "cao" | "trungBinh" | "thap" {
  const l = level?.trim?.() ?? "";
  if (l === "Rất cao" || l === "Cao") return "cao";
  if (l === "Trung bình") return "trungBinh";
  return "thap";
}

export default function WardDetailPanel({
  ward,
  loading = false,
  onClose,
}: WardDetailPanelProps) {
  const { theme } = useTheme();

  if (!ward && !loading) return null;

  const riskKey = ward ? riskLevelToKey(ward.risk_level) : "thap";
  const color = getRiskColor(riskKey);
  const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  return (
    <div
      className="absolute bottom-4 left-4 right-4 bg-[#0a1628] rounded-xl shadow-2xl overflow-hidden"
      style={{ zIndex: 9999 }}
    >
      <div className="px-6 pt-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-white">
            {loading ? "Đang tải..." : ward?.name ?? "—"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
          >
            <IoMdClose size={24} className="text-white" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-400" />
          </div>
        ) : ward ? (
          <>
            {/* AdministrativeUnit + RiskAssessment - đúng cột DB */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-3 text-left">
                <div className="text-white/80 text-sm">
                  <span className="opacity-60">Tên đơn vị (name):</span>{" "}
                  <span className="font-semibold text-white">{ward.name}</span>
                </div>
                <div className="text-white/80 text-sm">
                  <span className="opacity-60">Diện tích (area_km2):</span>{" "}
                  <span className="font-semibold text-white">
                    {formatNumber(ward.area_km2)} km²
                  </span>
                </div>
                <div className="text-white/80 text-sm">
                  <span className="opacity-60">Tổng điểm (total_score):</span>{" "}
                  <span className="font-semibold text-white">
                    {Number(ward.total_score ?? 0).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2 text-white/80 text-sm">
                  <span className="opacity-60">Mức độ (risk_level):</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-4 rounded border border-white/30"
                      style={{ backgroundColor: rgbColor }}
                    />
                    <span className="font-semibold text-white">
                      {ward.risk_level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* IndicatorValue - từng chỉ số theo DB */}
            {ward.indicator_values.length > 0 && (
              <div className="border-t border-white/20 pt-4">
                <div className="text-white/90 text-sm font-medium mb-3">
                  Giá trị chỉ số (IndicatorValue)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ward.indicator_values.map((iv) => (
                    <div
                      key={iv.indicator_code}
                      className="bg-white/5 rounded-lg p-3 text-left"
                    >
                      <div className="text-white/70 text-xs mb-1">
                        {iv.indicator_name}
                        {iv.indicator_code && (
                          <span className="opacity-80"> ({iv.indicator_code})</span>
                        )}
                      </div>
                      <div className="text-white font-semibold">
                        raw_value: {formatNumber(iv.raw_value)}
                        {iv.unit ? ` ${iv.unit}` : ""}
                      </div>
                      <div className="text-white/60 text-xs mt-0.5">
                        normalized_value: {Number(iv.normalized_value ?? 0).toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ward.indicator_values.length === 0 && (
              <div className="text-white/50 text-sm py-4">
                Chưa có dữ liệu IndicatorValue cho đơn vị này.
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
