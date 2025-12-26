import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, type BaseSelectProps } from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

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
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  
  return (
    <FormControl fullWidth>
      {label && (
        <InputLabel className={themeClasses.textSecondary}>{label}</InputLabel>
      )}
      <Select 
        value={value} 
        {...rest} 
        label={label}
        sx={{
          color: theme === 'light' ? '#1f2937' : '#ffffff',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme === 'light' ? '#d1d5db' : '#4b5563',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme === 'light' ? '#9ca3af' : '#6b7280',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme === 'light' ? '#6366f1' : '#818cf8',
          },
          '& .MuiSvgIcon-root': {
            color: theme === 'light' ? '#1f2937' : '#ffffff',
          },
        }}
      >
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

