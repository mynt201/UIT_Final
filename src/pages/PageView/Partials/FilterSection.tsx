import { FormCheckbox } from "../../../components";
import { options } from "../constants";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

interface FilterSectionProps {
  selectedRiskLevels: string[];
  onRiskLevelChange: (value: string) => void;
}

export default function FilterSection({
  selectedRiskLevels,
  onRiskLevelChange,
}: FilterSectionProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div
      className={`${themeClasses.backgroundTertiary} p-2 md:p-3 shrink-0 border-b ${themeClasses.border}`}
    >
      <div className="flex flex-row gap-4 md:gap-6 items-end flex-wrap">
        <div className="shrink-0">
          <div className={`${themeClasses.text} text-xs font-medium mb-1`}>
            Lọc theo mức độ
          </div>
          <div className="w-auto">
            <FormCheckbox
              options={options.map((opt) => ({
                ...opt,
                checked: selectedRiskLevels.includes(opt.value),
                onChange: () => {
                  onRiskLevelChange(opt.value);
                },
              }))}
              className="flex row gap-2 md:gap-3"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
