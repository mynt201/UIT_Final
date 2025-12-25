import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, type BaseSelectProps } from '@mui/material';

interface Option {
  value: string | number;
  label: string;
}

// Props cho component FormSelect
interface FormSelectProps extends BaseSelectProps {
  label: string;
  options: Option[];
}

const FormSelect: React.FC<FormSelectProps> = ({ label, value, options, ...rest }) => {
  return (
    <FormControl fullWidth>
      <InputLabel className='text-white'>{label}</InputLabel>
      <Select value={value} {...rest} label={label}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FormSelect;
