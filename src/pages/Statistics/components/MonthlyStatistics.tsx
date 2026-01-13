import { useMemo } from 'react';
import {
  FaCalendarAlt,
  FaCloudRain,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
} from 'react-icons/fa';

import type { MonthlyStatisticsProps } from '../../../types';
import { formatNumber } from '../../../utils/formatUtils';
import { Select, Table } from '../../../components';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

const MonthlyStatistics = ({ selectedYear, onYearChange }: MonthlyStatisticsProps) => {
  const monthlyData = useMemo(() => {
    const months = [];
    const monthNames = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ];

    // Simple seeded random function for consistent mock data
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let month = 1; month <= 12; month++) {
      const seed = selectedYear * 100 + month;
      // Mock data with seeded random for consistency
      const avgRainfall = 80 + seededRandom(seed) * 120;
      const avgRisk = 2.0 + seededRandom(seed + 1) * 2.5;
      const highRiskDays = Math.floor(seededRandom(seed + 2) * 10) + 5;
      const totalDays = new Date(selectedYear, month, 0).getDate();

      months.push({
        month,
        monthName: monthNames[month - 1],
        avgRainfall: Math.round(avgRainfall),
        avgRisk: parseFloat(avgRisk.toFixed(2)),
        highRiskDays,
        totalDays,
        maxRainfall: Math.round(avgRainfall * 1.5),
        minRainfall: Math.round(avgRainfall * 0.5),
      });
    }

    return months;
  }, [selectedYear]);

  const totalRainfall = monthlyData.reduce((sum, m) => sum + m.avgRainfall, 0);
  const avgRiskYear = (monthlyData.reduce((sum, m) => sum + m.avgRisk, 0) / 12).toFixed(2);
  const totalHighRiskDays = monthlyData.reduce((sum, m) => sum + m.highRiskDays, 0);

  const maxRainfall = Math.max(...monthlyData.map((m) => m.avgRainfall));
  const maxRisk = Math.max(...monthlyData.map((m) => m.avgRisk));

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  // Calculate trends
  const firstHalfAvg = monthlyData.slice(0, 6).reduce((sum, m) => sum + m.avgRisk, 0) / 6;
  const secondHalfAvg = monthlyData.slice(6, 12).reduce((sum, m) => sum + m.avgRisk, 0) / 6;
  const trend = secondHalfAvg > firstHalfAvg ? 'up' : 'down';

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className='space-y-6'>
      {/* Filter */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
      >
        <div className='max-w-xs'>
          <Select
            label='Năm'
            options={years.map((year) => ({
              value: year,
              label: year.toString(),
            }))}
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className='flex items-center gap-3 mb-2'>
            <FaCloudRain className='text-indigo-400 text-xl' />
            <div className='${themeClasses.textSecondary} text-sm'>Tổng lượng mưa</div>
          </div>
          <div className='text-2xl font-bold ${themeClasses.text}'>
            {formatNumber(totalRainfall)} mm
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className='flex items-center gap-3 mb-2'>
            <FaCalendarAlt className='text-orange-400 text-xl' />
            <div className='${themeClasses.textSecondary} text-sm'>Chỉ số rủi ro TB</div>
          </div>
          <div className='text-2xl font-bold ${themeClasses.text}'>{avgRiskYear}</div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className='flex items-center gap-3 mb-2'>
            <FaExclamationTriangle className='text-red-400 text-xl' />
            <div className='${themeClasses.textSecondary} text-sm'>Ngày rủi ro cao</div>
          </div>
          <div className='text-2xl font-bold text-red-400'>{totalHighRiskDays} ngày</div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className='flex items-center gap-3 mb-2'>
            {trend === 'up' ? (
              <FaArrowUp className='text-red-400 text-xl' />
            ) : (
              <FaArrowDown className='text-green-400 text-xl' />
            )}
            <div className='${themeClasses.textSecondary} text-sm'>Xu hướng</div>
          </div>
          <div className='flex items-center gap-2'>
            <span
              className={`text-xl font-bold ${trend === 'up' ? 'text-red-400' : 'text-green-400'}`}
            >
              {trend === 'up' ? 'Tăng' : 'Giảm'}
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Rainfall Chart */}
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-6`}
        >
          <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>
            Lượng mưa trung bình theo tháng
          </h3>
          <div className='space-y-3 max-h-64 overflow-y-auto'>
            {monthlyData.map((data) => (
              <div key={data.month} className='space-y-1'>
                <div className='flex justify-between text-sm'>
                  <span className='${themeClasses.textSecondary}'>{data.monthName}</span>
                  <span className='${themeClasses.text} font-medium'>{data.avgRainfall} mm</span>
                </div>
                <div className='w-full bg-gray-600 rounded-full h-3 overflow-hidden'>
                  <div
                    className='bg-indigo-500 h-full rounded-full transition-all'
                    style={{
                      width: `${(data.avgRainfall / maxRainfall) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Index Chart */}
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-6`}
        >
          <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>
            Chỉ số rủi ro trung bình theo tháng
          </h3>
          <div className='space-y-3 max-h-64 overflow-y-auto'>
            {monthlyData.map((data) => {
              const riskColor =
                data.avgRisk >= 3.5
                  ? 'bg-red-500'
                  : data.avgRisk >= 2.0
                  ? 'bg-orange-400'
                  : 'bg-green-400';
              return (
                <div key={data.month} className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span className={`${themeClasses.textSecondary}`}>{data.monthName}</span>
                    <span className={`${themeClasses.text} font-medium`}>
                      {data.avgRisk.toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-gray-600 rounded-full h-3 overflow-hidden'>
                    <div
                      className={`${riskColor} h-full rounded-full transition-all`}
                      style={{
                        width: `${(data.avgRisk / maxRisk) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Data Table */}
      <div className={`${themeClasses.backgroundTertiary} rounded-lg `}>
        <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>
          Thống kê theo tháng - Năm {selectedYear}
        </h3>
        <div className='max-h-96 overflow-y-auto'>
          <Table
            columns={[
              { header: 'Tháng', accessor: 'monthName' },
              {
                header: 'Lượng mưa TB (mm)',
                accessor: 'avgRainfall',
                render: (value) => Math.round(Number(value)),
              },
              {
                header: 'Chỉ số rủi ro TB',
                accessor: 'avgRisk',
                render: (value) => parseFloat(String(value)).toFixed(2),
              },
              {
                header: 'Ngày rủi ro cao',
                accessor: 'highRiskDays',
                render: (value) => `${Number(value)} ngày`,
              },
            ]}
            data={monthlyData}
            emptyMessage='Không có dữ liệu cho năm này'
          />
        </div>
      </div>
    </div>
  );
};

export default MonthlyStatistics;
