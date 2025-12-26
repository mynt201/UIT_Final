import { useState } from 'react';
import { mockWards } from '../../../mockData';
import { calcFloodRiskIndex, getRiskLevelLabel } from './floodRiskUtils';
import { Modal, Button } from '../../../components';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportDataModal({ isOpen, onClose }: ExportDataModalProps) {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'excel'>('json');
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xuất dữ liệu"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleExport}>
            Xuất dữ liệu
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <label className={`block mb-3 ${themeClasses.text}`}>Chọn định dạng xuất:</label>
          <div className="space-y-2">
            <label className={`flex items-center gap-3 cursor-pointer ${themeClasses.text}`}>
              <input
                type="radio"
                name="format"
                value="json"
                checked={exportFormat === "json"}
                onChange={() => setExportFormat("json")}
                className="w-4 h-4"
              />
              <span>JSON</span>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer ${themeClasses.text}`}>
              <input
                type="radio"
                name="format"
                value="csv"
                checked={exportFormat === "csv"}
                onChange={() => setExportFormat("csv")}
                className="w-4 h-4"
              />
              <span>CSV</span>
            </label>
            <label className={`flex items-center gap-3 cursor-pointer ${themeClasses.text}`}>
              <input
                type="radio"
                name="format"
                value="excel"
                checked={exportFormat === "excel"}
                onChange={() => setExportFormat("excel")}
                className="w-4 h-4"
              />
              <span>Excel (.xls)</span>
            </label>
          </div>
        </div>

        <div className={`${themeClasses.textSecondary} text-sm`}>
          Tổng số bản ghi: {exportData.length}
        </div>
      </div>
    </Modal>
  );
}
