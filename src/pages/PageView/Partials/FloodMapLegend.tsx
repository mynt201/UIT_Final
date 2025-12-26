// Component Legend hiển thị chú thích các mức độ rủi ro ngập lụt

import { getRiskColor } from './floodRiskUtils';

interface LegendItem {
  level: 'cao' | 'trungBinh' | 'thap';
  label: string;
}

const legendItems: LegendItem[] = [
  { level: 'cao', label: 'Cao' },
  { level: 'trungBinh', label: 'Trung Bình' },
  { level: 'thap', label: 'Thấp' },
];

export default function FloodMapLegend() {
  return (
    <div
      className='absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-md shadow-lg p-8 z-1000'
      style={{ pointerEvents: 'none' }}
    >
      <div className='text-xs font-semibold mb-1.5 text-gray-700'>Mức độ ngập lụt</div>
      <div className='space-y-1'>
        {legendItems.map((item) => {
          const color = getRiskColor(item.level);
          const rgbColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;

          return (
            <div key={item.level} className='flex items-center gap-2'>
              <div
                className='w-8 h-5 rounded border border-gray-300 shrink-0'
                style={{ backgroundColor: rgbColor }}
              />
              <span className='text-xs text-gray-700'>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
