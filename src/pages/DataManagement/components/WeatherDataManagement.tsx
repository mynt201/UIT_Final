import { useState } from "react";
import { FaUpload, FaEdit, FaTrash, FaPlus, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaSync } from "react-icons/fa";
import { useTheme } from "../../../contexts/ThemeContext";
import { getThemeClasses } from "../../../utils/themeUtils";
import { Table, Input, Modal, Button } from "../../../components";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from "react-hot-toast";

import type { WeatherData } from "../../../types/dataManagement";

const WeatherDataManagement = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<WeatherData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    successful: number;
    failed: number;
    duplicates: number;
    details: any[];
  } | null>(null);

  const queryClient = useQueryClient();

  // Fetch weather data from backend
  const { data: weatherData, isLoading: loadingWeather, refetch: refetchWeather } = useQuery({
    queryKey: ['weather'],
    queryFn: async () => {
      const response = await fetch('/api/weather', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      return result.weatherData || [];
    }
  });

  const [formData, setFormData] = useState<WeatherData>({
    id: "",
    ward_id: "",
    date: new Date().toISOString().split('T')[0],
    temperature: {
      current: 0,
      min: 0,
      max: 0,
      feels_like: 0,
    },
    humidity: 0,
    rainfall: 0,
    wind_speed: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingData) {
      setWeatherData(
        weatherData.map((w) => (w.id === editingData.id ? formData : w)),
      );
    } else {
      setWeatherData([
        ...weatherData,
        { ...formData, id: Date.now().toString() },
      ]);
    }
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
    setEditingData(null);
    setFormData({
      id: "",
      ward_id: "",
      date: new Date().toISOString().split('T')[0],
      temperature: {
        current: 0,
        min: 0,
        max: 0,
        feels_like: 0,
      },
      humidity: 0,
      rainfall: 0,
      wind_speed: 0,
    });
  };

  const handleEdit = (data: WeatherData) => {
    setEditingData(data);
    setFormData(data);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dữ liệu này?")) {
      setWeatherData(weatherData.filter((w) => w.id !== id));
    }
  };

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const row: any = {};

      headers.forEach((header, index) => {
        let value = values[index]?.trim() || '';

        // Convert to appropriate types
        if (header.includes('Nhiệt độ') || header.includes('Độ ẩm') || header.includes('Tốc độ gió') ||
            header.includes('Lượng mưa') || header.includes('Áp suất')) {
          row[header] = parseFloat(value) || 0;
        } else {
          row[header] = value;
        }
      });

      data.push(row);
    }

    return data;
  };

  // Helper function to parse CSV line with proper quote handling
  const parseCSVLine = (line: string): string[] => {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current);

    return result;
  };

  const validateWeatherData = (data: any[]): { valid: any[], invalid: any[] } => {
    const valid = [];
    const invalid = [];

    for (const row of data) {
      const errors = [];

      if (!row['Ngày'] || !row['Mã phường xã']) {
        errors.push('Thiếu ngày hoặc mã phường xã');
      }

      if (row['Nhiệt độ (°C)'] === undefined || row['Nhiệt độ (°C)'] < -50 || row['Nhiệt độ (°C)'] > 60) {
        errors.push('Nhiệt độ không hợp lệ (-50°C đến 60°C)');
      }

      if (row['Độ ẩm (%)'] === undefined || row['Độ ẩm (%)'] < 0 || row['Độ ẩm (%)'] > 100) {
        errors.push('Độ ẩm không hợp lệ (0-100%)');
      }

      if (row['Tốc độ gió (km/h)'] === undefined || row['Tốc độ gió (km/h)'] < 0) {
        errors.push('Tốc độ gió không hợp lệ');
      }

      if (errors.length > 0) {
        invalid.push({ ...row, errors });
      } else {
        // Convert to API format
        valid.push({
          ward_code: row['Mã phường xã'],
          date: row['Ngày'],
          temperature: row['Nhiệt độ (°C)'],
          humidity: row['Độ ẩm (%)'],
          wind_speed: row['Tốc độ gió (km/h)'],
          wind_direction: row['Hướng gió'] || 'N',
          rainfall: row['Lượng mưa (mm)'] || 0,
          pressure: row['Áp suất (hPa)'] || 1013.25,
          description: row['Mô tả thời tiết'] || ''
        });
      }
    }

    return { valid, invalid };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadResults(null);

    try {
      const text = await file.text();
      const csvData = parseCSV(text);

      if (csvData.length === 0) {
        toast.error('File không có dữ liệu hợp lệ');
        return;
      }

      const { valid, invalid } = validateWeatherData(csvData);

      if (invalid.length > 0) {
        toast.error(`Có ${invalid.length} hàng dữ liệu không hợp lệ`);
        setUploadResults({
          successful: 0,
          failed: invalid.length,
          duplicates: 0,
          details: invalid
        });
        return;
      }

      // Upload to backend
      const response = await fetch('/api/weather/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ weatherData: valid })
      });

      const result = await response.json();

      if (result.success) {
        setUploadResults({
          successful: result.results.successful.length,
          failed: result.results.failed.length,
          duplicates: result.results.duplicates.length,
          details: [
            ...result.results.successful.map((s: any) => ({ ...s, status: 'success' })),
            ...result.results.failed.map((f: any) => ({ ...f, status: 'failed' })),
            ...result.results.duplicates.map((d: any) => ({ ...d, status: 'duplicate' }))
          ]
        });

        toast.success(`Upload thành công: ${result.results.successful.length} bản ghi thời tiết`);
      } else {
        toast.error('Upload thất bại');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Có lỗi xảy ra khi upload file');
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-semibold ${themeClasses.text}`}>
          Quản lý Dữ liệu Thời tiết
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => refetchWeather()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            disabled={loadingWeather}
          >
            <FaSync className={loadingWeather ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
          <label className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg cursor-pointer transition-colors ${
            theme === 'light' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-500 hover:bg-indigo-600'
          } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <FaUpload />
            <span>{isUploading ? 'Đang Upload...' : 'Upload File'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            disabled={isUploading}
          >
            <FaPlus />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Upload Results */}
      {uploadResults && (
        <div className={`p-4 rounded-lg border ${themeClasses.backgroundTertiary} ${themeClasses.border}`}>
          <h3 className={`text-lg font-semibold mb-3 ${themeClasses.text}`}>
            Kết quả Upload
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2 text-green-600">
              <FaCheckCircle />
              <span>Thành công: {uploadResults.successful}</span>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <FaTimesCircle />
              <span>Thất bại: {uploadResults.failed}</span>
            </div>
            <div className="flex items-center gap-2 text-yellow-600">
              <FaExclamationTriangle />
              <span>Trùng lặp: {uploadResults.duplicates}</span>
            </div>
          </div>

          {uploadResults.details.length > 0 && (
            <div className="mt-4">
              <h4 className={`text-md font-semibold mb-2 ${themeClasses.text}`}>
                Chi tiết:
              </h4>
              <div className={`max-h-40 overflow-y-auto space-y-1 ${themeClasses.backgroundSecondary} p-2 rounded`}>
                {uploadResults.details.slice(0, 10).map((detail, index) => (
                  <div key={index} className="text-sm">
                    <span className={`font-medium ${
                      detail.status === 'success' ? 'text-green-600' :
                      detail.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {detail.date || `Row ${index + 1}`}
                    </span>
                    {detail.errors && (
                      <span className="text-red-500 ml-2">
                        - {Array.isArray(detail.errors) ? detail.errors.join(', ') : detail.errors}
                      </span>
                    )}
                    {detail.reason && (
                      <span className="text-yellow-500 ml-2">- {detail.reason}</span>
                    )}
                  </div>
                ))}
                {uploadResults.details.length > 10 && (
                  <div className="text-sm text-gray-500 italic">
                    ... và {uploadResults.details.length - 10} kết quả khác
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <Table
        columns={[
          { header: "ID Phường", accessor: "ward_id" },
          { header: "Ngày", accessor: "date" },
          { header: "Lượng mưa (mm)", accessor: "rainfall" },
          { header: "Nhiệt độ (°C)", accessor: "temperature" },
          { header: "Độ ẩm (%)", accessor: "humidity" },
          { header: "Tốc độ gió (m/s)", accessor: "wind_speed" },
          {
            header: "Thao tác",
            accessor: "id",
            render: (_, row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(row)}
                  className={`p-2 rounded transition-colors ${
                    theme === "light"
                      ? "text-indigo-600 hover:bg-indigo-500/20"
                      : "text-indigo-400 hover:bg-indigo-500/20"
                  }`}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            ),
          },
        ]}
        data={weatherData}
        emptyMessage={loadingWeather ? "Đang tải dữ liệu..." : "Chưa có dữ liệu. Hãy thêm dữ liệu thời tiết mới."}
      />

      <Modal
        isOpen={isUploadModalOpen || isEditModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setIsEditModalOpen(false);
          setEditingData(null);
        }}
        title={editingData ? "Chỉnh sửa Dữ liệu Thời tiết" : "Thêm Dữ liệu Thời tiết"}
        footer={
          <>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsUploadModalOpen(false);
                setIsEditModalOpen(false);
                setEditingData(null);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
            >
              {editingData ? "Cập nhật" : "Thêm mới"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="ID Phường/Xã *"
            type="text"
            required
            value={formData.ward_id}
            onChange={(e) =>
              setFormData({ ...formData, ward_id: e.target.value })
            }
          />
          <Input
            label="Ngày *"
            type="date"
            required
            value={formData.date}
            onChange={(e) =>
              setFormData({ ...formData, date: e.target.value })
            }
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Lượng mưa (mm) *"
              type="number"
              required
              step="0.1"
              value={formData.rainfall}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rainfall: parseFloat(e.target.value),
                })
              }
            />
            <Input
              label="Nhiệt độ hiện tại (°C) *"
              type="number"
              required
              step="0.1"
              value={formData.temperature.current}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  temperature: {
                    ...formData.temperature,
                    current: parseFloat(e.target.value),
                  },
                })
              }
            />
            <Input
              label="Độ ẩm (%) *"
              type="number"
              required
              min="0"
              max="100"
              value={formData.humidity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  humidity: parseFloat(e.target.value),
                })
              }
            />
            <Input
              label="Tốc độ gió (m/s) *"
              type="number"
              required
              step="0.1"
              value={formData.wind_speed}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  wind_speed: parseFloat(e.target.value),
                })
              }
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default WeatherDataManagement;

