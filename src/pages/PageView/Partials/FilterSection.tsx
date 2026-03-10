import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FormCheckbox, Select } from "../../../components";
import { options } from "../constants";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

export interface YearOption {
  value: string;
  label: string;
}

interface FilterSectionProps {
  year: number;
  onYearChange: (year: number) => void;
  yearOptions?: YearOption[];
  selectedRiskLevels: string[];
  onRiskLevelChange: (value: string) => void;
}

const DEFAULT_YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: String(y), label: String(y) };
});

export default function FilterSection({
  year,
  onYearChange,
  yearOptions: yearOptionsProp,
  selectedRiskLevels,
  onRiskLevelChange,
}: FilterSectionProps) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const optionsWithLabels = options.map((opt) => ({
    ...opt,
    label: t(opt.labelKey),
  }));

  const yearOptions = useMemo(() => {
    const base = yearOptionsProp?.length ? yearOptionsProp : DEFAULT_YEAR_OPTIONS;
    const hasYear = base.some((o) => Number(o.value) === year);
    if (hasYear) return base;
    return [{ value: String(year), label: String(year) }, ...base];
  }, [yearOptionsProp, year]);

  return (
    <div
      className={`${themeClasses.backgroundTertiary} p-2 md:p-3 shrink-0 border-b ${themeClasses.border}`}
    >
      <div className="flex flex-row gap-4 md:gap-6 flex-wrap">
        <div className="shrink-0">
          <div className={`${themeClasses.text} text-xs font-medium mb-1`}>
            {t("pageView.filterYear")}
          </div>
          <Select
            options={yearOptions}
            value={String(year)}
            onChange={(e) => {
              const v = e.target.value;
              if (v !== "") onYearChange(Number(v));
            }}
            className="w-28 text-sm"
          />
        </div>
        <div className="shrink-0">
          <div className={`${themeClasses.text} text-xs font-medium mb-1`}>
            {t("pageView.filterByLevel")}
          </div>
          <div className="w-auto">
            <FormCheckbox
              options={optionsWithLabels.map((opt) => ({
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
