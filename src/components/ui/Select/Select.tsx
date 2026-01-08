import type { SelectHTMLAttributes } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export default function Select({
  label,
  options,
  error,
  placeholder,
  className = "",
  ...props
}: SelectProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div>
      {label && (
        <label
          className={`block text-sm font-medium mb-2 ${themeClasses.textSecondary}`}
        >
          {label}
        </label>
      )}
      <select
        {...props}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 appearance-none ${themeClasses.input} ${themeClasses.border} ${className}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className={`mt-1 text-sm text-red-400`}>{error}</p>}
    </div>
  );
}


