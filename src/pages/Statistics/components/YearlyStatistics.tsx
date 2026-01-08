import { useMemo, useState } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { Table, Select } from '../../../components';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

const YearlyStatistics = () => {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear() - 4);
  const yearlyData = useMemo(() => {
    const years = [];

    // Simple seeded random function for consistent mock data
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    for (let year = startYear; year <= startYear + 4; year++) {
      const seed = year * 1000;
      // Mock data with seeded random for consistency
      const totalRainfall = 1200 + seededRandom(seed) * 800;
      const avgRisk = 2.0 + seededRandom(seed + 1) * 2.0;
      const highRiskMonths = Math.floor(seededRandom(seed + 2) * 6) + 2;
      const totalHighRiskDays = Math.floor(seededRandom(seed + 3) * 100) + 50;

      years.push({
        year,
        totalRainfall: Math.round(totalRainfall),
        avgRisk: parseFloat(avgRisk.toFixed(2)),
        highRiskMonths,
        totalHighRiskDays,
        maxRisk: parseFloat((avgRisk + seededRandom(seed + 4) * 1.5).toFixed(2)),
        minRisk: parseFloat((avgRisk - seededRandom(seed + 5) * 0.5).toFixed(2)),
      });
    }

    return years;
  }, [startYear]);

  const maxRainfall = Math.max(...yearlyData.map((y) => y.totalRainfall));
  const maxRisk = Math.max(...yearlyData.map((y) => y.avgRisk));

  // Generate year options for filter (from 2010 to current year)
  const yearOptions = Array.from(
    { length: new Date().getFullYear() - 2010 + 1 },
    (_, i) => new Date().getFullYear() - i
  ).map((year) => ({
    value: year,
    label: year.toString(),
  }));

  // Calculate year-over-year changes
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  return (
    <div className='space-y-6'>
      {/* Filters */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
      >
        <div className='max-w-xs'>
          <Select
            label='Năm bắt đầu'
            options={yearOptions}
            value={startYear}
            onChange={(e) => setStartYear(parseInt(e.target.value))}
          />
        </div>
        <div className={`mt-2 text-sm ${themeClasses.textSecondary}`}>
          Hiển thị dữ liệu từ năm {startYear} đến năm {startYear + 4}
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className={`${themeClasses.textSecondary} text-sm mb-2`}>Năm gần nhất</div>
          <div className={`text-2xl font-bold ${themeClasses.text}`}>
            {yearlyData[yearlyData.length - 1]?.year}
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className={`${themeClasses.textSecondary} text-sm mb-2`}>Tổng lượng mưa</div>
          <div className={`text-2xl font-bold ${themeClasses.text}`}>
            {yearlyData[yearlyData.length - 1]?.totalRainfall.toLocaleString()} mm
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className={`${themeClasses.textSecondary} text-sm mb-2`}>Chỉ số rủi ro TB</div>
          <div className={`text-2xl font-bold ${themeClasses.text}`}>
            {yearlyData[yearlyData.length - 1]?.avgRisk.toFixed(2)}
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className={`${themeClasses.textSecondary} text-sm mb-2`}>Tháng rủi ro cao</div>
          <div
            className={`text-2xl font-bold ${theme === 'light' ? 'text-red-600' : 'text-red-400'}`}
          >
            {yearlyData[yearlyData.length - 1]?.highRiskMonths} tháng
          </div>
        </div>
      </div>

      {/* Yearly Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Rainfall Chart */}
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-6`}
        >
          <h3 className={`text-lg font-semibold ${themeClasses.text} mb-4`}>
            Tổng lượng mưa theo năm
          </h3>
          <div className='space-y-4'>
            {yearlyData.map((data, index) => {
              const previousYear = yearlyData[index - 1];
              const change = previousYear
                ? calculateChange(data.totalRainfall, previousYear.totalRainfall)
                : 0;
              return (
                <div key={data.year} className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className={`${themeClasses.textSecondary} font-medium`}>
                      Năm {data.year}
                    </span>
                    <div className='flex items-center gap-2'>
                      {previousYear && (
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            change >= 0
                              ? theme === 'light'
                                ? 'text-red-600'
                                : 'text-red-400'
                              : theme === 'light'
                              ? 'text-green-600'
                              : 'text-green-400'
                          }`}
                        >
                          {change >= 0 ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                          {Math.abs(change).toFixed(1)}%
                        </span>
                      )}
                      <span className={`font-bold ${themeClasses.text}`}>
                        {data.totalRainfall.toLocaleString()} mm
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-full ${
                      theme === 'light' ? 'bg-gray-300' : 'bg-gray-600'
                    } rounded-full h-4 overflow-hidden`}
                  >
                    <div
                      className={`${
                        theme === 'light' ? 'bg-blue-600' : 'bg-blue-400'
                      } h-full rounded-full transition-all`}
                      style={{
                        width: `${(data.totalRainfall / maxRainfall) * 100}%`,
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
            Chỉ số rủi ro trung bình theo năm
          </h3>
          <div className='space-y-4'>
            {yearlyData.map((data, index) => {
              const previousYear = yearlyData[index - 1];
              const change = previousYear ? calculateChange(data.avgRisk, previousYear.avgRisk) : 0;
              const riskColor =
                data.avgRisk >= 3.5
                  ? theme === 'light'
                    ? 'bg-red-600'
                    : 'bg-red-400'
                  : data.avgRisk >= 2.0
                  ? theme === 'light'
                    ? 'bg-orange-600'
                    : 'bg-orange-400'
                  : theme === 'light'
                  ? 'bg-green-600'
                  : 'bg-green-400';
              return (
                <div key={data.year} className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className={`${themeClasses.textSecondary} font-medium`}>
                      Năm {data.year}
                    </span>
                    <div className='flex items-center gap-2'>
                      {previousYear && (
                        <span
                          className={`text-xs flex items-center gap-1 ${
                            change >= 0
                              ? theme === 'light'
                                ? 'text-red-600'
                                : 'text-red-400'
                              : theme === 'light'
                              ? 'text-green-600'
                              : 'text-green-400'
                          }`}
                        >
                          {change >= 0 ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                          {Math.abs(change).toFixed(1)}%
                        </span>
                      )}
                      <span className={`font-bold ${themeClasses.text}`}>
                        {data.avgRisk.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`w-full ${
                      theme === 'light' ? 'bg-gray-300' : 'bg-gray-600'
                    } rounded-full h-4 overflow-hidden`}
                  >
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

      {/* Yearly Statistics Table */}
      <div className={`${themeClasses.backgroundTertiary}`}>
        <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>
          Thống kê theo năm ({startYear} - {startYear + 4})
        </h3>
        <Table
          columns={[
            { header: 'Năm', accessor: 'year' },
            {
              header: 'Tổng lượng mưa (mm)',
              accessor: 'totalRainfall',
              render: (value) => `${Number(value).toLocaleString()} mm`,
            },
            {
              header: 'Chỉ số rủi ro TB',
              accessor: 'avgRisk',
              render: (value) => parseFloat(String(value)).toFixed(2),
            },
            {
              header: 'Tháng rủi ro cao',
              accessor: 'highRiskMonths',
              render: (value) => `${Number(value)} tháng`,
            },
            {
              header: 'Ngày rủi ro cao',
              accessor: 'totalHighRiskDays',
              render: (value) => `${Number(value)} ngày`,
            },
            {
              header: 'Thay đổi (%)',
              accessor: 'year',
              render: (_, __, index) => {
                if (typeof index !== 'number' || index === 0) {
                  return <span className={themeClasses.textSecondary}>-</span>;
                }

                const currentYear = yearlyData?.[index];
                const previousYear = yearlyData?.[index - 1];

                if (!currentYear || !previousYear) {
                  return <span className={themeClasses.textSecondary}>-</span>;
                }

                const change = calculateChange(currentYear.avgRisk, previousYear.avgRisk);
                const isPositive = change >= 0;

                return (
                  <span
                    className={`flex items-center gap-1 ${
                      isPositive
                        ? theme === 'light'
                          ? 'text-red-600'
                          : 'text-red-400'
                        : theme === 'light'
                        ? 'text-green-600'
                        : 'text-green-400'
                    }`}
                  >
                    {isPositive ? <FaArrowUp size={14} /> : <FaArrowDown size={14} />}
                    {Math.abs(change).toFixed(1)}%
                  </span>
                );
              },
            },
          ]}
          data={yearlyData}
          emptyMessage='Không có dữ liệu thống kê'
        />
      </div>
    </div>
  );
};

export default YearlyStatistics;
