import { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { mockWards } from './mockData';
import { calcFloodRiskIndex, getRiskLevelLabel } from './floodRiskUtils';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportDataModal({ isOpen, onClose }: ExportDataModalProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('json');

  if (!isOpen) return null;

  const exportData = mockWards.map((ward) => {
    const exposure = ward.population_density / 1000 + ward.rainfall / 200;
    const susceptibility = ward.low_elevation + ward.urban_land;
    const resilience = ward.drainage_capacity || 1;
    const floodRisk = calcFloodRiskIndex(exposure, susceptibility, resilience);
    const riskLevel = floodRisk >= 7 ? 'cao' : floodRisk >= 4 ? 'trungBinh' : 'thap';
    const levelLabel = getRiskLevelLabel(riskLevel as 'cao' | 'trungBinh' | 'thap');

    return {
      'Tên phường/xã': ward.ward_name,
      'Chỉ số rủi ro': floodRisk.toFixed(2),
      'Mức độ': levelLabel,
      'Mật độ dân số': ward.population_density,
      'Lượng mưa': ward.rainfall,
      'Độ cao thấp': ward.low_elevation,
      'Đất đô thị': ward.urban_land,
      'Khả năng thoát nước': ward.drainage_capacity,
    };
  });

  const handleExport = () => {
    const fileName = `bao-cao-rui-ro-${new Date().toISOString().split('T')[0]}`;

    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const exportFileDefaultName = `${fileName}.json`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (exportFormat === 'csv') {
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join(','),
        ...exportData.map((row) =>
          headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')
        ),
      ].join('\n');

      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const exportFileDefaultName = `${fileName}.csv`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (exportFormat === 'excel') {
      const headers = Object.keys(exportData[0]);
      const csvContent = [
        headers.join('\t'),
        ...exportData.map((row) =>
          headers.map((header) => row[header as keyof typeof row]).join('\t')
        ),
      ].join('\n');

      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + csvContent);
      const exportFileDefaultName = `${fileName}.xls`;
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }

    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]'>
      <div className='bg-[#0a1628] rounded-xl shadow-2xl max-w-md w-full'>
        <div className='flex justify-between items-center p-6 border-b border-gray-700'>
          <h2 className='text-2xl font-bold text-white'>Xuất dữ liệu</h2>
          <button
            onClick={onClose}
            className='p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors'
          >
            <IoMdClose size={24} className='text-white' />
          </button>
        </div>

        <div className='p-6'>
          <div className='mb-6'>
            <label className='block text-white mb-3'>Chọn định dạng xuất:</label>
            <div className='space-y-2'>
              <label className='flex items-center gap-3 text-white cursor-pointer'>
                <input
                  type='radio'
                  name='format'
                  value='json'
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                  className='w-4 h-4'
                />
                <span>JSON</span>
              </label>
              <label className='flex items-center gap-3 text-white cursor-pointer'>
                <input
                  type='radio'
                  name='format'
                  value='csv'
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className='w-4 h-4'
                />
                <span>CSV</span>
              </label>
              <label className='flex items-center gap-3 text-white cursor-pointer'>
                <input
                  type='radio'
                  name='format'
                  value='excel'
                  checked={exportFormat === 'excel'}
                  onChange={() => setExportFormat('excel')}
                  className='w-4 h-4'
                />
                <span>Excel (.xls)</span>
              </label>
            </div>
          </div>

          <div className='text-gray-400 text-sm mb-6'>Tổng số bản ghi: {exportData.length}</div>
        </div>

        <div className='p-6 border-t border-gray-700 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors'
          >
            Hủy
          </button>
          <button
            onClick={handleExport}
            className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
          >
            Xuất dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
}
