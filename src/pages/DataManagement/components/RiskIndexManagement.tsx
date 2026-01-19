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
import { Table, Input, Modal, Button } from '../../../components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../../../plugins/axios';
import type { RiskIndexData } from '../../../types/dataManagement';

interface UploadResult {
  successful: number;
  failed: number;
  duplicates: number;
  details: {
    row: number;
    message: string;
    data?: Partial<RiskIndexData>;
  }[];
}

interface CSVRiskIndexData {
  'Mã phường xã': string;
  'Ngày đánh giá': string;
  'Rủi ro mưa': string;
  'Rủi ro thoát nước': string;
  'Rủi ro lịch sử ngập': string;
  'Rủi ro địa hình': string;
  'Rủi ro mật độ dân số': string;
  'Rủi ro tổng thể': string;
  'Mô tả đánh giá': string;
}

const RiskIndexManagement = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingData, setEditingData] = useState<RiskIndexData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult | null>(null);

  const queryClient = useQueryClient();

  // Fetch risk index data from backend
  const {
    data: riskIndexData,
    isLoading: loadingRisk,
    refetch: refetchRisk,
  } = useQuery({
    queryKey: ['risk'],
    queryFn: async () => {
      const response = await api.get('/risk');
      return response.data.riskIndexData || [];
    },
  });

  // Mutations for CRUD operations
  const createRiskIndexMutation = useMutation({
    mutationFn: async (data: Omit<RiskIndexData, 'id'>) => {
      const response = await api.post('/risk', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk'] });
      toast.success('Risk index data created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create risk index data: ${error.message}`);
    },
  });

  const updateRiskIndexMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<RiskIndexData> }) => {
      const response = await api.put(`/risk/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk'] });
      toast.success('Risk index data updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update risk index data: ${error.message}`);
    },
  });

  const deleteRiskIndexMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/risk/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk'] });
      toast.success('Risk index data deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete risk index data: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState<RiskIndexData>({
    id: '',
    ward_id: '',
    date: new Date().toISOString().split('T')[0],
    risk_index: 0,
    exposure: 0,
    susceptibility: 0,
    resilience: 0,
  });

  const calculateScore = (exposure: number, susceptibility: number, resilience: number) => {
    return (exposure + susceptibility) / (resilience || 1);
  };

  const handleExposureChange = (value: number) => {
    const newExposure = value;
    const newScore = calculateScore(newExposure, formData.susceptibility, formData.resilience);
    setFormData({
      ...formData,
      exposure: newExposure,
      risk_index: newScore,
    });
  };

  const handleSusceptibilityChange = (value: number) => {
    const newSusceptibility = value;
    const newScore = calculateScore(formData.exposure, newSusceptibility, formData.resilience);
    setFormData({
      ...formData,
      susceptibility: newSusceptibility,
      risk_index: newScore,
    });
  };

  const handleResilienceChange = (value: number) => {
    const newResilience = value;
    const newScore = calculateScore(formData.exposure, formData.susceptibility, newResilience);
    setFormData({
      ...formData,
      resilience: newResilience,
      risk_index: newScore,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingData) {
      await updateRiskIndexMutation.mutateAsync({ id: editingData.id, data: formData });
    } else {
      await createRiskIndexMutation.mutateAsync(formData);
    }
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
    setEditingData(null);
    setFormData({
      id: '',
      ward_id: '',
      date: new Date().toISOString().split('T')[0],
      exposure: 0,
      susceptibility: 0,
      resilience: 0,
      risk_index: 0,
    });
  };

  const handleEdit = (data: RiskIndexData) => {
    setEditingData(data);
    setFormData(data);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa chỉ số rủi ro này?')) {
      await deleteRiskIndexMutation.mutateAsync(id);
    }
  };

  const parseCSV = (csvText: string): CSVRiskIndexData[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const row: CSVRiskIndexData = {
        'Mã phường xã': '',
        'Ngày đánh giá': '',
        'Rủi ro mưa': '',
        'Rủi ro thoát nước': '',
        'Rủi ro lịch sử ngập': '',
        'Rủi ro địa hình': '',
        'Rủi ro mật độ dân số': '',
        'Rủi ro tổng thể': '',
        'Mô tả đánh giá': '',
      };

      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
        row[header as keyof CSVRiskIndexData] = value;
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

  const validateRiskData = (
    data: CSVRiskIndexData[]
  ): { valid: any[]; invalid: { row: number; message: string; data?: any }[] } => {
    const valid: any[] = [];
    const invalid: { row: number; message: string; data?: any }[] = [];

    const riskLevels = ['Thấp', 'Trung bình', 'Cao'];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const errors: string[] = [];

      if (!row['Mã phường xã'] || !row['Ngày đánh giá']) {
        errors.push('Thiếu mã phường xã hoặc ngày đánh giá');
      }

      // Validate risk levels
      const riskFields = [
        'Rủi ro mưa',
        'Rủi ro thoát nước',
        'Rủi ro lịch sử ngập',
        'Rủi ro địa hình',
        'Rủi ro mật độ dân số',
        'Rủi ro tổng thể',
      ] as const;

      riskFields.forEach((field) => {
        if (!riskLevels.includes(row[field])) {
          errors.push(`${field} phải là: Thấp, Trung bình, hoặc Cao`);
        }
      });

      if (errors.length > 0) {
        invalid.push({
          row: i + 2, // +2 because we start from row 2 (0-indexed + header)
          message: errors.join(', '),
          data: undefined,
        });
      } else {
        // Convert to API format
        valid.push({
          ward_id: row['Mã phường xã'],
          date: row['Ngày đánh giá'],
          exposure: 0, // Will be calculated based on risk levels
          susceptibility: 0,
          resilience: 0,
          risk_index: 0, // Will be calculated
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

      const { valid, invalid } = validateRiskData(csvData);

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
      const response = await api.post('/risk/bulk-import', {
        riskData: valid,
      });

      const result = response.data;

      if (result.success) {
        setUploadResults({
          successful: result.results.successful.length,
          failed: result.results.failed.length,
          duplicates: result.results.duplicates.length,
          details: [
            ...result.results.failed.map((f: any) => ({
              row: f.row || 0,
              message: f.message || 'Upload failed',
              data: f.data,
            })),
            ...result.results.duplicates.map((d: any) => ({
              row: d.row || 0,
              message: d.message || 'Duplicate entry',
              data: d.data,
            })),
          ],
        });

        toast.success(`Upload thành công: ${result.results.successful.length} chỉ số rủi ro`);
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

  const getRiskLevel = (riskIndex: number): string => {
    if (riskIndex >= 6) return 'Cao';
    if (riskIndex >= 4) return 'Trung Bình';
    return 'Thấp';
  };

  const getRiskColor = (riskIndex: number): string => {
    if (riskIndex >= 6) return 'text-red-400';
    if (riskIndex >= 4) return 'text-orange-400';
    return 'text-green-400';
  };

  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <div className='space-y-4'>
      <div className='flex justify-between items-center'>
        <h2 className={`text-xl font-semibold ${themeClasses.text}`}>Quản lý Chỉ số Rủi ro</h2>
        <div className='flex gap-3'>
          <button
            onClick={() => refetchRisk()}
            className='flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors'
            disabled={loadingRisk}
          >
            <FaSync className={loadingRisk ? 'animate-spin' : ''} />
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
          {
            header: 'Exposure',
            accessor: 'exposure',
            render: (value) => (value as number).toFixed(2),
          },
          {
            header: 'Susceptibility',
            accessor: 'susceptibility',
            render: (value) => (value as number).toFixed(2),
          },
          {
            header: 'Resilience',
            accessor: 'resilience',
            render: (value) => (value as number).toFixed(2),
          },
          {
            header: 'Chỉ số Rủi ro',
            accessor: 'risk_index',
            render: (value) => (
              <span className={`font-bold ${getRiskColor(value as number)}`}>
                {(value as number).toFixed(2)}
              </span>
            ),
          },
          {
            header: 'Mức độ',
            accessor: 'risk_index',
            render: (value) => (
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  getRiskLevel(value as number) === 'Cao'
                    ? 'bg-red-500/20 text-red-400'
                    : getRiskLevel(value as number) === 'Trung Bình'
                    ? 'bg-orange-300/20 text-orange-300'
                    : 'bg-green-300/20 text-green-300'
                }`}
              >
                {getRiskLevel(value as number)}
              </span>
            ),
          },
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
        data={riskIndexData || []}
        emptyMessage={
          loadingRisk ? 'Đang tải dữ liệu...' : 'Chưa có dữ liệu. Hãy thêm chỉ số rủi ro mới.'
        }
      />

      <Modal
        isOpen={isUploadModalOpen || isEditModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setIsEditModalOpen(false);
          setEditingData(null);
        }}
        title={editingData ? 'Chỉnh sửa Chỉ số Rủi ro' : 'Thêm Chỉ số Rủi ro mới'}
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
            <Button
              variant='primary'
              type='submit'
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e as any);
              }}
            >
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
          <div className='grid grid-cols-3 gap-4'>
            <Input
              label='Exposure *'
              type='number'
              required
              step='0.01'
              value={formData.exposure}
              onChange={(e) => handleExposureChange(parseFloat(e.target.value))}
            />
            <Input
              label='Susceptibility *'
              type='number'
              required
              step='0.01'
              value={formData.susceptibility}
              onChange={(e) => handleSusceptibilityChange(parseFloat(e.target.value))}
            />
            <Input
              label='Resilience *'
              type='number'
              required
              step='0.01'
              min='0.1'
              value={formData.resilience}
              onChange={(e) => handleResilienceChange(parseFloat(e.target.value))}
            />
          </div>
          <div className={`${theme === 'light' ? 'bg-gray-100' : 'bg-gray-700/50'} rounded-lg p-4`}>
            <div className='flex items-center justify-between'>
              <span className={`${themeClasses.text} font-medium`}>
                Chỉ số Rủi ro (tự động tính):
              </span>
              <div className='flex items-center gap-3'>
                <span className={`text-2xl font-bold ${getRiskColor(formData.risk_index)}`}>
                  {formData.risk_index.toFixed(2)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    getRiskLevel(formData.risk_index) === 'Cao'
                      ? 'bg-red-500/20 text-red-400'
                      : getRiskLevel(formData.risk_index) === 'Trung Bình'
                      ? 'bg-orange-300/20 text-orange-300'
                      : 'bg-green-300/20 text-green-300'
                  }`}
                >
                  {getRiskLevel(formData.risk_index)}
                </span>
              </div>
            </div>
            <p className={`text-xs ${themeClasses.textSecondary} mt-2`}>
              Công thức: (Exposure + Susceptibility) / Resilience
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RiskIndexManagement;
