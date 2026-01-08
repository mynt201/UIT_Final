import type { ReactNode } from "react";
import { IoMdClose } from "react-icons/io";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "2xl",
}: ModalProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`${themeClasses.backgroundSecondary} rounded-lg p-6 w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-bold ${themeClasses.text}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === "light"
                ? "hover:bg-gray-200"
                : "bg-black/50 hover:bg-black/70"
            }`}
          >
            <IoMdClose
              size={24}
              className={theme === "light" ? "text-gray-800" : "text-white"}
            />
          </button>
        </div>

        <div className="mb-4">{children}</div>

        {footer && (
          <div
            className={`flex justify-end gap-3 pt-4 border-t ${themeClasses.border}`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


