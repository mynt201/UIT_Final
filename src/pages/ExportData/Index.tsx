import { useState } from 'react';
import { mockWards } from '../PageView/Partials/mockData';
import { calcFloodRiskIndex, getRiskLevelLabel } from '../PageView/Partials/floodRiskUtils';

export default function ExportDataPage() {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('json');

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
  };

  return (
    <div className='w-[80%] p-6'>
      <div className='text-white text-3xl mb-6'>Xuất dữ liệu</div>

      <div className='bg-[#0a1628] rounded-xl shadow-2xl p-6 max-w-md'>
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

        <div className='flex justify-end'>
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

