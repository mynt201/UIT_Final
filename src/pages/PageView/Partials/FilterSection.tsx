import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import FormSelect from '../../../components/form/FormSelect';
import CheckboxGroup from '../../../components/form/FormCheckbox';
import { options } from '../constants';

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

  return (
    <div className='bg-gray-100 p-4'>
      <div className='flex justify-between items-center mb-4'>
        <div className='text-lg font-semibold text-gray-800'>Bộ lọc</div>
        <div className='flex items-center gap-4'>
          <div className='text-sm text-gray-600'>
            Hiển thị: <span className='font-bold text-blue-600'>{filteredCount}</span> khu vực
          </div>
          <button
            onClick={onResetFilters}
            className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium transition-colors'
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>
      <div className='flex gap-10 flex-wrap'>
        <div>
          <div className='text-black py-4 font-medium'>Lọc theo khu vực</div>
          <div className='w-64'>
            <FormSelect
              label='Chọn khu vực'
              onChange={onWardChange}
              options={[{ label: 'Tất cả', value: '' }, ...wardOptions]}
              value={selectedWard}
            />
          </div>
        </div>
        <div>
          <div className='text-black py-4 font-medium'>Lọc theo mức độ</div>
          <div style={{ width: 300 }}>
            <CheckboxGroup
              options={options.map((opt) => ({
                ...opt,
                checked: selectedRiskLevels.includes(opt.value),
                onChange: () => {
                  onRiskLevelChange(opt.value);
                },
              }))}
              className='flex'
            />
          </div>
        </div>
        <div>
          <div className='text-black py-4 font-medium'>
            Chỉ số rủi ro: {minRisk.toFixed(1)} - {maxRisk.toFixed(1)}
          </div>
          <div className='w-64 space-y-2'>
            <div>
              <label className='text-sm text-gray-600 block mb-1'>Tối thiểu</label>
              <input
                type='range'
                min='0'
                max='10'
                step='0.1'
                value={minRisk}
                onChange={handleMinRiskChange}
                className='w-full'
              />
              <div className='text-xs text-gray-500 mt-1'>{minRisk.toFixed(1)}</div>
            </div>
            <div>
              <label className='text-sm text-gray-600 block mb-1'>Tối đa</label>
              <input
                type='range'
                min='0'
                max='10'
                step='0.1'
                value={maxRisk}
                onChange={handleMaxRiskChange}
                className='w-full'
              />
              <div className='text-xs text-gray-500 mt-1'>{maxRisk.toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
