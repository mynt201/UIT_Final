import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { Button, Select, Table, Pagination, StatCard } from "../../components";
import { reportService } from "../../services/reportService";
import { indicatorValueService } from "../../services/indicatorValueService";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../constants/roles";
import { ADMIN_PAGE_VIEW_PATH } from "../../router/routePath";
import type { WardReportItem, ReportDashboardData } from "../../types/report";
import {
  FaFileExcel,
  FaFilePdf,
  FaMapMarkedAlt,
  FaSpinner,
  FaChartPie,
} from "react-icons/fa";
import toast from "react-hot-toast";

const currentYear = new Date().getFullYear();
const WARD_PAGE_SIZE = 15;

function getRiskLevelBadgeClass(riskLevel: string) {
  if (riskLevel === "Cao")
    return "bg-red-500/20 text-red-600";
  if (riskLevel === "Trung bình")
    return "bg-amber-500/20 text-amber-600";
  return "bg-green-500/20 text-green-600";
}

export default function RiskReportPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const { data: availableYears = [] } = useQuery({
    queryKey: ["indicator-values-years", "risk-report"],
    queryFn: () => indicatorValueService.getAvailableYears(null),
  });

  const yearOptions = useMemo(
    () => {
      const set = new Set<number>(availableYears);
      set.add(currentYear);
      const years = Array.from(set).sort((a, b) => b - a);
      return years.map((y) => ({
        value: y,
        label: `${t("riskReport.yearLabel")} ${y}`,
      }));
    },
    [availableYears, t]
  );

  const wardColumns = useMemo(
    (): Array<{
      header: string;
      accessor: keyof WardReportItem | "stt";
      render?: (value: unknown, row: WardReportItem & { stt?: number }) => React.ReactNode;
    }> => [
      {
        header: t("riskReport.colStt"),
        accessor: "stt" as keyof WardReportItem,
        render: (_: unknown, row) => (
          <span className="text-gray-500">{row.stt ?? 0}</span>
        ),
      },
      {
        header: t("riskReport.colWardName"),
        accessor: "ward_name",
        render: (value: unknown) => (
          <span className="font-medium">{String(value ?? "—")}</span>
        ),
      },
      {
        header: t("riskReport.colScore"),
        accessor: "total_score",
        render: (value: unknown) => (
          <span>{value != null ? Number(value).toFixed(2) : "—"}</span>
        ),
      },
      {
        header: t("riskReport.colStatus"),
        accessor: "risk_level",
        render: (value: unknown) => (
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${getRiskLevelBadgeClass(
              String(value ?? "")
            )}`}
          >
            {String(value ?? "—")}
          </span>
        ),
      },
    ],
    [t]
  );
  const [year, setYear] = useState(currentYear);
  const [compareYear, setCompareYear] = useState(currentYear - 1);
  const [showCompare, setShowCompare] = useState(false);
  const [wardPage, setWardPage] = useState(1);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isWardAdmin = user?.role === UserRole.WARD_ADMIN;
  const canAccess = isSuperAdmin || isWardAdmin;

  const { data, isLoading, error } = useQuery({
    queryKey: ["report-dashboard", year],
    queryFn: () => reportService.getDashboard(year),
    enabled: canAccess,
  });

  const { data: compareData } = useQuery({
    queryKey: ["report-compare", year, compareYear],
    queryFn: () => reportService.getCompare(year, compareYear),
    enabled: canAccess && showCompare,
  });

  const handleExportExcel = async () => {
    try {
      await reportService.downloadExcel(year);
      toast.success(t("riskReport.excelSuccess"));
    } catch {
      toast.error(t("riskReport.excelFailed"));
    }
  };

  const handleExportPDF = async () => {
    try {
      await reportService.downloadPDF(year);
      toast.success(t("riskReport.pdfSuccess"));
    } catch {
      toast.error(t("riskReport.pdfFailed"));
    }
  };

  if (!canAccess) {
    return (
      <div className={`p-6 ${themeClasses.text}`}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-amber-600 mb-2">
            {t("riskReport.noAccess")}
          </h2>
          <p className={themeClasses.textSecondary}>
            {t("riskReport.noAccessDesc")}
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[400px] gap-3 ${themeClasses.text}`}
      >
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
        <p className="text-lg">{t("riskReport.loadingReport")}</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`p-6 ${themeClasses.text}`}>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            {t("riskReport.loadError")}
          </h2>
          <p className={themeClasses.textSecondary}>
            {t("riskReport.loadErrorHint", { year })}
          </p>
        </div>
      </div>
    );
  }

  const reportData = data as ReportDashboardData;
  const {
    total,
    highRisk,
    mediumRisk,
    lowRisk,
    wards,
    isWardAdmin: dataIsWardAdmin,
  } = reportData;
  const isWardView = dataIsWardAdmin ?? isWardAdmin;

  const totalWardPages = Math.max(1, Math.ceil(wards.length / WARD_PAGE_SIZE));
  const paginatedWards = wards
    .slice((wardPage - 1) * WARD_PAGE_SIZE, wardPage * WARD_PAGE_SIZE)
    .map((w, i) => ({
      ...w,
      stt: (wardPage - 1) * WARD_PAGE_SIZE + i + 1,
    }));

  const pieData = [
    { name: t("pageView.riskLevelThap"), value: lowRisk, color: "#9ca3af" },
    { name: t("pageView.riskLevelTrungBinh"), value: mediumRisk, color: "#eab308" },
    { name: t("pageView.riskLevelCao"), value: highRisk, color: "#ef4444" },
  ].filter((d) => d.value > 0);

  const top5HighRisk = wards
    .filter((w) => w.risk_level === "Cao")
    .slice(0, 5)
    .map((w, i) => ({ ...w, stt: i + 1 }));

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    setWardPage(1);
  };

  return (
    <div className={`p-4 md:p-6 space-y-6 ${themeClasses.background}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className={`text-2xl md:text-3xl font-bold mb-1 ${themeClasses.text}`}
          >
            {t("riskReport.title")}
          </h1>
          <p className={themeClasses.textSecondary}>
            {isWardView ? t("riskReport.subtitleWard") : t("riskReport.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={year}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            options={yearOptions}
            className="min-w-[120px]"
          />
          <Button
            variant="primary"
            onClick={handleExportExcel}
            className="flex items-center gap-2"
          >
            <FaFileExcel />
            {t("riskReport.exportExcel")}
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportPDF}
            className="flex items-center gap-2"
          >
            <FaFilePdf />
            {t("riskReport.exportPDF")}
          </Button>
        </div>
      </div>

      {/* Tổng quan - Cards (chỉ cho Super Admin / toàn thành phố) */}
      {!isWardView && (
        <div
          className={`grid gap-4 ${
            isWardView ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4"
          }`}
        >
          <div
            className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-xl p-4`}
          >
            <div className={`text-sm ${themeClasses.textSecondary}`}>
              {t("riskReport.totalWards")}
            </div>
            <div className={`text-2xl font-bold ${themeClasses.text}`}>
              {total}
            </div>
          </div>
          <StatCard
            title={t("riskReport.highRisk")}
            value={highRisk}
            variant="danger"
          />
          <StatCard
            title={t("riskReport.mediumRisk")}
            value={mediumRisk}
            variant="warning"
          />
          <StatCard
            title={t("riskReport.lowRisk")}
            value={lowRisk}
            variant="success"
          />
        </div>
      )}

      {/* Biểu đồ + Bản đồ + So sánh năm */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Biểu đồ tròn | Thông tin phường */}
        <div
          className={`lg:col-span-2 ${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-xl p-6`}
        >
          <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>
            <FaChartPie className="inline mr-2" />
            {isWardView ? t("riskReport.chartTitleWard") : t("riskReport.chartTitle")}
          </h2>
          {isWardView && wards[0] ? (
            <div
              className={`flex flex-col items-center justify-center py-8 ${themeClasses.text}`}
            >
              <div className="text-2xl font-bold mb-1">
                {wards[0].ward_name}
              </div>
              <div className="text-4xl font-bold mb-2">
                {(wards[0].total_score ?? 0).toFixed(2)}
              </div>
              <span
                className={`px-4 py-2 rounded-full text-lg font-medium ${getRiskLevelBadgeClass(
                  wards[0].risk_level
                )}`}
              >
                {wards[0].risk_level}
              </span>
            </div>
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name}: ${((percent ?? 0) * 100).toFixed(1)}%`
                  }
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              className={`h-48 flex items-center justify-center ${themeClasses.textSecondary}`}
            >
              {isWardView ? t("riskReport.noDataChartWard") : t("riskReport.noDataChart")}
            </div>
          )}
        </div>

        {/* Bản đồ + So sánh */}
        <div className="space-y-6">
          <div
            className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-xl p-6`}
          >
            <h2 className={`text-lg font-semibold mb-3 ${themeClasses.text}`}>
              <FaMapMarkedAlt className="inline mr-2" />
              {t("riskReport.mapSection")}
            </h2>
            <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>
              {t("riskReport.mapDesc")}
            </p>
            <Link
              to={`${ADMIN_PAGE_VIEW_PATH}?year=${year}`}
              className="block w-full"
            >
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-2"
              >
                <FaMapMarkedAlt />
                {t("riskReport.viewMap")}
              </Button>
            </Link>
          </div>

          {/* So sánh năm */}
          <div
            className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-xl p-6`}
          >
            <h2 className={`text-lg font-semibold mb-3 ${themeClasses.text}`}>
              {t("riskReport.compareTitle")}
            </h2>
            <div className="flex gap-2 mb-3">
              <Select
                value={compareYear}
                onChange={(e) => setCompareYear(Number(e.target.value))}
                options={yearOptions.filter((y) => y.value !== year)}
                className="flex-1"
              />
              <Button
                variant="secondary"
                onClick={() => setShowCompare(!showCompare)}
              >
                {showCompare ? t("riskReport.hide") : t("riskReport.compare")}
              </Button>
            </div>
            {showCompare && compareData && (
              <div className="space-y-2 text-sm">
                {compareData.wardCompare ? (
                  <div className={`space-y-3 ${themeClasses.text}`}>
                    <div className="font-medium">
                      {compareData.wardCompare.ward_name}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className={`p-2 rounded ${themeClasses.backgroundTertiary}`}
                      >
                        <div className="text-xs opacity-70">{t("riskReport.yearLabel")} {year}</div>
                        <div>
                          {compareData.wardCompare.year1 ? (
                            <>
                              {(compareData.wardCompare.year1.total_score ?? 0).toFixed(2)} — {compareData.wardCompare.year1.risk_level}
                            </>
                          ) : (
                            "—"
                          )}
                        </div>
                      </div>
                      <div
                        className={`p-2 rounded ${themeClasses.backgroundTertiary}`}
                      >
                        <div className="text-xs opacity-70">
                          {t("riskReport.yearLabel")} {compareYear}
                        </div>
                        <div>
                          {compareData.wardCompare.year2 ? (
                            <>
                              {(compareData.wardCompare.year2.total_score ?? 0).toFixed(2)} — {compareData.wardCompare.year2.risk_level}
                            </>
                          ) : (
                            "—"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  compareData.comparison?.map((c) => (
                    <div
                      key={c.level}
                      className={`flex justify-between ${themeClasses.text}`}
                    >
                      <span>{c.level}:</span>
                      <span>
                        {year}: {c.year1} | {compareYear}: {c.year2}
                        {c.change !== 0 && (
                          <span
                            className={
                              c.change > 0 ? "text-red-500" : "text-green-500"
                            }
                          >
                            {" "}
                            ({c.change > 0 ? "+" : ""}
                            {c.change})
                          </span>
                        )}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top 5 phường nguy cơ cao - chỉ Super Admin */}
      {!isWardView && top5HighRisk.length > 0 && (
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-xl p-6`}
        >
          <h2 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>
            {t("riskReport.top5Title")}
          </h2>
          <Table
            columns={wardColumns}
            data={top5HighRisk}
            emptyMessage={t("riskReport.emptyHighRisk")}
          />
        </div>
      )}

      {/* Bảng chi tiết */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-xl overflow-hidden`}
      >
        <div className="p-4 border-b border-inherit">
          <h2 className={`text-lg font-semibold ${themeClasses.text}`}>
            {isWardView ? t("riskReport.tableTitleWard") : t("riskReport.tableTitle")}
          </h2>
        </div>
        <Table
          columns={wardColumns}
          data={paginatedWards}
          emptyMessage={t("riskReport.emptyTable")}
        />
        <Pagination
          page={wardPage}
          totalPages={totalWardPages}
          totalItems={wards.length}
          pageSize={WARD_PAGE_SIZE}
          onPageChange={setWardPage}
          itemLabel={t("riskReport.wardLabel")}
        />
      </div>
    </div>
  );
}
