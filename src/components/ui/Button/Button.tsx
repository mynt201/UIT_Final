import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { useTheme } from "../../../contexts/ThemeContext";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "success";
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const { theme } = useTheme();
  const baseClasses = "px-4 py-2 rounded-lg transition-colors font-medium";

  const variantClasses = {
    primary:
      theme === "light"
        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
        : "bg-indigo-500 hover:bg-indigo-600 text-white",
    secondary:
      theme === "light"
        ? "bg-gray-300 hover:bg-gray-400 text-gray-800"
        : "bg-gray-700 hover:bg-gray-600 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}


