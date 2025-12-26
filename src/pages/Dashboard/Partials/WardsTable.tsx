import { FaMapMarkedAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Table, Button } from "../../../components";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import type { WardStat } from "../../../types";

interface WardsTableProps {
  wards: WardStat[];
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function WardsTable({
  wards,
  currentPage,
  itemsPerPage,
  totalPages,
  onPageChange,
}: WardsTableProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  return (
    <div
      className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg overflow-hidden`}
    >
      <div
        className={`p-6 border-b ${themeClasses.border} flex justify-between items-center`}
      >
        <div className="flex items-center gap-3">
          <FaMapMarkedAlt className="text-indigo-400 text-xl" />
          <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
            {wards.length > 0
              ? `Danh sách khu vực (${wards.length} kết quả)`
              : "Không có dữ liệu"}
          </h2>
        </div>
      </div>
      <Table
        columns={[
          {
            header: "STT",
            accessor: "ward_name",
            render: (_value, _row, index) => (
              <span className={themeClasses.textSecondary}>
                {(currentPage - 1) * itemsPerPage + (index ?? 0) + 1}
              </span>
            ),
          },
          { header: "Tên phường/xã", accessor: "ward_name" },
          {
            header: "Chỉ số rủi ro",
            accessor: "flood_risk",
            render: (value) => (
              <span className="font-bold text-red-400">
                {Number(value).toFixed(2)}
              </span>
            ),
          },
          {
            header: "Mức độ",
            accessor: "risk_level",
            render: (value) => (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  value === "Cao"
                    ? "bg-red-500/20 text-red-400"
                    : value === "Trung Bình"
                    ? "bg-orange-300/20 text-orange-300"
                    : "bg-green-300/20 text-green-300"
                }`}
              >
                {String(value)}
              </span>
            ),
          },
          {
            header: "Mật độ dân số",
            accessor: "population_density",
            render: (value) => (
              <span className={themeClasses.text}>
                {Number(value).toLocaleString()} người/km²
              </span>
            ),
          },
          {
            header: "Lượng mưa",
            accessor: "rainfall",
            render: (value) => (
              <span className={themeClasses.text}>{Number(value)} mm</span>
            ),
          },
        ]}
        data={wards}
        emptyMessage="Không tìm thấy dữ liệu phù hợp"
      />
      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className={`p-4 border-t ${themeClasses.border} flex justify-between items-center`}
        >
          <div className={`text-sm ${themeClasses.textSecondary}`}>
            Hiển thị {(validCurrentPage - 1) * itemsPerPage + 1} -{" "}
            {Math.min(validCurrentPage * itemsPerPage, wards.length)} /{" "}
            {wards.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => onPageChange(Math.max(1, validCurrentPage - 1))}
              disabled={validCurrentPage === 1}
              className="p-2"
            >
              <FaChevronLeft />
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (validCurrentPage <= 3) {
                  pageNum = i + 1;
                } else if (validCurrentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = validCurrentPage - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={
                      validCurrentPage === pageNum ? "primary" : "secondary"
                    }
                    onClick={() => onPageChange(pageNum)}
                    className="px-3 py-1"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="secondary"
              onClick={() => onPageChange(Math.min(totalPages, validCurrentPage + 1))}
              disabled={validCurrentPage === totalPages}
              className="p-2"
            >
              <FaChevronRight />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

