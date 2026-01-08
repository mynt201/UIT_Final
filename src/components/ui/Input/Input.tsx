import { type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
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
      <input
        {...props}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 ${themeClasses.input} ${themeClasses.border} ${className}`}
      />
      {error && <p className={`mt-1 text-sm text-red-400`}>{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  className = "",
  ...props
}: TextareaProps) {
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
      <textarea
        {...props}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 ${themeClasses.input} ${themeClasses.border} ${className}`}
      />
      {error && <p className={`mt-1 text-sm text-red-400`}>{error}</p>}
    </div>
  );
}


