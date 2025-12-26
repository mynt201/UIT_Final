import type { Theme } from "../contexts/ThemeContext";

export const getThemeClasses = (theme: Theme) => {
  return {
    container:
      theme === "light" ? "bg-gray-50 border border-gray-200" : "bg-[#0a1628]",
    background: theme === "light" ? "bg-white" : "bg-gray-900",
    backgroundSecondary: theme === "light" ? "bg-gray-100" : "bg-gray-800",
    backgroundTertiary: theme === "light" ? "bg-gray-50" : "bg-gray-800/50",
    text: theme === "light" ? "text-gray-900" : "text-white",
    textSecondary: theme === "light" ? "text-gray-700" : "text-gray-400",
    textTertiary: theme === "light" ? "text-gray-500" : "text-gray-500",
    border: theme === "light" ? "border-gray-300" : "border-gray-700",
    input:
      theme === "light"
        ? "bg-white text-gray-900 border-gray-300"
        : "bg-gray-700 text-white border-gray-600",
    header:
      theme === "light"
        ? "text-gray-900 border-gray-300"
        : "text-white border-gray-700",
    card:
      theme === "light"
        ? "bg-white border border-gray-200"
        : "bg-gray-800 border border-gray-700",
    sidebar:
      theme === "light"
        ? "bg-gray-100 border-r border-gray-300"
        : "bg-gray-800 border-r border-gray-700",
    headerBg:
      theme === "light"
        ? "bg-white border-b border-gray-300"
        : "bg-gray-800 border-b border-gray-700",
  };
};
