import type { ReactNode } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

interface TableColumn<T = Record<string, unknown>> {
  header: string;
  accessor: keyof T | string;
  render?: (value: unknown, row: T, index?: number) => ReactNode;
}

interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export default function Table<T = Record<string, unknown>>({
  columns,
  data,
  emptyMessage = "Chưa có dữ liệu",
  onRowClick,
}: TableProps<T>) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div
      className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg overflow-hidden`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead
            className={`${
              theme === "light" ? "bg-gray-200" : "bg-gray-700/50"
            } border-b ${themeClasses.border}`}
          >
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`text-left p-4 text-xs font-semibold ${themeClasses.textSecondary}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b ${themeClasses.border} ${
                    theme === "light"
                      ? "hover:bg-gray-100"
                      : "hover:bg-gray-800/50"
                  } transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`p-4 ${
                        colIndex === 0
                          ? themeClasses.textSecondary
                          : themeClasses.text
                      }`}
                    >
                      {column.render
                        ? column.render(
                            (row as Record<string, unknown>)[
                              column.accessor as string
                            ],
                            row,
                          )
                        : String(
                            (row as Record<string, unknown>)[
                              column.accessor as string
                            ] ?? "-",
                          )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className={`p-8 text-center ${themeClasses.textSecondary}`}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


