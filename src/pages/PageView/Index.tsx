import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ChangeEvent } from 'react';
import FloodMapView from './Partials/FloodMapView';
import FilterSection from './Partials/FilterSection';
import { mockWards } from './Partials/mockData';

const PageView = () => {
  const [searchParams] = useSearchParams();

  const getInitialWard = () => {
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      const matchingWard = mockWards.find((ward) =>
        ward.ward_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchingWard?.ward_name || '';
    }
    return '';
  };

  const [selectedWard, setSelectedWard] = useState<string>(getInitialWard);
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<string[]>([
    'cao',
    'trungBinh',
    'thap',
  ]);
  const [riskIndexRange, setRiskIndexRange] = useState<[number, number]>([0, 10]);
  const [filteredCount, setFilteredCount] = useState<number>(0);

  const wardOptions = mockWards.map((ward) => ({
    label: ward.ward_name,
    value: ward.ward_name,
  }));

  const handleWardChange = (
    event: ChangeEvent<HTMLInputElement> | (Event & { target: { value: unknown; name: string } })
  ) => {
    const value = 'target' in event ? String(event.target.value) : '';
    setSelectedWard(value);
  };

  const handleRiskLevelChange = (value: string) => {
    setSelectedRiskLevels((prev) => {
      if (prev.includes(value)) {
        return prev.filter((level) => level !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  const handleRiskIndexRangeChange = (min: number, max: number) => {
    setRiskIndexRange([min, max]);
  };

  const handleResetFilters = () => {
    setSelectedWard('');
    setSelectedRiskLevels(['cao', 'trungBinh', 'thap']);
    setRiskIndexRange([0, 10]);
  };

  useEffect(() => {
    const searchTerm = searchParams.get('search');
    if (searchTerm) {
      const matchingWard = mockWards.find((ward) =>
        ward.ward_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchingWard && matchingWard.ward_name !== selectedWard) {
        setSelectedWard(matchingWard.ward_name);
      }
    } else if (selectedWard) {
      setSelectedWard('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className='w-[80%]'>
      <div className='text-white text-3xl p-2'>Bản đồ khu vực TP.HCM. Dữ liệu bản đồ</div>
      <FloodMapView
        selectedWard={selectedWard}
        selectedRiskLevels={selectedRiskLevels}
        riskIndexRange={riskIndexRange}
        onFilteredCountChange={setFilteredCount}
      />
      <FilterSection
        selectedWard={selectedWard}
        selectedRiskLevels={selectedRiskLevels}
        riskIndexRange={riskIndexRange}
        filteredCount={filteredCount}
        wardOptions={wardOptions}
        onWardChange={handleWardChange}
        onRiskLevelChange={handleRiskLevelChange}
        onRiskIndexRangeChange={handleRiskIndexRangeChange}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};

export default PageView;
