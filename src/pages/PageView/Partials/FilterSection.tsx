import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { FormSelect, FormCheckbox } from '../../../components';
import { options } from '../constants';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';
import { Button } from '../../../components';

interface FilterSectionProps {
  selectedWard: string;
  selectedRiskLevels: string[];
  riskIndexRange: [number, number];
  filteredCount: number;
  wardOptions: { label: string; value: string }[];
  onWardChange: (
    event: ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } })
  ) => void;
  onRiskLevelChange: (value: string) => void;
  onRiskIndexRangeChange: (min: number, max: number) => void;
  onResetFilters: () => void;
}

export default function FilterSection({
  selectedWard,
  selectedRiskLevels,
  riskIndexRange,
  filteredCount,
  wardOptions,
  onWardChange,
  onRiskLevelChange,
  onRiskIndexRangeChange,
  onResetFilters,
}: FilterSectionProps) {
  const [minRisk, setMinRisk] = useState(riskIndexRange[0]);
  const [maxRisk, setMaxRisk] = useState(riskIndexRange[1]);

  useEffect(() => {
    setMinRisk(riskIndexRange[0]);
    setMaxRisk(riskIndexRange[1]);
  }, [riskIndexRange]);

  const handleMinRiskChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setMinRisk(value);
    if (value <= maxRisk) {
      onRiskIndexRangeChange(value, maxRisk);
    }
  };

  const handleMaxRiskChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setMaxRisk(value);
    if (value >= minRisk) {
      onRiskIndexRangeChange(minRisk, value);
    }
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className={`${themeClasses.backgroundTertiary} p-2 md:p-3 shrink-0 border-b ${themeClasses.border}`}>
      <div className='flex flex-row justify-between items-center gap-4 mb-2'>
        <div className={`text-sm md:text-base font-semibold ${themeClasses.text} whitespace-nowrap`}>Bộ lọc</div>
        <div className='flex items-center gap-3 md:gap-4 flex-shrink-0'>
          <div className={`text-xs md:text-sm ${themeClasses.textSecondary} whitespace-nowrap`}>
            Hiển thị: <span className={`font-bold ${theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'}`}>{filteredCount}</span> khu vực
          </div>
          <Button
            variant="secondary"
            onClick={onResetFilters}
            className='px-3 py-1.5 text-xs whitespace-nowrap'
          >
            Đặt lại
          </Button>
        </div>
      </div>
      <div className='flex flex-row gap-4 md:gap-6 items-end flex-wrap'>
        <div className='flex-shrink-0'>
          <div className={`${themeClasses.text} text-xs font-medium mb-1`}>Lọc theo khu vực</div>
          <div className='w-40 md:w-48'>
            <FormSelect
              label=''
              onChange={onWardChange}
              options={[{ label: 'Tất cả', value: '' }, ...wardOptions]}
              value={selectedWard}
            />
          </div>
        </div>
        <div className='flex-shrink-0'>
          <div className={`${themeClasses.text} text-xs font-medium mb-1`}>Lọc theo mức độ</div>
          <div className='w-auto'>
            <FormCheckbox
              options={options.map((opt) => ({
                ...opt,
                checked: selectedRiskLevels.includes(opt.value),
                onChange: () => {
                  onRiskLevelChange(opt.value);
                },
              }))}
              className='flex row gap-2 md:gap-3'
            />
          </div>
        </div>
        <div className='flex-shrink-0 flex-1 min-w-[180px] md:min-w-[220px]'>
          <div className={`${themeClasses.text} text-xs font-medium mb-1`}>
            Chỉ số rủi ro: {minRisk.toFixed(1)} - {maxRisk.toFixed(1)}
          </div>
          <div className='flex gap-2 md:gap-3'>
            <div className='flex-1'>
              <label className={`text-xs ${themeClasses.textSecondary} block mb-0.5`}>Min</label>
              <input
                type='range'
                min='0'
                max='10'
                step='0.1'
                value={minRisk}
                onChange={handleMinRiskChange}
                className={`w-full ${theme === 'light' ? 'accent-indigo-600' : 'accent-indigo-400'}`}
              />
              <div className={`text-xs ${themeClasses.textSecondary} mt-0.5`}>{minRisk.toFixed(1)}</div>
            </div>
            <div className='flex-1'>
              <label className={`text-xs ${themeClasses.textSecondary} block mb-0.5`}>Max</label>
              <input
                type='range'
                min='0'
                max='10'
                step='0.1'
                value={maxRisk}
                onChange={handleMaxRiskChange}
                className={`w-full ${theme === 'light' ? 'accent-indigo-600' : 'accent-indigo-400'}`}
              />
              <div className={`text-xs ${themeClasses.textSecondary} mt-0.5`}>{maxRisk.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
