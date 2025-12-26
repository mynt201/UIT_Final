import { IoMdClose } from 'react-icons/io';
import { getRiskColor } from './floodRiskUtils';

interface WardDetail {
  ward_name: string;
  flood_risk: number;
  risk_level: string;
  population_density: number;
  rainfall: number;
  low_elevation: number;
  urban_land: number;
  drainage_capacity: number;
  exposure: number;
  susceptibility: number;
  resilience: number;
}

interface WardDetailPanelProps {
  ward: WardDetail | null;
  onClose: () => void;
}

export default function WardDetailPanel({ ward, onClose }: WardDetailPanelProps) {
  if (!ward) return null;

  const riskLevel =
    ward.risk_level === 'Cao' ? 'cao' : ward.risk_level === 'Trung Bình' ? 'trungBinh' : 'thap';
  const color = getRiskColor(riskLevel as 'cao' | 'trungBinh' | 'thap');
  const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

  return (
    <div
      className='absolute bottom-4 left-4 right-4 bg-[#0a1628] rounded-xl shadow-2xl overflow-hidden'
      style={{ zIndex: 9999 }}
    >
      <div className='px-6 pt-4 pb-6'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-3xl font-bold text-white'>{ward.ward_name}</h2>
          <button
            onClick={onClose}
            className='p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors'
          >
            <IoMdClose size={24} className='text-white' />
          </button>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          <div className='space-y-3 text-left'>
            <div className='text-white/80 text-sm'>
              <span className='opacity-60'>Chỉ số rủi ro:</span>{' '}
              <span className='font-semibold text-white'>{ward.flood_risk.toFixed(2)}</span>
            </div>
            <div className='text-white/80 text-sm'>
              <span className='opacity-60'>Mật độ dân số:</span>{' '}
              <span className='font-semibold text-white'>
                {ward.population_density.toLocaleString()} người/km²
              </span>
            </div>
            <div className='text-white/80 text-sm'>
              <span className='opacity-60'>Lượng mưa:</span>{' '}
              <span className='font-semibold text-white'>{ward.rainfall} mm</span>
            </div>
            <div className='text-white/80 text-sm'>
              <span className='opacity-60'>Độ cao thấp:</span>{' '}
              <span className='font-semibold text-white'>{ward.low_elevation.toFixed(1)} m</span>
            </div>
            <div className='text-white/80 text-sm'>
              <span className='opacity-60'>Khả năng thoát nước:</span>{' '}
              <span className='font-semibold text-white'>{ward.drainage_capacity.toFixed(1)}</span>
            </div>
          </div>

          <div className='space-y-3 text-left'>
            <div className='flex items-center gap-2 text-white/80 text-sm'>
              <span className='opacity-60'>Mức độ:</span>
              <div className='flex items-center gap-2'>
                <div
                  className='w-6 h-4 rounded border border-white/30'
                  style={{ backgroundColor: rgbColor }}
                />
                <span className='font-semibold text-white'>{ward.risk_level}</span>
              </div>
            </div>
            <div className='text-white/80 text-sm'>
              <span className='opacity-60'>Đất đô thị:</span>{' '}
              <span className='font-semibold text-white'>{ward.urban_land.toFixed(1)}</span>
            </div>
            <div className='text-white/80 text-sm'>
              <span className='opacity-60'>Exposure:</span>{' '}
              <span className='font-semibold text-white'>{ward.exposure.toFixed(2)}</span>
            </div>
            <div className='text-white/80 text-sm'>
              <span className='opacity-60'>Susceptibility:</span>{' '}
              <span className='font-semibold text-white'>{ward.susceptibility.toFixed(2)}</span>
            </div>
            <div className='text-white/80 text-sm'>
              <span className='opacity-60'>Resilience:</span>{' '}
              <span className='font-semibold text-white'>{ward.resilience.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button className='w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors'>
          Xem chi tiết đánh giá rủi ro
        </button>
      </div>
    </div>
  );
}
