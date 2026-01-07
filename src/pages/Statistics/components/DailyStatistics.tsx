import { useMemo } from 'react';
import { FaCloudRain, FaExclamationTriangle, FaChartLine } from 'react-icons/fa';
import { mockWards } from '../../../mockData';
import { calcFloodRiskIndex, getRiskLevel } from '../../PageView/Partials/floodRiskUtils';
import { Select, Table } from '../../../components';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';
import type { DailyStatisticsProps } from '../../../types';

const DailyStatistics = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
}: DailyStatisticsProps) => {
  // Generate mock daily data for the selected month
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const data = [];

    // Simple seeded random function for consistent mock data
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dateStr = date.toISOString().split('T')[0];
      const seed = date.getTime();

      // Mock data with seeded random for consistency
      const avgRainfall = 100 + seededRandom(seed) * 150;
      const avgWaterLevel = 1.5 + seededRandom(seed + 1) * 2;
      const highRiskCount = Math.floor(seededRandom(seed + 2) * 5) + 3;
      const mediumRiskCount = Math.floor(seededRandom(seed + 3) * 7) + 4;
      const lowRiskCount = mockWards.length - highRiskCount - mediumRiskCount;

      const wardStats = mockWards.map((ward) => {
        const exposure = ward.population_density / 1000 + avgRainfall / 200;
        const susceptibility = ward.low_elevation + ward.urban_land;
        const resilience = ward.drainage_capacity || 1;
        const floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
        const riskLevel = getRiskLevel(floodRisk);
        return {
          ward_name: ward.ward_name,
          flood_risk: floodRisk,
          risk_level: riskLevel,
        };
      });

      const avgRisk = wardStats.reduce((sum, w) => sum + w.flood_risk, 0) / wardStats.length;

      data.push({
        date: dateStr,
        day: day,
        avgRainfall: Math.round(avgRainfall),
        avgWaterLevel: parseFloat(avgWaterLevel.toFixed(2)),
        avgRisk: parseFloat(avgRisk.toFixed(2)),
        highRisk: highRiskCount,
        mediumRisk: mediumRiskCount,
        lowRisk: lowRiskCount,
      });
    }

    return data;
  }, [selectedYear, selectedMonth]);

  const maxRainfall = Math.max(...dailyData.map((d) => d.avgRainfall));
  const maxRisk = Math.max(...dailyData.map((d) => d.avgRisk));

  // Format date function
  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const dayOfWeek = date.getDay();
    const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    return `${day}/${month} (${dayNames[dayOfWeek]})`;
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
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

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Select
            label='Năm'
            options={years.map((year) => ({
              value: year,
              label: year.toString(),
            }))}
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
          />
          <Select
            label='Tháng'
            options={months.map((month) => ({
              value: month,
              label: monthNames[month - 1],
            }))}
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-3 bg-blue-500/20 rounded-lg'>
              <FaCloudRain
                className={`text-xl ${theme === 'light' ? 'text-blue-600' : 'text-blue-400'}`}
              />
            </div>
            <div>
              <div className={`${themeClasses.textSecondary} text-sm`}>Lượng mưa TB</div>
              <div className={`text-2xl font-bold ${themeClasses.text}`}>
                {Math.round(
                  dailyData.reduce((sum, d) => sum + d.avgRainfall, 0) / dailyData.length
                )}{' '}
                mm
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-3 bg-orange-500/20 rounded-lg'>
              <FaChartLine
                className={`text-xl ${theme === 'light' ? 'text-orange-600' : 'text-orange-400'}`}
              />
            </div>
            <div>
              <div className={`${themeClasses.textSecondary} text-sm`}>Chỉ số rủi ro TB</div>
              <div className={`text-2xl font-bold ${themeClasses.text}`}>
                {(dailyData.reduce((sum, d) => sum + d.avgRisk, 0) / dailyData.length).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className='flex items-center gap-3 mb-3'>
            <div className='p-3 bg-red-500/20 rounded-lg'>
              <FaExclamationTriangle
                className={`text-xl ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}
              />
            </div>
            <div>
              <div className={`${themeClasses.textSecondary} text-sm`}>Ngày rủi ro cao</div>
              <div className={`text-2xl font-bold ${themeClasses.text}`}>
                {dailyData.filter((d) => d.avgRisk >= 3.5).length} ngày
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Rainfall Chart */}
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-6`}
        >
          <h3 className='text-lg font-semibold ${themeClasses.text} mb-4'>Lượng mưa theo ngày</h3>
          <div className='space-y-2'>
            {dailyData.map((data) => {
              const date = new Date(selectedYear, selectedMonth - 1, data.day);
              return (
                <div key={data.date} className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span className={`${themeClasses.textSecondary}`}>{formatDate(date)}</span>
                    <span className={`${themeClasses.text} font-medium`}>
                      {data.avgRainfall} mm
                    </span>
                  </div>
                  <div className='w-full bg-gray-600 rounded-full h-2 overflow-hidden'>
                    <div
                      className='bg-indigo-500 h-full rounded-full transition-all'
                      style={{
                        width: `${(data.avgRainfall / maxRainfall) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Risk Index Chart */}
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-6`}
        >
          <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>
            Chỉ số rủi ro theo ngày
          </h3>
          <div className='space-y-2'>
            {dailyData.map((data) => {
              const date = new Date(selectedYear, selectedMonth - 1, data.day);
              const riskColor =
                data.avgRisk >= 3.5
                  ? 'bg-red-500'
                  : data.avgRisk >= 2.0
                  ? 'bg-orange-400'
                  : 'bg-green-400';
              return (
                <div key={data.date} className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span className='${themeClasses.textSecondary}'>{formatDate(date)}</span>
                    <span className='${themeClasses.text} font-medium'>
                      {data.avgRisk.toFixed(2)}
                    </span>
                  </div>
                  <div className='w-full bg-gray-600 rounded-full h-2 overflow-hidden'>
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

      {/* Risk Distribution Table */}
      <div className={`${themeClasses.backgroundTertiary} rounded-lg `}>
        <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>
          Phân bố rủi ro theo ngày - {monthNames[selectedMonth - 1]} {selectedYear}
        </h3>
        <Table
          columns={[
            {
              header: 'Ngày',
              accessor: 'day',
              render: (value, row) =>
                formatDate(new Date(selectedYear, selectedMonth - 1, row.day)),
            },
            {
              header: 'Rủi ro Cao',
              accessor: 'highRisk',
              render: (value) => `${Number(value)} khu vực`,
            },
            {
              header: 'Rủi ro Trung bình',
              accessor: 'mediumRisk',
              render: (value) => `${Number(value)} khu vực`,
            },
            {
              header: 'Rủi ro Thấp',
              accessor: 'lowRisk',
              render: (value) => `${Number(value)} khu vực`,
            },
            {
              header: 'Chỉ số TB',
              accessor: 'avgRisk',
              render: (value) => parseFloat(String(value)).toFixed(2),
            },
          ]}
          data={dailyData}
          emptyMessage='Không có dữ liệu cho tháng này'
        />
      </div>
    </div>
  );
};

export default DailyStatistics;
