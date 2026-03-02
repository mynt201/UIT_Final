import {
  FaChartLine,
  FaSync,
  FaUpload,
  FaPlus,
  FaFileDownload,
} from "react-icons/fa";
import { useTheme } from "../../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../../utils/themeUtils";
import { Button, Select, Table } from "../../../../components";
import type { WardYearIndicatorRow } from "../types";
import type { AdministrativeUnit } from "../../../../services/administrativeUnitService";
type IndicatorTableColumn = {
  header: string;
  accessor: keyof WardYearIndicatorRow | string;
  render?: (value: unknown, row: WardYearIndicatorRow) => React.ReactNode;
};

interface IndicatorTablePanelProps {
  selectedWardId: string | null;
  selectedWardName: string | null;
  allUnits: AdministrativeUnit[];
  yearFilter: number | "";
  pageData: WardYearIndicatorRow[];
  columns: IndicatorTableColumn[];
  loading: boolean;
  totalRows: number;
  pagination: { page: number; limit: number };
  totalPages: number;
  isSuperAdmin: boolean;
  isWardAdmin?: boolean;
  canUseTemplateOrUpload?: boolean;
  isUploading: boolean;
  isRefreshing: boolean;
  onWardChange: (id: string | null) => void;
  onYearChange: (year: number | "") => void;
  onRefresh: () => void;
  onPageChange: (page: number) => void;
  onAdd: () => void;
  onAhpOpen: () => void;
  onRefreshAssessments: () => void;
  onDownloadTemplate?: () => void;
  onCsvUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const YEAR_OPTIONS = Array.from(
  { length: 8 },
  (_, i) => new Date().getFullYear() - i,
);

export default function IndicatorTablePanel({
  selectedWardId,
  selectedWardName,
  allUnits,
  yearFilter,
  pageData,
  columns,
  loading,
  totalRows,
  pagination,
  totalPages,
  isSuperAdmin,
  isWardAdmin = false,
  canUseTemplateOrUpload = false,
  isUploading,
  isRefreshing,
  onWardChange,
  onYearChange,
  onRefresh,
  onPageChange,
  onAdd,
  onAhpOpen,
  onRefreshAssessments,
  onDownloadTemplate,
  onCsvUpload,
}: IndicatorTablePanelProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const wardOptions = [
    ...(isSuperAdmin ? [{ value: "", label: "Tất cả phường" }] : []),
    ...allUnits.map((u) => ({ value: u._id, label: u.name })),
  ];

  const yearOptions = [
    { value: "", label: "Tất cả năm" },
    ...YEAR_OPTIONS.map((y) => ({ value: String(y), label: String(y) })),
  ];

  return (
    <div
      className={`rounded-2xl border ${themeClasses.border} ${themeClasses.backgroundSecondary} overflow-hidden`}
    >
      <div className="px-5 py-4 border-b flex flex-wrap items-center justify-between gap-3">
        <h2
          className={`font-semibold text-lg flex items-center gap-2 ${themeClasses.text}`}
        >
          <FaChartLine size={20} className="text-amber-500" />
          Chỉ số Rủi ro
          {selectedWardName && (
            <span className="text-sm font-normal text-indigo-600 dark:text-indigo-400">
              — {selectedWardName}
            </span>
          )}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            options={wardOptions}
            value={selectedWardId ?? ""}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onWardChange(e.target.value || null)
            }
            className="w-40 text-sm"
          />
          <Select
            options={yearOptions}
            value={String(yearFilter)}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onYearChange(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-32 text-sm"
          />
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
            title="Làm mới"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
          </button>
          {canUseTemplateOrUpload && onDownloadTemplate && (
            <>
              <Button
                onClick={onDownloadTemplate}
                disabled={isUploading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium disabled:opacity-50"
              >
                <FaFileDownload size={14} />
                Tải template
              </Button>
              <label
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer ${
                  theme === "light"
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-indigo-500 hover:bg-indigo-600"
                } text-white ${isUploading ? "opacity-50" : ""}`}
              >
                <FaUpload size={14} />
                Upload CSV
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  disabled={isUploading}
                  onChange={onCsvUpload}
                />
              </label>
            </>
          )}
          {(isSuperAdmin || (isWardAdmin && selectedWardId)) && (
            <Button
              onClick={onAdd}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
            >
              <FaPlus size={14} />
              Thêm
            </Button>
          )}
          {isSuperAdmin && (
            <>
              <Button
                onClick={onAhpOpen}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium"
              >
                <FaChartLine size={14} />
                AHP
              </Button>
              <Button
                onClick={onRefreshAssessments}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium"
                title="Tính RI = Σ(weight × normalized_value) và cập nhật risk_assessments"
              >
                <FaSync className={isRefreshing ? "animate-spin" : ""} />
                Tính lại đánh giá
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="p-4">
        <Table<WardYearIndicatorRow>
          columns={columns}
          data={pageData}
          emptyMessage={
            loading
              ? "Đang tải..."
              : "Chưa có chỉ số. Chọn phường và thêm dữ liệu."
          }
        />
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <Button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            >
              ‹
            </Button>
            <span className="px-3 py-1 text-sm">
              {pagination.page} / {totalPages} — {totalRows} bản ghi
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages || loading}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
