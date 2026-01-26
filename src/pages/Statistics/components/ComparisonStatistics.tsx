import { useMemo } from 'react';
import {
  FaBalanceScale,
  FaChartLine,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaSpinner,
} from 'react-icons/fa';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

import type { ComparisonStatisticsProps } from '../../../types';
import type { WeatherData, RiskIndexData } from '../../../types/dataManagement';
import { Input, Table } from '../../../components';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';
import { useComparisonStatistics } from '../../../hooks/useStatistics';

const ComparisonStatistics = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: ComparisonStatisticsProps) => {
  const { data: apiData, isLoading } = useComparisonStatistics(startDate, endDate);

  const comparisonData = useMemo(() => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const diffDays = end.diff(start, 'day') + 1;

    // Split into two periods
    const period1Start = start;
    const period1End = start.add(Math.floor(diffDays / 2) - 1, 'day').endOf('day');
    const period2Start = period1End.add(1, 'day').startOf('day');
    const period2End = end;

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    // If API data is available, process it
    if (apiData && apiData.weatherData && apiData.riskData) {
      // Filter data for period 1
      const period1Weather = apiData.weatherData.filter((w: WeatherData & { recorded_at?: string }) => {
        const date = dayjs(w.date || w.recorded_at || '');
        return date.isValid() && date.isSameOrAfter(period1Start) && date.isSameOrBefore(period1End);
      });

      const period1Risk = apiData.riskData.filter((r: RiskIndexData & { createdAt?: string; risk_category?: string }) => {
        const date = dayjs(r.date || r.createdAt || '');
        return date.isValid() && date.isSameOrAfter(period1Start) && date.isSameOrBefore(period1End);
      });

      // Filter data for period 2
      const period2Weather = apiData.weatherData.filter((w: WeatherData & { recorded_at?: string }) => {
        const date = dayjs(w.date || w.recorded_at || '');
        return date.isValid() && date.isSameOrAfter(period2Start) && date.isSameOrBefore(period2End);
      });

      const period2Risk = apiData.riskData.filter((r: RiskIndexData & { createdAt?: string; risk_category?: string }) => {
        const date = dayjs(r.date || r.createdAt || '');
        return date.isValid() && date.isSameOrAfter(period2Start) && date.isSameOrBefore(period2End);
      });

      // Calculate period 1 statistics
      const period1AvgRainfall =
        period1Weather.length > 0
          ? period1Weather.reduce((sum: number, w: WeatherData) => sum + (w.rainfall || 0), 0) / period1Weather.length
          : 0;

      const period1AvgRisk =
        period1Risk.length > 0
          ? period1Risk.reduce((sum: number, r: RiskIndexData) => sum + (r.risk_index || 0), 0) / period1Risk.length
          : 0;

      const period1HighRiskDays = period1Risk.filter(
        (r: RiskIndexData & { risk_category?: string }) => r.risk_category === 'High' || r.risk_category === 'Cao'
      ).length;

      const period1RiskValues = period1Risk.map((r: RiskIndexData) => r.risk_index || 0).filter((v: number) => v > 0);
      const period1MaxRisk = period1RiskValues.length > 0 ? Math.max(...period1RiskValues) : 0;
      const period1MinRisk = period1RiskValues.length > 0 ? Math.min(...period1RiskValues) : 0;

      // Calculate period 2 statistics
      const period2AvgRainfall =
        period2Weather.length > 0
          ? period2Weather.reduce((sum: number, w: WeatherData) => sum + (w.rainfall || 0), 0) / period2Weather.length
          : 0;

      const period2AvgRisk =
        period2Risk.length > 0
          ? period2Risk.reduce((sum: number, r: RiskIndexData) => sum + (r.risk_index || 0), 0) / period2Risk.length
          : 0;

      const period2HighRiskDays = period2Risk.filter(
        (r: RiskIndexData & { risk_category?: string }) => r.risk_category === 'High' || r.risk_category === 'Cao'
      ).length;

      const period2RiskValues = period2Risk.map((r: RiskIndexData) => r.risk_index || 0).filter((v: number) => v > 0);
      const period2MaxRisk = period2RiskValues.length > 0 ? Math.max(...period2RiskValues) : 0;
      const period2MinRisk = period2RiskValues.length > 0 ? Math.min(...period2RiskValues) : 0;

      return {
        period1: {
          avgRainfall: period1AvgRainfall,
          avgRisk: parseFloat(period1AvgRisk.toFixed(2)),
          highRiskDays: period1HighRiskDays,
          totalDays: Math.floor(diffDays / 2),
          maxRisk: parseFloat(period1MaxRisk.toFixed(2)),
          minRisk: parseFloat(period1MinRisk.toFixed(2)),
          label: `Giai đoạn 1 (${period1Start.format('DD/MM/YYYY')} - ${period1End.format('DD/MM/YYYY')})`,
        },
        period2: {
          avgRainfall: period2AvgRainfall,
          avgRisk: parseFloat(period2AvgRisk.toFixed(2)),
          highRiskDays: period2HighRiskDays,
          totalDays: Math.ceil(diffDays / 2),
          maxRisk: parseFloat(period2MaxRisk.toFixed(2)),
          minRisk: parseFloat(period2MinRisk.toFixed(2)),
          label: `Giai đoạn 2 (${period2Start.format('DD/MM/YYYY')} - ${period2End.format('DD/MM/YYYY')})`,
        },
        changes: {
          rainfall: calculateChange(period2AvgRainfall, period1AvgRainfall),
          risk: calculateChange(period2AvgRisk, period1AvgRisk),
          highRiskDays: calculateChange(period2HighRiskDays, period1HighRiskDays),
        },
      };
    } else {
      // Fallback to mock data
      const seededRandom = (seed: number) => {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
      };

      const period1Seed = start.valueOf();
      const period2Seed = period2Start.valueOf();

      const period1Data = {
        avgRainfall: 120 + seededRandom(period1Seed) * 80,
        avgRisk: 2.5 + seededRandom(period1Seed + 1) * 1.5,
        highRiskDays: Math.floor((diffDays / 2) * 0.3),
        totalDays: Math.floor(diffDays / 2),
        maxRisk: 3.5 + seededRandom(period1Seed + 2) * 1.5,
        minRisk: 1.5 + seededRandom(period1Seed + 3) * 0.5,
      };

      const period2Data = {
        avgRainfall: 100 + seededRandom(period2Seed) * 100,
        avgRisk: 2.0 + seededRandom(period2Seed + 1) * 2.0,
        highRiskDays: Math.floor((diffDays / 2) * 0.25),
        totalDays: Math.ceil(diffDays / 2),
        maxRisk: 3.0 + seededRandom(period2Seed + 2) * 2.0,
        minRisk: 1.0 + seededRandom(period2Seed + 3) * 1.0,
      };

      return {
        period1: {
          ...period1Data,
          label: `Giai đoạn 1 (${period1Start.format('DD/MM/YYYY')} - ${period1End.format('DD/MM/YYYY')})`,
        },
        period2: {
          ...period2Data,
          label: `Giai đoạn 2 (${period2Start.format('DD/MM/YYYY')} - ${period2End.format('DD/MM/YYYY')})`,
        },
        changes: {
          rainfall: calculateChange(period2Data.avgRainfall, period1Data.avgRainfall),
          risk: calculateChange(period2Data.avgRisk, period1Data.avgRisk),
          highRiskDays: calculateChange(period2Data.highRiskDays, period1Data.highRiskDays),
        },
      };
    }
  }, [startDate, endDate, apiData]);

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 gap-3 ${themeClasses.text}`}>
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <p className="text-lg">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Date Range Filters */}
      <div
        className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-4`}
      >
        <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>
          Chọn khoảng thời gian so sánh
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Input
            label='Ngày bắt đầu'
            type='date'
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
          <Input
            label='Ngày kết thúc'
            type='date'
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>
        <div className={`mt-4 text-sm ${themeClasses.textSecondary}`}>
          Hệ thống sẽ tự động chia khoảng thời gian thành 2 giai đoạn để so sánh
        </div>
      </div>

      {/* Comparison Summary */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className='flex items-center gap-3 mb-3'>
            <FaBalanceScale className='text-indigo-400 text-xl' />
            <div className='${themeClasses.textSecondary} text-sm'>Thay đổi Lượng mưa</div>
          </div>
          <div
            className={`text-2xl font-bold flex items-center gap-2 ${
              comparisonData.changes.rainfall >= 0 ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {comparisonData.changes.rainfall >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(comparisonData.changes.rainfall).toFixed(1)}%
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className='flex items-center gap-3 mb-3'>
            <FaChartLine className='text-orange-400 text-xl' />
            <div className='${themeClasses.textSecondary} text-sm'>Thay đổi Chỉ số Rủi ro</div>
          </div>
          <div
            className={`text-2xl font-bold flex items-center gap-2 ${
              comparisonData.changes.risk >= 0 ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {comparisonData.changes.risk >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(comparisonData.changes.risk).toFixed(1)}%
          </div>
        </div>
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-5`}
        >
          <div className='flex items-center gap-3 mb-3'>
            <FaExclamationTriangle className='text-red-400 text-xl' />
            <div className={`${themeClasses.textSecondary} text-sm`}>Thay đổi Ngày Rủi ro Cao</div>
          </div>
          <div
            className={`text-2xl font-bold flex items-center gap-2 ${
              comparisonData.changes.highRiskDays >= 0 ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {comparisonData.changes.highRiskDays >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(comparisonData.changes.highRiskDays).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Period Comparison Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Period 1 */}
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-6`}
        >
          <h3 className='text-lg font-semibold ${themeClasses.text} mb-4'>
            {comparisonData.period1.label}
          </h3>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between mb-2'>
                <span className={`${themeClasses.textSecondary}`}>Lượng mưa TB</span>
                <span className={`${themeClasses.text} font-bold`}>
                  {Math.round(comparisonData.period1.avgRainfall)} mm
                </span>
              </div>
              <div className='w-full bg-gray-600 rounded-full h-3'>
                <div
                  className='bg-indigo-500 h-full rounded-full'
                  style={{
                    width: `${Math.min((comparisonData.period1.avgRainfall / 200) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className='flex justify-between mb-2'>
                <span className={`${themeClasses.textSecondary}`}>Chỉ số rủi ro TB</span>
                <span className={`${themeClasses.text} font-bold`}>
                  {comparisonData.period1.avgRisk.toFixed(2)}
                </span>
              </div>
              <div className='w-full bg-gray-600 rounded-full h-3'>
                <div
                  className='bg-orange-400 h-full rounded-full'
                  style={{
                    width: `${Math.min((comparisonData.period1.avgRisk / 5) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4 mt-4'>
              <div>
                <div className={`${themeClasses.textSecondary} text-sm`}>Ngày rủi ro cao</div>
                <div className='text-xl font-bold text-red-400'>
                  {comparisonData.period1.highRiskDays}
                </div>
              </div>
              <div>
                <div className={`${themeClasses.textSecondary} text-sm`}>Tổng số ngày</div>
                <div className='text-xl font-bold ${themeClasses.text}'>
                  {comparisonData.period1.totalDays}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Period 2 */}
        <div
          className={`${themeClasses.backgroundTertiary} border ${themeClasses.border} rounded-lg p-6`}
        >
          <h3 className='text-lg font-semibold ${themeClasses.text} mb-4'>
            {comparisonData.period2.label}
          </h3>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between mb-2'>
                <span className={`${themeClasses.textSecondary}`}>Lượng mưa TB</span>
                <span className={`${themeClasses.text} font-bold`}>
                  {Math.round(comparisonData.period2.avgRainfall)} mm
                </span>
              </div>
              <div className='w-full bg-gray-600 rounded-full h-3'>
                <div
                  className='bg-indigo-500 h-full rounded-full'
                  style={{
                    width: `${Math.min((comparisonData.period2.avgRainfall / 200) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className='flex justify-between mb-2'>
                <span className={`${themeClasses.textSecondary}`}>Chỉ số rủi ro TB</span>
                <span className={`${themeClasses.text} font-bold`}>
                  {comparisonData.period2.avgRisk.toFixed(2)}
                </span>
              </div>
              <div className='w-full bg-gray-600 rounded-full h-3'>
                <div
                  className='bg-orange-400 h-full rounded-full'
                  style={{
                    width: `${Math.min((comparisonData.period2.avgRisk / 5) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4 mt-4'>
              <div>
                <div className={`${themeClasses.textSecondary} text-sm`}>Ngày rủi ro cao</div>
                <div className='text-xl font-bold text-red-400'>
                  {comparisonData.period2.highRiskDays}
                </div>
              </div>
              <div>
                <div className={`${themeClasses.textSecondary} text-sm`}>Tổng số ngày</div>
                <div className='text-xl font-bold ${themeClasses.text}'>
                  {comparisonData.period2.totalDays}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Details Table */}
      <div className={`${themeClasses.backgroundTertiary} `}>
        <h3 className={`text-lg font-semibold mb-4 ${themeClasses.text}`}>Bảng so sánh chi tiết</h3>
        <Table
          columns={[
            { header: 'Chỉ số', accessor: 'metric' },
            { header: comparisonData.period1.label, accessor: 'period1' },
            { header: comparisonData.period2.label, accessor: 'period2' },
            {
              header: 'Thay đổi',
              accessor: 'change',
              render: (_, row) => {
                if (
                  row.metric === 'Lượng mưa TB (mm)' ||
                  row.metric === 'Chỉ số rủi ro TB' ||
                  row.metric === 'Ngày rủi ro cao'
                ) {
                  const changeValue = row.change;
                  const isPositive = changeValue >= 0;
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
                      {Math.abs(changeValue).toFixed(1)}%
                    </span>
                  );
                }
                return <span className={themeClasses.textSecondary}>-</span>;
              },
            },
          ]}
          data={[
            {
              metric: 'Lượng mưa TB (mm)',
              period1: Math.round(comparisonData.period1.avgRainfall),
              period2: Math.round(comparisonData.period2.avgRainfall),
              change: comparisonData.changes.rainfall,
            },
            {
              metric: 'Chỉ số rủi ro TB',
              period1: comparisonData.period1.avgRisk.toFixed(2),
              period2: comparisonData.period2.avgRisk.toFixed(2),
              change: comparisonData.changes.risk,
            },
            {
              metric: 'Ngày rủi ro cao',
              period1: comparisonData.period1.highRiskDays,
              period2: comparisonData.period2.highRiskDays,
              change: comparisonData.changes.highRiskDays,
            },
          ]}
          emptyMessage='Không có dữ liệu so sánh'
        />
      </div>
    </div>
  );
};
export default ComparisonStatistics;
