import { useTranslation } from "react-i18next";
import { IoMdClose } from "react-icons/io";
import { getRiskColor, type RiskLevelKey } from "./floodRiskUtils";
import { formatNumber } from "../../../utils/formatUtils";
import type { WardDetailFromDB } from "../../../types/ward";

interface WardDetailPanelProps {
  ward: WardDetailFromDB | null;
  loading?: boolean;
  onClose: () => void;
}

function riskLevelToKey(level: string): RiskLevelKey {
  const l = level?.trim?.() ?? "";
  if (l === "Rất cao" || l === "Cao") return "cao";
  if (l === "Trung bình") return "trungBinh";
  if (l === "Chưa có dữ liệu") return null;
  return "thap";
}

export default function WardDetailPanel({
  ward,
  loading = false,
  onClose,
}: WardDetailPanelProps) {
  const { t } = useTranslation();
  if (!ward && !loading) return null;

  const riskKey = ward ? riskLevelToKey(ward.risk_level) : "thap";
  const color = getRiskColor(riskKey);
  const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  return (
    <div
      className="absolute w-full max-w-2xl bottom-4 left-4 right-4 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200"
      style={{ zIndex: 9999 }}
    >
      <div className="px-6 pt-4 pb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-black">
            {loading
              ? `${t("pageView.detail.loadingWard")} ${ward?.name ? ward.name + "..." : "..."}`
              : (ward?.name ?? "—")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full transition-colors"
          >
            <IoMdClose size={24} className="text-black" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
            </div>
            {ward?.name && (
              <p className="text-center text-gray-500 text-sm">
                {t("pageView.detail.loadingDetail")}
              </p>
            )}
          </div>
        ) : ward ? (
          <>
            {/* AdministrativeUnit + RiskAssessment - đúng cột DB */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-3 text-left">
                <div className="text-gray-700 text-sm">
                  <span className="text-gray-500">{t("pageView.detail.wardName")}</span>{" "}
                  <span className="font-semibold text-black">{ward.name}</span>
                </div>
                <div className="text-gray-700 text-sm">
                  <span className="text-gray-500">{t("pageView.detail.area")}</span>{" "}
                  <span className="font-semibold text-black">
                    {formatNumber(ward.area_km2)} km²
                  </span>
                </div>
                <div className="text-gray-700 text-sm">
                  <span className="text-gray-500">{t("pageView.detail.totalScore")}</span>{" "}
                  <span className="font-semibold text-black">
                    {ward.total_score != null
                      ? formatNumber(ward.total_score, 2)
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <span className="text-gray-500">{t("pageView.detail.riskLevel")}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: rgbColor }}
                    />
                    <span className="font-semibold text-black">
                      {ward.risk_level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* IndicatorValue - từng chỉ số theo DB */}
            {ward.indicator_values.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <div className="text-gray-800 text-sm font-medium mb-3">
                  {t("pageView.detail.indicatorValues")}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {ward.indicator_values.map((iv) => (
                    <div
                      key={iv.indicator_code}
                      className="bg-gray-100 rounded-lg p-3 text-left min-w-0 overflow-hidden"
                    >
                      <div className="text-gray-600 text-xs mb-1 break-words overflow-hidden min-w-0">
                        {iv.indicator_name}
                        {iv.indicator_code && (
                          <span className="text-gray-500">
                            {" "}
                            ({iv.indicator_code})
                          </span>
                        )}
                      </div>
                      <div className="text-black font-semibold break-words overflow-hidden min-w-0">
                        {formatNumber(iv.raw_value)}
                        {iv.unit ? ` ${iv.unit}` : ""}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5 break-words overflow-hidden min-w-0">
                        {t("pageView.detail.normalizedValue")}{" "}
                        {formatNumber(iv.normalized_value, 4)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {ward.indicator_values.length === 0 && (
              <div className="text-gray-500 text-sm py-4">
                {t("pageView.detail.noIndicatorData")}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
