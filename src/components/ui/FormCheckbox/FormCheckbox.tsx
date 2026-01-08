import React from "react";
import { FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useTheme } from "../../../contexts/ThemeContext";

interface CheckboxOption {
  label: string;
  checked?: boolean;
  required?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  className?: string;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  className,
}) => {
  const { theme } = useTheme();
  const isRow = className?.includes("flex") || className?.includes("row");

  return (
    <FormGroup row={isRow} className={className}>
      {options.map((option, index) => (
        <FormControlLabel
          key={index}
          control={
            <Checkbox
              checked={option.checked}
              disabled={option.disabled}
              onChange={option.onChange}
              sx={{
                color: theme === "light" ? "#4b5563" : "#9ca3af",
                "&.Mui-checked": {
                  color: theme === "light" ? "#6366f1" : "#818cf8",
                },
              }}
            />
          }
          label={option.label}
          required={option.required}
          sx={{
            color: theme === "light" ? "#1f2937" : "#ffffff",
          }}
        />
      ))}
    </FormGroup>
  );
};

export default CheckboxGroup;


