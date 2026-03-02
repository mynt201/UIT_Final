import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

export interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
  itemLabel?: string;
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  label = "Hiển thị",
  itemLabel = "mục",
}: PaginationProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const buttonClass = `px-3 py-1.5 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
    theme === "light"
      ? "bg-gray-200 hover:bg-gray-300 text-gray-700"
      : "bg-gray-600 hover:bg-gray-500 text-white"
  }`;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t ${themeClasses.border}`}
    >
      <span className={`text-sm ${themeClasses.textSecondary}`}>
        {label} {start}–{end} / {totalItems} {itemLabel}
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className={buttonClass}
        >
          Trước
        </button>
        <span className={`text-sm ${themeClasses.textSecondary}`}>
          Trang {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className={buttonClass}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
