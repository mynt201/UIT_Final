import { IoMdClose } from 'react-icons/io';
import { mockWards } from './mockData';
import {
  calcFloodRiskIndex,
  getRiskLevel,
  getRiskLevelLabel,
} from './floodRiskUtils';

interface RiskReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RiskReportModal({ isOpen, onClose }: RiskReportModalProps) {
  if (!isOpen) return null;

  const wardStats = mockWards.map((ward) => {
    const exposure = ward.population_density / 1000 + ward.rainfall / 200;
    const susceptibility = ward.low_elevation + ward.urban_land;
    const resilience = ward.drainage_capacity || 1;
    const floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
    const riskLevel = getRiskLevel(floodRisk);
    const levelLabel = getRiskLevelLabel(riskLevel);

    return {
      ward_name: ward.ward_name,
      flood_risk: floodRisk,
      risk_level: levelLabel,
    };
  });

  const highRisk = wardStats.filter((w) => w.risk_level === 'Cao').length;
  const mediumRisk = wardStats.filter((w) => w.risk_level === 'Trung Bình').length;
  const lowRisk = wardStats.filter((w) => w.risk_level === 'Thấp').length;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]'>
      <div className='bg-[#0a1628] rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col'>
        <div className='flex justify-between items-center p-6 border-b border-gray-700'>
          <h2 className='text-2xl font-bold text-white'>Báo cáo rủi ro ngập lụt</h2>
          <button
            onClick={onClose}
            className='p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors'
          >
            <IoMdClose size={24} className='text-white' />
          </button>
        </div>

        <div className='overflow-y-auto flex-1 p-6'>
          <div className='grid grid-cols-3 gap-4 mb-6'>
            <div className='bg-red-500/20 border border-red-500 rounded-lg p-4'>
              <div className='text-red-400 text-sm mb-1'>Rủi ro cao</div>
              <div className='text-white text-3xl font-bold'>{highRisk}</div>
            </div>
            <div className='bg-orange-300/20 border border-orange-300 rounded-lg p-4'>
              <div className='text-orange-300 text-sm mb-1'>Rủi ro trung bình</div>
              <div className='text-white text-3xl font-bold'>{mediumRisk}</div>
            </div>
            <div className='bg-green-300/20 border border-green-300 rounded-lg p-4'>
              <div className='text-green-300 text-sm mb-1'>Rủi ro thấp</div>
              <div className='text-white text-3xl font-bold'>{lowRisk}</div>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-white'>
              <thead>
                <tr className='border-b border-gray-700'>
                  <th className='text-left p-3'>Tên phường/xã</th>
                  <th className='text-left p-3'>Chỉ số rủi ro</th>
                  <th className='text-left p-3'>Mức độ</th>
                </tr>
              </thead>
              <tbody>
                {wardStats
                  .sort((a, b) => b.flood_risk - a.flood_risk)
                  .map((ward) => (
                    <tr key={ward.ward_name} className='border-b border-gray-800 hover:bg-gray-800/50'>
                      <td className='p-3'>{ward.ward_name}</td>
                      <td className='p-3'>{ward.flood_risk.toFixed(2)}</td>
                      <td className='p-3'>
                        <span
                          className={`px-3 py-1 rounded-full text-sm ${
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
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className='p-6 border-t border-gray-700 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors'
          >
            Đóng
          </button>
          <button
            onClick={() => window.print()}
            className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            In báo cáo
          </button>
        </div>
      </div>
    </div>
  );
}

