import { useState } from 'react';
import {
  FaUpload,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSync,
} from 'react-icons/fa';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';
import { Table, Input, Select, Modal, Button } from '../../../components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../../plugins/axios';
import type { RoadBridgeData } from '../../../types/dataManagement';

interface UploadResult {
  successful: number;
  failed: number;
  duplicates: number;
  details: {
    row: number;
    message: string;
    data?: Partial<RoadBridgeData>;
  }[];
}

interface CSVRoadBridgeData {
  'Mã công trình': string;
  'Mã phường xã': string;
  'Loại công trình': string;
  'Tên công trình': string;
  'Chiều dài (m)': string;
  'Chiều rộng (m)': string;
  'Chiều cao (m)': string;
  'Vật liệu': string;
  'Tọa độ': string;
  'Trạng thái': string;
  'Kiểm tra cuối': string;
  'Mô tả': string;
}

interface BulkImportRoadBridgeData {
  structure_id: string;
  ward_code: string;
  structure_type: string;
  name: string;
  length: number;
  width: number;
  height: number;
  material: string;
  coordinates: string;
  status: string;
  last_inspection: string | null;
  description: string;
}

const RoadBridgeDataManagement = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<RoadBridgeData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult | null>(null);

  const queryClient = useQueryClient();

  // Fetch road bridge data from backend
  const {
    data: roadBridgeData,
    isLoading: loadingRoadBridge,
    refetch: refetchRoadBridge,
  } = useQuery({
    queryKey: ['road-bridge'],
    queryFn: async () => {
      const response = await api.get('/road-bridge');
      return response.data.roadBridgeData || [];
    },
  });

  // Mutations for CRUD operations
  const createRoadBridgeMutation = useMutation({
    mutationFn: async (data: Omit<RoadBridgeData, 'id'>) => {
      const response = await api.post('/road-bridge', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['road-bridge'] });
      toast.success('Road bridge data created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create road bridge data: ${error.message}`);
    },
  });

  const updateRoadBridgeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RoadBridgeData> }) => {
      const response = await api.put(`/road-bridge/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['road-bridge'] });
      toast.success('Road bridge data updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update road bridge data: ${error.message}`);
    },
  });

  const deleteRoadBridgeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/road-bridge/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['road-bridge'] });
      toast.success('Road bridge data deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete road bridge data: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState<RoadBridgeData>({
    id: '',
    ward_id: '',
    name: '',
    type: '',
    flood_level: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingData) {
      await updateRoadBridgeMutation.mutateAsync({ id: editingData.id, data: formData });
    } else {
      await createRoadBridgeMutation.mutateAsync(formData);
    }
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
    setEditingData(null);
    setFormData({
      id: '',
      ward_id: '',
      name: '',
      type: '',
      flood_level: 0,
    });
  };

  const handleEdit = (data: RoadBridgeData) => {
    setEditingData(data);
    setFormData(data);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa dữ liệu này?')) {
      await deleteRoadBridgeMutation.mutateAsync(id);
    }
  };

  const parseCSV = (csvText: string): CSVRoadBridgeData[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim());
    const data: CSVRoadBridgeData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const row: CSVRoadBridgeData = {
        'Mã công trình': '',
        'Mã phường xã': '',
        'Loại công trình': '',
        'Tên công trình': '',
        'Chiều dài (m)': '',
        'Chiều rộng (m)': '',
        'Chiều cao (m)': '',
        'Vật liệu': '',
        'Tọa độ': '',
        'Trạng thái': '',
        'Kiểm tra cuối': '',
        'Mô tả': '',
      };

      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        row[header as keyof CSVRoadBridgeData] = value;
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

  const validateRoadBridgeData = (
    data: CSVRoadBridgeData[]
  ): {
    valid: BulkImportRoadBridgeData[];
    invalid: { row: number; message: string; data?: BulkImportRoadBridgeData }[];
  } => {
    const valid: BulkImportRoadBridgeData[] = [];
    const invalid: { row: number; message: string; data?: BulkImportRoadBridgeData }[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const errors: string[] = [];

      if (!row['Mã công trình'] || !row['Mã phường xã']) {
        errors.push('Thiếu mã công trình hoặc mã phường xã');
      }

      if (!row['Loại công trình']) {
        errors.push('Thiếu loại công trình');
      }

      if (!row['Tên công trình']) {
        errors.push('Thiếu tên công trình');
      }

      const length = parseFloat(row['Chiều dài (m)']);
      if (isNaN(length) || length <= 0) {
        errors.push('Chiều dài phải lớn hơn 0');
      }

      const width = parseFloat(row['Chiều rộng (m)']);
      if (isNaN(width) || width <= 0) {
        errors.push('Chiều rộng phải lớn hơn 0');
      }

      if (!row['Vật liệu']) {
        errors.push('Thiếu vật liệu');
      }

      if (errors.length > 0) {
        invalid.push({
          row: i + 2, // +2 because we start from row 2 (0-indexed + header)
          message: errors.join(', '),
          data: undefined,
        });
      } else {
        // Convert to API format expected by backend
        valid.push({
          structure_id: row['Mã công trình'],
          ward_code: row['Mã phường xã'],
          structure_type: row['Loại công trình'],
          name: row['Tên công trình'],
          length: length || 0,
          width: width || 0,
          height: parseFloat(row['Chiều cao (m)']) || 0,
          material: row['Vật liệu'],
          coordinates: '', // Can be added later if coordinates are parsed
          status: row['Trạng thái'] || 'Good',
          last_inspection: row['Kiểm tra cuối'] || null,
          description: row['Mô tả'] || '',
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

      const { valid, invalid } = validateRoadBridgeData(csvData);

      if (invalid.length > 0) {
        toast.error(`Có ${invalid.length} hàng dữ liệu không hợp lệ`);
        setUploadResults({
          successful: 0,
          failed: invalid.length,
          duplicates: 0,
          details: invalid,
        });
        return;
      }

      // Upload to backend
      const response = await api.post('/road-bridge/bulk-import', {
        roadBridgeData: valid,
      });

      const result = response.data;

      if (result.success) {
        setUploadResults({
          successful: result.results.successful.length,
          failed: result.results.failed.length,
          duplicates: result.results.duplicates.length,
          details: [
            ...result.results.failed.map(
              (f: { row?: number; message?: string; data?: RoadBridgeData }) => ({
                row: f.row || 0,
                message: f.message || 'Upload failed',
                data: f.data,
              })
            ),
            ...result.results.duplicates.map(
              (d: { row?: number; message?: string; data?: RoadBridgeData }) => ({
                row: d.row || 0,
                message: d.message || 'Duplicate entry',
                data: d.data,
              })
            ),
          ],
        });

        toast.success(`Upload thành công: ${result.results.successful.length} công trình`);
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
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Quản lý Cầu và Đường</h2>
        <div className='flex gap-3'>
          <button
            onClick={() => refetchRoadBridge()}
            className='flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
            disabled={loadingRoadBridge}
          >
            <FaSync className={loadingRoadBridge ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
          <label
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg cursor-pointer transition-colors ${
              theme === 'light'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-indigo-500 hover:bg-indigo-600'
            } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FaUpload />
            <span>{isUploading ? 'Đang Upload...' : 'Upload File'}</span>
            <input
              type='file'
              accept='.csv'
              onChange={handleFileUpload}
              className='hidden'
              disabled={isUploading}
            />
          </label>
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className='flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors'
            disabled={isUploading}
          >
            <FaPlus />
            <span>Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Upload Results */}
      {uploadResults && (
        <div
          className={`p-4 rounded-lg border ${themeClasses.backgroundTertiary} ${themeClasses.border}`}
        >
          <h3 className={`text-lg font-semibold mb-3 ${themeClasses.text}`}>Kết quả Upload</h3>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
            <div className='flex items-center gap-2 text-green-600'>
              <FaCheckCircle />
              <span>Thành công: {uploadResults.successful}</span>
            </div>
            <div className='flex items-center gap-2 text-red-600'>
              <FaTimesCircle />
              <span>Thất bại: {uploadResults.failed}</span>
            </div>
            <div className='flex items-center gap-2 text-yellow-600'>
              <FaExclamationTriangle />
              <span>Trùng lặp: {uploadResults.duplicates}</span>
            </div>
          </div>

          {uploadResults.details.length > 0 && (
            <div className='mt-4'>
              <h4 className={`text-md font-semibold mb-2 ${themeClasses.text}`}>Chi tiết:</h4>
              <div
                className={`max-h-40 overflow-y-auto space-y-1 ${themeClasses.backgroundSecondary} p-2 rounded`}
              >
                {uploadResults.details.slice(0, 10).map((detail, index) => (
                  <div key={index} className='text-sm'>
                    <span className='font-medium text-red-600'>Row {detail.row}</span>
                    <span className='text-red-500 ml-2'>- {detail.message}</span>
                  </div>
                ))}
                {uploadResults.details.length > 10 && (
                  <div className='text-sm text-gray-500 italic'>
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
          { header: 'ID Phường', accessor: 'ward_id' },
          { header: 'Tên', accessor: 'name' },
          { header: 'Loại', accessor: 'type' },
          { header: 'Mức ngập (m)', accessor: 'flood_level' },
          {
            header: 'Thao tác',
            accessor: 'id',
            render: (_, row) => (
              <div className='flex gap-2'>
                <button
                  onClick={() => handleEdit(row)}
                  className={`p-2 rounded transition-colors ${
                    theme === 'light'
                      ? 'text-indigo-600 hover:bg-indigo-500/20'
                      : 'text-indigo-400 hover:bg-indigo-500/20'
                  }`}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(row.id)}
                  className='p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors'
                >
                  <FaTrash />
                </button>
              </div>
            ),
          },
        ]}
        data={roadBridgeData || []}
        emptyMessage={
          loadingRoadBridge ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu. Hãy thêm cầu/đường mới.'
        }
      />

      <Modal
        isOpen={isUploadModalOpen || isEditModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setIsEditModalOpen(false);
          setEditingData(null);
        }}
        title={editingData ? 'Chỉnh sửa Cầu/Đường' : 'Thêm Cầu/Đường mới'}
        footer={
          <>
            <Button
              variant='secondary'
              type='button'
              onClick={() => {
                setIsUploadModalOpen(false);
                setIsEditModalOpen(false);
                setEditingData(null);
              }}
            >
              Hủy
            </Button>
            <Button variant='primary' type='submit'>
              {editingData ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            label='ID Phường/Xã *'
            type='text'
            required
            value={formData.ward_id}
            onChange={(e) => setFormData({ ...formData, ward_id: e.target.value })}
          />
          <Input
            label='Tên cầu/đường *'
            type='text'
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className='grid grid-cols-2 gap-4'>
            <Select
              label='Loại *'
              required
              options={[
                { value: 'Đường', label: 'Đường' },
                { value: 'Cầu', label: 'Cầu' },
                { value: 'Hầm', label: 'Hầm' },
              ]}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder='Chọn loại'
            />
            <Input
              label='Mức ngập (m) *'
              type='number'
              required
              step='0.01'
              value={formData.flood_level}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  flood_level: parseFloat(e.target.value),
                })
              }
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RoadBridgeDataManagement;
