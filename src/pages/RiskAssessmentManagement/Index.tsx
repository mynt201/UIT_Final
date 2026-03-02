import { useState } from "react";
import { FaSync, FaTable } from "react-icons/fa";
import { useTheme } from "../../contexts/ThemeContext";
import { getThemeClasses } from "../../utils/themeUtils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { riskAssessmentService } from "../../services/riskAssessmentService";
import { administrativeUnitService } from "../../services/administrativeUnitService";
import { useAuth } from "../../contexts/AuthContext";
import { UserRole } from "../../constants/roles";
import { Button, Table, Select } from "../../components";

const RISK_LEVEL_COLORS: Record<string, string> = {
  Thấp: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Trung bình": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Cao: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function RiskAssessmentManagementPage() {
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

  const unitIdParam = isWardAdmin ? wardAdminUnitId : unitFilter;

  const isAuthenticated = !!currentUser;

  const { data: assessmentsData, isLoading } = useQuery({
    queryKey: [
      "risk-assessments",
      yearFilter || "all",
      unitIdParam || "all",
      riskLevelFilter || "all",
    ],
    queryFn: () =>
      riskAssessmentService.getAssessments({
        year: yearFilter || undefined,
        unit_id: unitIdParam || undefined,
        risk_level: riskLevelFilter || undefined,
      }),
    enabled: isAuthenticated,
  });
  const assessments = assessmentsData?.data ?? [];

  const refreshMutation = useMutation({
    mutationFn: (yr: number) => riskAssessmentService.refreshAssessments(yr),
    onSuccess: (_, yr) => {
      toast.success(`Đã tính lại đánh giá năm ${yr}`);
      queryClient.invalidateQueries({ queryKey: ["risk-assessments"] });
    },
    onError: (e: unknown) => {
      const err = e as { response?: { data?: { error?: string } }; message?: string };
      toast.error(
        err?.response?.data?.error ||
          err?.message ||
          "Lỗi khi tính lại đánh giá",
      );
    },
  });

  const unitOptions = isWardAdmin
    ? allUnits.filter((u) => u._id === wardAdminUnitId)
    : allUnits;

  const columns = [
    {
      header: "Phường",
      accessor: "unit_id" as const,
      render: (_: unknown, row: (typeof assessments)[0]) =>
        typeof row.unit_id === "object" && row.unit_id?.name
          ? row.unit_id.name
          : "—",
    },
    {
      header: "Năm",
      accessor: "year" as const,
      render: (v: unknown) => (
        <span className="font-medium">{String(v ?? "—")}</span>
      ),
    },
    {
      header: "Điểm rủi ro",
      accessor: "total_score" as const,
        render: (v: unknown) => (
        <span className="font-mono">
          {typeof v === "number" ? v.toFixed(4) : "—"}
        </span>
      ),
    },
    {
      header: "Mức độ",
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
  ];

  return (
    <div
      className={`min-h-full ${themeClasses.background}`}
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <div className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-2">
            <FaTable className="text-indigo-500" size={24} />
            <h1 className={`text-xl font-bold ${themeClasses.text}`}>
              Quản lý đánh giá rủi ro
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div
          className={`mb-6 p-4 rounded-lg border ${themeClasses.border} ${themeClasses.background}`}
        >
          <div className="flex flex-wrap gap-4 items-end">
            <Select
              label="Năm"
              options={[
                { value: "all", label: "Tất cả" },
                ...[currentYear + 1, currentYear, currentYear - 1, currentYear - 2].map(
                  (y) => ({ value: String(y), label: String(y) })
                ),
              ]}
              value={yearFilter === "" ? "all" : String(yearFilter)}
              onChange={(e) =>
                setYearFilter(e.target.value === "all" ? "" : parseInt(e.target.value))
              }
              className="w-32"
            />
            {!isWardAdmin && (
              <Select
                label="Phường"
                options={[
                  { value: "", label: "Tất cả" },
                  ...unitOptions.map((u) => ({ value: u._id, label: u.name })),
                ]}
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="min-w-[180px]"
              />
            )}
            <Select
              label="Mức độ"
              options={[
                { value: "", label: "Tất cả" },
                { value: "Thấp", label: "Thấp" },
                { value: "Trung bình", label: "Trung bình" },
                { value: "Cao", label: "Cao" },
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
              Tính lại đánh giá
            </Button>
          </div>
        </div>

        {/* Table */}
        <div
          className={`rounded-lg border overflow-hidden ${themeClasses.border}`}
        >
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Đang tải...</div>
          ) : assessments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chưa có dữ liệu đánh giá. Bấm &quot;Tính lại đánh giá&quot; sau khi đã có
              chỉ số phường.
            </div>
          ) : (
            <Table columns={columns} data={assessments} />
          )}
        </div>
      </div>
    </div>
  );
}
