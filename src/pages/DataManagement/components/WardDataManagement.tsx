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
import { Table, Input, Textarea, Modal, Button } from '../../../components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatNumber } from '../../../utils/formatUtils';
import toast from 'react-hot-toast';
import { api } from '../../../plugins/axios';

interface WardData {
  _id?: string;
  ward_code: string;
  ward_name: string;
  district: string;
  province: string;
  population: number;
  area: number;
  geometry: {
    type: string;
    coordinates: number[];
  };
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

const WardDataManagement = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<WardData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    successful: number;
    failed: number;
    duplicates: number;
    details: any[];
  } | null>(null);

  const queryClient = useQueryClient();

  // Fetch wards from backend
  const {
    data: wardsData,
    isLoading: loadingWards,
    refetch: refetchWards,
  } = useQuery({
    queryKey: ['wards'],
    queryFn: async () => {
      const response = await api.get('/wards');
      return response.data.wards || [];
    },
  });

  const wards = wardsData || [];

  const [formData, setFormData] = useState({
    ward_code: '',
    ward_name: '',
    district: '',
    province: '',
    area: 0,
    population: 0,
    coordinates: '',
    description: '',
  });

  // Mutations for CRUD operations
  const createWardMutation = useMutation({
    mutationFn: async (wardData: any) => {
      const response = await api.post('/wards', wardData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Thêm phường/xã thành công!');
      queryClient.invalidateQueries({ queryKey: ['wards'] });
      setIsUploadModalOpen(false);
      setFormData({
        ward_code: '',
        ward_name: '',
        district: '',
        province: '',
        area: 0,
        population: 0,
        coordinates: '',
        description: '',
      });
    },
    onError: (error: any) => {
      toast.error(error?.data?.error || 'Có lỗi xảy ra khi thêm phường/xã');
    },
  });

  const updateWardMutation = useMutation({
    mutationFn: async ({ id, wardData }: { id: string; wardData: any }) => {
      const response = await api.put(`/wards/${id}`, wardData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật phường/xã thành công!');
      queryClient.invalidateQueries({ queryKey: ['wards'] });
      setIsEditModalOpen(false);
      setEditingWard(null);
    },
    onError: (error: any) => {
      toast.error(error?.data?.error || 'Có lỗi xảy ra khi cập nhật phường/xã');
    },
  });

  const deleteWardMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/wards/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Xóa phường/xã thành công!');
      queryClient.invalidateQueries({ queryKey: ['wards'] });
    },
    onError: (error: any) => {
      toast.error(error?.data?.error || 'Có lỗi xảy ra khi xóa phường/xã');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWard) {
      updateWardMutation.mutate({
        id: editingWard._id || editingWard.ward_code,
        wardData: formData,
      });
    } else {
      createWardMutation.mutate(formData);
    }
  };

  const handleEdit = (ward: WardData) => {
    setEditingWard(ward);
    setFormData({
      ward_code: ward.ward_code || '',
      ward_name: ward.ward_name || '',
      district: ward.district || '',
      province: ward.province || '',
      area: ward.area || 0,
      population: ward.population || 0,
      coordinates: ward.geometry?.coordinates?.join(', ') || '',
      description: ward.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (wardId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phường/xã này?')) {
      deleteWardMutation.mutate(wardId);
    }
  };

  const parseCSV = (csvText: string): any[] => {
    // Remove BOM if present
    const cleanText = csvText.replace(/^\uFEFF/, '');
    const lines = cleanText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) =>
      h
        .trim()
        .replace(/["'\uFEFF]/g, '')
        .toLowerCase()
    );
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const row: any = {};

      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';

        // Convert to appropriate types
        if (header.includes('Dân số') || header.includes('Diện tích')) {
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

  const validateWardData = (data: any[]): { valid: unknown[]; invalid: any[] } => {
    const valid = [];
    const invalid = [];

    for (const row of data) {
      const errors = [];

      const wardCode = (row['mã phường xã'] || row['Mã phường xã'])?.toString().trim();
      const wardName = (row['tên phường xã'] || row['Tên phường xã'])?.toString().trim();
      const district = (row['quận huyện'] || row['Quận huyện'])?.toString().trim();
      const province = (row['tỉnh thành phố'] || row['Tỉnh thành phố'])?.toString().trim();

      if (!wardCode || !wardName) {
        errors.push('Thiếu mã hoặc tên phường xã');
      }

      if (!district || !province) {
        errors.push('Thiếu thông tin quận huyện hoặc tỉnh thành phố');
      }

      const population = Number(row['Dân số']);
      const area = Number(row['Diện tích (km²)']);

      if (population <= 0) {
        errors.push('Dân số phải lớn hơn 0');
      }

      if (area <= 0) {
        errors.push('Diện tích phải lớn hơn 0');
      }

      // Geometry validation is done when converting data

      if (errors.length > 0) {
        invalid.push({ ...row, errors });
      } else {
        // Convert coordinates to geometry
        let geometry = null;
        const coordStr = (row['tọa độ'] || row['Tọa độ'])?.toString().trim();
        if (coordStr) {
          const coords = coordStr.split(',').map((c: string) => parseFloat(c.trim()));
          if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            geometry = {
              type: 'Point',
              coordinates: [coords[1], coords[0]], // GeoJSON format: [longitude, latitude]
            };
          }
        }

        if (!geometry) {
          errors.push('Tọa độ không hợp lệ (định dạng: latitude,longitude)');
        }

        // Convert to API format
        valid.push({
          ward_code: wardCode,
          ward_name: wardName,
          district: district,
          province: province, // Note: backend uses 'province' not 'city'
          population: population,
          area: area,
          geometry: geometry,
          description: (row['mô tả'] || row['Mô tả'])?.toString().trim() || '',
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

      const { valid, invalid } = validateWardData(csvData);

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
      const response = await api.post('/wards/bulk-import', {
        wards: valid,
      });

      const result = response.data;

      if (result.success) {
        setUploadResults({
          successful: result.results.successful.length,
          failed: result.results.failed.length,
          duplicates: result.results.duplicates.length,
          details: [
            ...result.results.successful.map((s: any) => ({ ...s, status: 'success' })),
            ...result.results.failed.map((f: any) => ({ ...f, status: 'failed' })),
            ...result.results.duplicates.map((d: any) => ({ ...d, status: 'duplicate' })),
          ],
        });

        toast.success(`Upload thành công: ${result.results.successful.length} phường/xã`);
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
      {/* Action Buttons */}
      <div className='flex justify-between items-center'>
        <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Quản lý Dữ liệu Phường/Xã</h2>
        <div className='flex gap-3'>
          <button
            onClick={() => refetchWards()}
            className='flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
            disabled={loadingWards}
          >
            <FaSync className={loadingWards ? 'animate-spin' : ''} />
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
                    <span
                      className={`font-medium ${
                        detail.status === 'success'
                          ? 'text-green-600'
                          : detail.status === 'failed'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {detail.ward_name || detail.wardCode || `Row ${index + 1}`}
                    </span>
                    {detail.errors && (
                      <span className='text-red-500 ml-2'>
                        - {Array.isArray(detail.errors) ? detail.errors.join(', ') : detail.errors}
                      </span>
                    )}
                    {detail.reason && (
                      <span className='text-yellow-500 ml-2'>- {detail.reason}</span>
                    )}
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

      {/* Data Table */}
      <Table
        columns={[
          { header: 'Mã phường xã', accessor: 'ward_code' },
          { header: 'Tên phường/xã', accessor: 'ward_name' },
          { header: 'Quận huyện', accessor: 'district' },
          { header: 'Tỉnh thành phố', accessor: 'province' },
          {
            header: 'Diện tích (km²)',
            accessor: 'area',
            render: (value) => formatNumber(value),
          },
          {
            header: 'Dân số',
            accessor: 'population',
            render: (value) => formatNumber(value),
          },
          {
            header: 'Tọa độ',
            accessor: 'coordinates',
            render: (value) => <span className='text-sm'>{value as string}</span>,
          },
          {
            header: 'Thao tác',
            accessor: '_id',
            render: (_, row) => (
              <div className='flex gap-2'>
                <button
                  onClick={() => handleEdit(row)}
                  className={`p-2 rounded transition-colors ${
                    theme === 'light'
                      ? 'text-indigo-600 hover:bg-indigo-500/20'
                      : 'text-indigo-400 hover:bg-indigo-500/20'
                  }`}
                  disabled={
                    createWardMutation.isPending ||
                    updateWardMutation.isPending ||
                    deleteWardMutation.isPending
                  }
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete((row as any)._id)}
                  className='p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors'
                  disabled={deleteWardMutation.isPending}
                >
                  <FaTrash />
                </button>
              </div>
            ),
          },
        ]}
        data={wards || []}
        emptyMessage={
          loadingWards ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu. Hãy thêm phường/xã mới.'
        }
      />

      {/* Upload/Edit Modal */}
      <Modal
        isOpen={isUploadModalOpen || isEditModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setIsEditModalOpen(false);
          setEditingWard(null);
          setFormData({
            ward_code: '',
            ward_name: '',
            district: '',
            province: '',
            area: 0,
            population: 0,
            coordinates: '',
            description: '',
          });
        }}
        title={editingWard ? 'Chỉnh sửa Phường/Xã' : 'Thêm Phường/Xã mới'}
        footer={
          <>
            <Button
              variant='secondary'
              type='button'
              onClick={() => {
                setIsUploadModalOpen(false);
                setIsEditModalOpen(false);
                setEditingWard(null);
                setFormData({
                  ward_code: '',
                  ward_name: '',
                  district: '',
                  province: '',
                  area: 0,
                  population: 0,
                  coordinates: '',
                  description: '',
                });
              }}
            >
              Hủy
            </Button>
            <Button
              variant='primary'
              type='submit'
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
            >
              {editingWard ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className='space-y-4'>
          <Input
            label='Tên phường/xã *'
            type='text'
            required
            value={formData.ward_name}
            onChange={(e) => setFormData({ ...formData, ward_name: e.target.value })}
          />
          <Input
            label='Quận/Huyện *'
            type='text'
            required
            value={formData.district}
            onChange={(e) => setFormData({ ...formData, district: e.target.value })}
          />
          <Input
            label='Tỉnh/Thành phố *'
            type='text'
            required
            value={formData.province}
            onChange={(e) => setFormData({ ...formData, province: e.target.value })}
          />
          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='Diện tích (km²) *'
              type='number'
              required
              step='0.01'
              value={formData.area}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  area: parseFloat(e.target.value),
                })
              }
            />
            <Input
              label='Dân số *'
              type='number'
              required
              value={formData.population}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  population: parseInt(e.target.value),
                })
              }
            />
          </div>
          <Textarea
            label='Tọa độ (latitude,longitude) *'
            required
            value={formData.coordinates}
            onChange={(e) => setFormData({ ...formData, coordinates: e.target.value })}
            rows={2}
            placeholder='10.7769,106.7009'
            className='font-mono text-sm'
          />
          <Textarea
            label='Mô tả'
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            placeholder='Mô tả về phường/xã...'
          />
        </form>
      </Modal>
    </div>
  );
};

export default WardDataManagement;
