import { mockWards } from '../PageView/Partials/mockData';
import {
  calcFloodRiskIndex,
  getRiskLevel,
  getRiskLevelLabel,
} from '../PageView/Partials/floodRiskUtils';

export default function RiskReportPage() {
  const wardStats = mockWards.map((ward) => {
    const exposure = ward.population_density / 1000 + ward.rainfall / 200;
    const susceptibility = ward.low_elevation + ward.urban_land;
    const resilience = ward.drainage_capacity || 1;
    const floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
    const riskLevel = getRiskLevel(floodRisk);
    const levelLabel = getRiskLevelLabel(riskLevel);

    return {
      ...ward,
      exposure,
      susceptibility,
      resilience,
      flood_risk: floodRisk,
      risk_level: levelLabel,
    };
  });

  const highRisk = wardStats.filter((w) => w.risk_level === 'Cao').length;
  const mediumRisk = wardStats.filter((w) => w.risk_level === 'Trung Bình').length;
  const lowRisk = wardStats.filter((w) => w.risk_level === 'Thấp').length;

  const avgRisk = wardStats.reduce((sum, w) => sum + w.flood_risk, 0) / wardStats.length;
  const maxRisk = Math.max(...wardStats.map((w) => w.flood_risk));
  const minRisk = Math.min(...wardStats.map((w) => w.flood_risk));
  const avgPopulation =
    wardStats.reduce((sum, w) => sum + w.population_density, 0) / wardStats.length;
  const avgRainfall = wardStats.reduce((sum, w) => sum + w.rainfall, 0) / wardStats.length;

  return (
    <div className='w-[80%] p-6 h-full flex flex-col'>
      <div className='text-white text-3xl font-bold mb-4'>Báo cáo rủi ro ngập lụt</div>

      <div className='grid grid-cols-3 gap-4 mb-4'>
        <div className='bg-red-500/20 border border-red-500 rounded-lg p-4'>
          <div className='text-red-400 text-sm mb-1'>Rủi ro cao</div>
          <div className='text-white text-3xl font-bold'>{highRisk}</div>
          <div className='text-red-400 text-xs mt-1'>
            {((highRisk / wardStats.length) * 100).toFixed(1)}% tổng số
          </div>
        </div>
        <div className='bg-orange-300/20 border border-orange-300 rounded-lg p-4'>
          <div className='text-orange-300 text-sm mb-1'>Rủi ro trung bình</div>
          <div className='text-white text-3xl font-bold'>{mediumRisk}</div>
          <div className='text-orange-300 text-xs mt-1'>
            {((mediumRisk / wardStats.length) * 100).toFixed(1)}% tổng số
          </div>
        </div>
        <div className='bg-green-300/20 border border-green-300 rounded-lg p-4'>
          <div className='text-green-300 text-sm mb-1'>Rủi ro thấp</div>
          <div className='text-white text-3xl font-bold'>{lowRisk}</div>
          <div className='text-green-300 text-xs mt-1'>
            {((lowRisk / wardStats.length) * 100).toFixed(1)}% tổng số
          </div>
        </div>
      </div>

      <div className='grid grid-cols-4 gap-4 mb-6'>
        <div className='bg-gray-800/50 border border-gray-700 rounded-lg p-4'>
          <div className='text-gray-400 text-xs mb-1'>Chỉ số TB</div>
          <div className='text-white text-2xl font-bold'>{avgRisk.toFixed(2)}</div>
        </div>
        <div className='bg-gray-800/50 border border-gray-700 rounded-lg p-4'>
          <div className='text-gray-400 text-xs mb-1'>Chỉ số cao nhất</div>
          <div className='text-white text-2xl font-bold'>{maxRisk.toFixed(2)}</div>
        </div>
        <div className='bg-gray-800/50 border border-gray-700 rounded-lg p-4'>
          <div className='text-gray-400 text-xs mb-1'>Mật độ dân số TB</div>
          <div className='text-white text-2xl font-bold'>
            {Math.round(avgPopulation).toLocaleString()}
          </div>
        </div>
        <div className='bg-gray-800/50 border border-gray-700 rounded-lg p-4'>
          <div className='text-gray-400 text-xs mb-1'>Lượng mưa TB</div>
          <div className='text-white text-2xl font-bold'>{avgRainfall.toFixed(0)} mm</div>
        </div>
      </div>

      <div className='bg-[#0a1628] rounded-xl shadow-2xl overflow-hidden flex-1 flex flex-col'>
        <div className='overflow-x-auto flex-1'>
          <div className='h-full overflow-y-auto'>
            <table className='w-full text-white'>
              <thead className='sticky top-0 bg-[#0a1628] z-10 border-b border-gray-700'>
                <tr>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>STT</th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>
                    Tên phường/xã
                  </th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>
                    Chỉ số rủi ro
                  </th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>Mức độ</th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>
                    Mật độ dân số
                  </th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>Lượng mưa</th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>Độ cao thấp</th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>Đất đô thị</th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>
                    Khả năng thoát nước
                  </th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>Exposure</th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>
                    Susceptibility
                  </th>
                  <th className='text-left p-2 bg-[#0a1628] text-xs font-semibold'>Resilience</th>
                </tr>
              </thead>
              <tbody>
                {wardStats
                  .sort((a, b) => b.flood_risk - a.flood_risk)
                  .map((ward, index) => (
                    <tr
                      key={ward.ward_name}
                      className='border-b border-gray-800 hover:bg-gray-800/50 transition-colors'
                    >
                      <td className='p-3 text-gray-400'>{index + 1}</td>
                      <td className='p-3 font-medium'>{ward.ward_name}</td>
                      <td className='p-3'>
                        <span className='font-bold'>{ward.flood_risk.toFixed(2)}</span>
                      </td>
                      <td className='p-3'>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            ward.risk_level === 'Cao'
                              ? 'bg-red-500/20 text-red-400'
                              : ward.risk_level === 'Trung Bình'
                              ? 'bg-orange-300/20 text-orange-300'
                              : 'bg-green-300/20 text-green-300'
                          }`}
                        >
                          {ward.risk_level}
                        </span>
                      </td>
                      <td className='p-3 text-gray-300'>
                        {ward.population_density.toLocaleString()} người/km²
                      </td>
                      <td className='p-3 text-gray-300'>{ward.rainfall} mm</td>
                      <td className='p-3 text-gray-300'>{ward.low_elevation.toFixed(1)} m</td>
                      <td className='p-3 text-gray-300'>{ward.urban_land.toFixed(1)}</td>
                      <td className='p-3 text-gray-300'>{ward.drainage_capacity.toFixed(1)}</td>
                      <td className='p-3 text-gray-400 text-sm'>{ward.exposure.toFixed(2)}</td>
                      <td className='p-3 text-gray-400 text-sm'>
                        {ward.susceptibility.toFixed(2)}
                      </td>
                      <td className='p-3 text-gray-400 text-sm'>{ward.resilience.toFixed(2)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className='mt-4 flex justify-end gap-3 shrink-0'>
        <button
          onClick={() => window.print()}
          className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
        >
          In báo cáo
        </button>
      </div>
    </div>
  );
}
