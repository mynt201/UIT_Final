import React from 'react';
import { FormGroup, FormControlLabel, Checkbox } from '@mui/material';

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

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ options, className }) => {
  return (
    <FormGroup className={className}>
      {options.map((option, index) => (
        <FormControlLabel
          key={index}
          control={
            <Checkbox
              checked={option.checked}
              disabled={option.disabled}
              onChange={option.onChange}
            />
          }
          label={option.label}
          required={option.required}
        />
      ))}
    </FormGroup>
  );
};

export default CheckboxGroup;
