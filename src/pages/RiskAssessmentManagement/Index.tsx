import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FaSync, FaTable } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { riskAssessmentService } from "../../services/riskAssessmentService";
import { administrativeUnitService } from "../../services/administrativeUnitService";
import { indicatorValueService } from "../../services/indicatorValueService";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../constants/roles";
import { Button, Table, Select } from "../../components";
import { formatNumber } from "../../utils/formatUtils";

const RISK_LEVEL_COLORS: Record<string, string> = {
  Thấp: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Trung bình": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Cao: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function RiskAssessmentManagementPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const isWardAdmin = (currentUser?.role as string) === UserRole.WARD_ADMIN;
  const wardAdminUnitId = (currentUser as { ward_id?: string })?.ward_id ?? null;

  const currentYear = new Date().getFullYear();
  const [yearFilter, setYearFilter] = useState<number | "">(currentYear);
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>("");

  const { data: unitsData } = useQuery({
    queryKey: ["administrative-units", "all"],
    queryFn: () => administrativeUnitService.getAllUnits(),
  });
  const allUnits = unitsData?.data ?? [];

  const { data: availableYears = [] } = useQuery({
    queryKey: ["indicator-values-years", "risk-assessment"],
    queryFn: () => indicatorValueService.getAvailableYears(null),
  });

  const yearOptions = useMemo(
    () => [
      { value: "all", label: t("riskAssessment.all") },
      ...availableYears.map((y) => ({ value: String(y), label: String(y) })),
    ],
    [availableYears, t]
  );

  const unitIdParam = isWardAdmin ? wardAdminUnitId : unitFilter;

  const isAuthenticated = !!currentUser;

  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: [
      "risk-assessments",
      yearFilter || "all",
      unitIdParam || "all",
      riskLevelFilter || "all",
    ],
    queryFn: async () => {
      const yearsToRefresh =
        yearFilter !== "" && yearFilter != null
          ? [Number(yearFilter)]
          : availableYears.length > 0
            ? availableYears
            : [currentYear];
      for (const yr of yearsToRefresh) {
        await riskAssessmentService.refreshAssessments(yr);
      }
      return riskAssessmentService.getAssessments({
        year: yearFilter || undefined,
        unit_id: unitIdParam || undefined,
        risk_level: riskLevelFilter || undefined,
      });
    },
    enabled: isAuthenticated,
  });
  const assessments = assessmentsData?.data ?? [];

  const refreshMutation = useMutation({
    mutationFn: (yr: number) => riskAssessmentService.refreshAssessments(yr),
    onSuccess: (_, yr) => {
      toast.success(t("riskAssessment.toastRefreshSuccess", { year: yr }));
      queryClient.invalidateQueries({ queryKey: ["risk-assessments"] });
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          t("riskAssessment.toastRefreshError"),
      );
    },
  });

  const unitOptions = isWardAdmin
    ? allUnits.filter((u) => u._id === wardAdminUnitId)
    : allUnits;

  const columns = useMemo(
    () => [
      {
        header: t("riskAssessment.colWard"),
        accessor: "unit_id" as const,
        render: (_: unknown, row: (typeof assessments)[0]) =>
          typeof row.unit_id === "object" && row.unit_id?.name
            ? row.unit_id.name
            : "—",
      },
      {
        header: t("riskAssessment.colYear"),
        accessor: "year" as const,
        render: (v: unknown) => (
          <span className="font-medium">{String(v ?? "—")}</span>
        ),
      },
      {
        header: t("riskAssessment.colScore"),
        accessor: "total_score" as const,
        render: (v: unknown) => (
          <span>
            {typeof v === "number" ? formatNumber(v, 2) : "—"}
          </span>
        ),
      },
      {
        header: t("riskAssessment.colLevel"),
        accessor: "risk_level" as const,
      render: (v: unknown) => {
        const level = String(v ?? "");
        const colorClass = RISK_LEVEL_COLORS[level] ?? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
        return (
          <span
            className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${colorClass}`}
          >
            {level || "—"}
          </span>
        );
      },
    },
  ],
    [t, assessments]
  );

  return (
    <div className={`min-h-full ${themeClasses.background}`}>
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-2">
            <FaTable className="text-indigo-500" size={24} />
            <h1 className={`text-xl font-bold ${themeClasses.text}`}>
              {t("riskAssessment.title")}
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`mb-6 p-4 rounded-lg border ${themeClasses.border} ${themeClasses.background}`}
        >
          <div className="flex flex-wrap gap-4 items-end">
            <Select
              label={t("riskAssessment.filterYear")}
              options={yearOptions}
              value={yearFilter === "" ? "all" : String(yearFilter)}
              onChange={(e) =>
                setYearFilter(e.target.value === "all" ? "" : Number(e.target.value))
              }
              className="w-32"
            />
            {!isWardAdmin && (
              <Select
                label={t("riskAssessment.filterWard")}
                options={[
                  { value: "", label: t("riskAssessment.all") },
                  ...unitOptions.map((u) => ({ value: u._id, label: u.name })),
                ]}
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="min-w-[180px]"
              />
            )}
            <Select
              label={t("riskAssessment.filterLevel")}
              options={[
                { value: "", label: t("riskAssessment.all") },
                { value: "Thấp", label: t("pageView.riskLevelThap") },
                { value: "Trung bình", label: t("pageView.riskLevelTrungBinh") },
                { value: "Cao", label: t("pageView.riskLevelCao") },
              ]}
              value={riskLevelFilter}
              onChange={(e) => setRiskLevelFilter(e.target.value)}
              className="w-36"
            />
            <Button
              variant="primary"
              onClick={() => {
                const yr = yearFilter || currentYear;
                refreshMutation.mutate(typeof yr === "number" ? yr : currentYear);
              }}
              disabled={refreshMutation.isPending}
              className="flex items-center gap-2"
            >
              <FaSync
                className={refreshMutation.isPending ? "animate-spin" : ""}
                size={16}
              />
              {t("riskAssessment.refreshBtn")}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div
          className={`rounded-lg border overflow-hidden ${themeClasses.border}`}
        >
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">{t("riskAssessment.loading")}</div>
          ) : assessments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t("riskAssessment.empty")}
            </div>
          ) : (
            <Table columns={columns} data={assessments} />
          )}
        </div>
      </div>
    </div>
  );
}
