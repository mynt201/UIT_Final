import { FaSearch, FaFilter } from "react-icons/fa";
import { Input, Select } from "../../../components";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

interface SearchAndFilterProps {
  searchTerm: string;
  selectedRiskLevel: string;
  onSearchChange: (value: string) => void;
  onRiskLevelChange: (value: string) => void;
  filteredCount: number;
  totalCount: number;
}

export default function SearchAndFilter({
  searchTerm,
  selectedRiskLevel,
  onSearchChange,
  onRiskLevelChange,
  filteredCount,
  totalCount,
}: SearchAndFilterProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div
      className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <FaSearch
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} z-10`}
          />
          <Input
            type="text"
            placeholder="Tìm kiếm phường/xã..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <FaFilter
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textSecondary} z-10`}
          />
          <Select
            options={[
              { value: "all", label: "Tất cả mức độ rủi ro" },
              { value: "Cao", label: "Rủi ro cao" },
              { value: "Trung Bình", label: "Rủi ro trung bình" },
              { value: "Thấp", label: "Rủi ro thấp" },
            ]}
            value={selectedRiskLevel}
            onChange={(e) => onRiskLevelChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      {(searchTerm || selectedRiskLevel !== "all") && (
        <div className={`mt-3 text-sm ${themeClasses.textSecondary}`}>
          Hiển thị {filteredCount} / {totalCount} kết quả
        </div>
      )}
    </div>
  );
}

