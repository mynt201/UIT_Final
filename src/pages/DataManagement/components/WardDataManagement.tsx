import { useState, useMemo, useRef } from 'react';
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
import { useFormik } from 'formik';
import { useTheme } from '../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../utils/themeUtils';
import { Table, Input, Textarea, Modal, Button } from '../../../components';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatNumber } from '../../../utils/formatUtils';
import toast from 'react-hot-toast';
import { api } from '../../../plugins/axios';
import * as yup from 'yup';

type GeometryCoords = number[] | number[][][] | number[][][][];

interface WardGeometry {
  type: string;
  coordinates?: GeometryCoords;
}

interface WardData {
  _id?: string;
  ward_name: string;
  district: string;
  province: string;
  population_density: number;
  area_km2?: number;
  population?: number;
  geometry: WardGeometry;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface WardCreatePayload {
  ward_name: string;
  district: string;
  province: string;
  area_km2: number;
  population_density: number;
  geometry: WardGeometry;
  description?: string;
}

type CsvRow = Record<string, string | number>;

interface WardBulkItem {
  ward_name: string;
  district: string;
  province: string;
  area_km2: number;
  population_density: number;
  geometry: { type: string; coordinates: number[] };
  description: string;
}

interface InvalidCsvRow {
  [key: string]: string | number | string[] | undefined;
  errors: string[];
}

type UploadDetailItem =
  | { id: string; ward_name: string; status: 'success' }
  | { ward_name: string; error: string; status: 'failed' }
  | { ward_name: string; reason: string; status: 'duplicate' }
  | InvalidCsvRow;

interface BulkImportApiResponse {
  success: boolean;
  results?: {
    successful: Array<{ id: string; ward_name: string }>;
    failed: Array<{ ward_name: string; error: string }>;
    duplicates: Array<{ ward_name: string; reason: string }>;
  };
}

// Validation schemas matching backend
const createWardSchema = yup.object().shape({
  ward_name: yup
    .string()
    .required('Tên phường/xã là bắt buộc')
    .trim()
    .max(100, 'Tên phường/xã không được vượt quá 100 ký tự'),
  district: yup
    .string()
    .trim()
    .max(100, 'Tên quận/huyện không được vượt quá 100 ký tự')
    .optional(),
  province: yup
    .string()
    .trim()
    .max(100, 'Tên tỉnh/thành phố không được vượt quá 100 ký tự')
    .optional(),
  area_km2: yup
    .number()
    .min(0, 'Diện tích phải là số dương')
    .required('Diện tích là bắt buộc'),
  population_density: yup
    .number()
    .min(0, 'Mật độ dân số phải là số dương')
    .required('Mật độ dân số là bắt buộc'),
  coordinates: yup
    .string()
    .required('Tọa độ là bắt buộc')
    .test('valid-coordinates', 'Tọa độ không hợp lệ (định dạng: latitude,longitude)', (value) => {
      if (!value) return false;
      const coords = value.split(',').map((c: string) => parseFloat(c.trim()));
      if (coords.length < 2) return false;
      const [lat, lng] = coords;
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }),
  description: yup.string().optional(),
});

const updateWardSchema = yup.object().shape({
  ward_name: yup
    .string()
    .trim()
    .max(100, 'Tên phường/xã không được vượt quá 100 ký tự')
    .test('not-empty', 'Tên phường/xã không được để trống', (value) => {
      if (value === undefined || value === null) return true; // Optional in update
      return value.trim().length > 0;
    })
    .optional(),
  district: yup
    .string()
    .trim()
    .max(100, 'Tên quận/huyện không được vượt quá 100 ký tự')
    .optional(),
  province: yup
    .string()
    .trim()
    .max(100, 'Tên tỉnh/thành phố không được vượt quá 100 ký tự')
    .optional(),
  area_km2: yup
    .number()
    .min(0, 'Diện tích phải là số dương')
    .optional(),
  population_density: yup
    .number()
    .min(0, 'Mật độ dân số phải là số dương')
    .optional(),
  coordinates: yup
    .string()
    .test('valid-coordinates', 'Tọa độ không hợp lệ (định dạng: latitude,longitude)', (value, context) => {
      // If editing MultiPolygon and coordinates empty, allow (will keep original geometry)
      if (context.parent.geometryType === 'MultiPolygon' && (!value || !value.trim())) {
        return true;
      }
      if (!value || !value.trim()) return false;
      const coords = value.split(',').map((c: string) => parseFloat(c.trim()));
      if (coords.length < 2) return false;
      const [lat, lng] = coords;
      return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    })
    .optional(),
  description: yup.string().optional(),
});

export type WardFormValues = {
  ward_name: string;
  district: string;
  province: string;
  area_km2: number;
  population_density: number;
  coordinates: string;
  description: string;
  geometryType: string;
};

const initialFormValues: WardFormValues = {
  ward_name: '',
  district: '',
  province: '',
  area_km2: 0,
  population_density: 0,
  coordinates: '',
  description: '',
  geometryType: 'Point',
};

const WardDataManagement = () => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWard, setEditingWard] = useState<WardData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    successful: number;
    failed: number;
    duplicates: number;
    details: UploadDetailItem[];
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

  // Helper function to extract coordinates from geometry (Point or MultiPolygon)
  const extractCoordinates = (geometry: WardGeometry | null): [number, number] | null => {
    if (!geometry || !geometry.coordinates) return null;

    const { type, coordinates } = geometry;

    if (type === 'Point' && Array.isArray(coordinates) && coordinates.length >= 2) {
      const pt = coordinates as number[];
      return [pt[1], pt[0]];
    }
    if (type === 'MultiPolygon' && Array.isArray(coordinates) && coordinates.length > 0) {
      const firstPolygon = coordinates[0] as number[][][];
      if (Array.isArray(firstPolygon) && firstPolygon.length > 0) {
        const firstRing = firstPolygon[0] as number[][];
        if (Array.isArray(firstRing) && firstRing.length > 0) {
          const firstPoint = firstRing[0] as number[];
          if (firstPoint.length >= 2) {
            return [firstPoint[1], firstPoint[0]];
          }
        }
      }
    }
    if (type === 'Polygon' && Array.isArray(coordinates) && coordinates.length > 0) {
      const firstRing = coordinates[0] as number[][];
      if (Array.isArray(firstRing) && firstRing.length > 0) {
        const firstPoint = firstRing[0] as number[];
        if (firstPoint.length >= 2) {
          return [firstPoint[1], firstPoint[0]];
        }
      }
    }
    return null;
  };

  const formikRef = useRef<ReturnType<typeof useFormik<WardFormValues>> | null>(null);

  const getApiError = (error: unknown): string => {
    const err = error as { response?: { data?: { error?: string } } };
    return err?.response?.data?.error || 'Có lỗi xảy ra';
  };

  // Mutations for CRUD operations (defined first so formik onSubmit can use them)
  const createWardMutation = useMutation({
    mutationFn: async (wardData: WardCreatePayload) => {
      const response = await api.post('/wards', wardData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Thêm phường/xã thành công!');
      queryClient.invalidateQueries({ queryKey: ['wards'] });
      setIsUploadModalOpen(false);
      formikRef.current?.resetForm({ values: initialFormValues });
    },
    onError: (error: unknown) => {
      toast.error(getApiError(error) || 'Có lỗi xảy ra khi thêm phường/xã');
    },
  });

  const updateWardMutation = useMutation({
    mutationFn: async ({ id, wardData }: { id: string; wardData: WardCreatePayload }) => {
      const response = await api.put(`/wards/${id}`, wardData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Cập nhật phường/xã thành công!');
      queryClient.invalidateQueries({ queryKey: ['wards'] });
      setIsEditModalOpen(false);
      setEditingWard(null);
      formikRef.current?.resetForm({ values: initialFormValues });
    },
    onError: (error: unknown) => {
      toast.error(getApiError(error) || 'Có lỗi xảy ra khi cập nhật phường/xã');
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
    onError: (error: unknown) => {
      toast.error(getApiError(error) || 'Có lỗi xảy ra khi xóa phường/xã');
    },
  });

  const isEditMode = !!editingWard;
  const validationSchema = useMemo(
    () => (isEditMode ? updateWardSchema : createWardSchema),
    [isEditMode]
  );

  const getInitialValues = (): WardFormValues => {
    if (!editingWard) return initialFormValues;
    const coords = extractCoordinates(editingWard.geometry || {});
    const coordinates = coords ? `${coords[0]}, ${coords[1]}` : '';
    return {
      ward_name: editingWard.ward_name ?? '',
      district: editingWard.district ?? '',
      province: editingWard.province ?? '',
      area_km2: editingWard.area_km2 ?? 0,
      population_density: editingWard.population_density ?? 0,
      coordinates,
      description: editingWard.description ?? '',
      geometryType: editingWard.geometry?.type ?? 'Point',
    };
  };

  const formik = useFormik<WardFormValues>({
    initialValues: getInitialValues(),
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      let geometry: WardData['geometry'] | null = null;

      if (editingWard?.geometry?.type === 'MultiPolygon' && !values.coordinates.trim()) {
        geometry = editingWard.geometry;
      } else if (values.coordinates.trim()) {
        const coords = values.coordinates.split(',').map((c) => parseFloat(c.trim()));
        if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          geometry = {
            type: 'Point',
            coordinates: [coords[1], coords[0]],
          };
        }
      }

      if (!geometry) {
        formik.setFieldError('coordinates', 'Vui lòng nhập tọa độ hợp lệ (định dạng: latitude,longitude)');
        toast.error('Vui lòng nhập tọa độ hợp lệ');
        return;
      }

      const apiData: WardCreatePayload = {
        ward_name: values.ward_name.trim(),
        district: values.district.trim(),
        province: values.province.trim(),
        area_km2: values.area_km2,
        population_density: values.population_density,
        geometry,
      };
      if (values.description?.trim()) apiData.description = values.description.trim();

      if (editingWard) {
        updateWardMutation.mutate({ id: editingWard._id!, wardData: apiData });
      } else {
        createWardMutation.mutate(apiData);
      }
    },
  });

  formikRef.current = formik;

  const handleEdit = (ward: WardData) => {
    setEditingWard(ward);
    setIsEditModalOpen(true);
  };

  const closeModalAndReset = () => {
    setIsUploadModalOpen(false);
    setIsEditModalOpen(false);
    setEditingWard(null);
    formik.resetForm({ values: initialFormValues });
  };

  const openCreateModal = () => {
    setEditingWard(null);
    setIsUploadModalOpen(true);
  };

  const handleDelete = (wardId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa phường/xã này?')) {
      deleteWardMutation.mutate(wardId);
    }
  };

  const parseCSV = (csvText: string): CsvRow[] => {
    const cleanText = csvText.replace(/^\uFEFF/, '');
    const lines = cleanText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) =>
      h
        .trim()
        .replace(/["'\uFEFF]/g, '')
        .toLowerCase()
    );
    const data: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
      const row: CsvRow = {};

      headers.forEach((header, index) => {
        const value = values[index]?.trim() || '';
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

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
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

  const validateWardData = (
    data: CsvRow[]
  ): { valid: WardBulkItem[]; invalid: InvalidCsvRow[] } => {
    const valid: WardBulkItem[] = [];
    const invalid: InvalidCsvRow[] = [];

    for (const row of data) {
      const errors: string[] = [];

      const wardName = (
        row['tên phường xã'] ||
        row['Tên phường xã'] ||
        row['mã phường xã'] ||
        row['Mã phường xã']
      )
        ?.toString()
        .trim();
      const district = (row['quận huyện'] || row['Quận huyện'])?.toString().trim();
      const province = (row['tỉnh thành phố'] || row['Tỉnh thành phố'])?.toString().trim();

      if (!wardName) errors.push('Thiếu tên phường xã');
      if (!district || !province) errors.push('Thiếu thông tin quận huyện hoặc tỉnh thành phố');

      const population = Number(row['Dân số']);
      const area = Number(row['Diện tích (km²)']);
      if (population <= 0) errors.push('Dân số phải lớn hơn 0');
      if (area <= 0) errors.push('Diện tích phải lớn hơn 0');

      if (errors.length > 0) {
        invalid.push({ ...row, errors } as InvalidCsvRow);
        continue;
      }

      let geometry: { type: 'Point'; coordinates: number[] } | null = null;
      const coordStr = (row['tọa độ'] || row['Tọa độ'])?.toString().trim();
      if (coordStr) {
        const coords = coordStr.split(',').map((c) => parseFloat(c.trim()));
        if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
          geometry = {
            type: 'Point',
            coordinates: [coords[1], coords[0]],
          };
        }
      }

      if (!geometry) {
        errors.push('Tọa độ không hợp lệ (định dạng: latitude,longitude)');
        invalid.push({ ...row, errors } as InvalidCsvRow);
        continue;
      }

      valid.push({
        ward_name: wardName,
        district: district,
        province: province,
        area_km2: area,
        population_density: population,
        geometry,
        description: (row['mô tả'] || row['Mô tả'])?.toString().trim() || '',
      });
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

      const response = await api.post<BulkImportApiResponse>('/wards/bulk-import', {
        wards: valid,
      });

      const result = response.data;
      const res = result.results;

      if (result.success && res) {
        const details: UploadDetailItem[] = [
          ...res.successful.map((s) => ({ ...s, status: 'success' as const })),
          ...res.failed.map((f) => ({ ...f, status: 'failed' as const })),
          ...res.duplicates.map((d) => ({ ...d, status: 'duplicate' as const })),
        ];
        setUploadResults({
          successful: res.successful.length,
          failed: res.failed.length,
          duplicates: res.duplicates.length,
          details,
        });

        toast.success(`Upload thành công: ${res.successful.length} phường/xã`);
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
            onClick={openCreateModal}
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
                {uploadResults.details.slice(0, 10).map((detail: UploadDetailItem, index: number) => (
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
                      {'ward_name' in detail ? detail.ward_name : `Row ${index + 1}`}
                    </span>
                    {'errors' in detail && detail.errors && (
                      <span className='text-red-500 ml-2'>
                        - {Array.isArray(detail.errors) ? detail.errors.join(', ') : detail.errors}
                      </span>
                    )}
                    {'reason' in detail && detail.reason && (
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
          { header: 'Tên phường/xã', accessor: 'ward_name' },
          { header: 'Quận huyện', accessor: 'district' },
          { header: 'Tỉnh thành phố', accessor: 'province' },
          {
            header: 'Diện tích (km²)',
            accessor: 'area_km2',
            render: (value) => formatNumber(value as number),
          },
          {
            header: 'Mật độ dân số',
            accessor: 'population_density',
            render: (value) => formatNumber(value as number),
          },
          {
            header: 'Tọa độ',
            accessor: 'geometry',
            render: (value) => {
              const geom = (value ?? null) as WardGeometry | null;
              const coords = extractCoordinates(geom);
              if (coords) {
                const geomType = geom?.type || 'Point';
                return (
                  <div className='text-sm'>
                    <div>{coords[0]}, {coords[1]}</div>
                    {geomType !== 'Point' && (
                      <div className='text-xs text-gray-500 mt-1'>({geomType})</div>
                    )}
                  </div>
                );
              }
              return <span className='text-sm'>-</span>;
            },
          },
          {
            header: 'Thao tác',
            accessor: '_id',
            render: (_, row) => (
              <div className='flex gap-2'>
                <button
                  onClick={() => handleEdit(row as WardData)}
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
                  onClick={() => handleDelete((row as WardData)._id ?? '')}
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
        onClose={closeModalAndReset}
        title={editingWard ? 'Chỉnh sửa Phường/Xã' : 'Thêm Phường/Xã mới'}
        footer={
          <>
            <Button variant='secondary' type='button' onClick={closeModalAndReset}>
              Hủy
            </Button>
            <Button
              variant='primary'
              type='button'
              onClick={() => formik.handleSubmit()}
              disabled={createWardMutation.isPending || updateWardMutation.isPending}
            >
              {createWardMutation.isPending || updateWardMutation.isPending
                ? 'Đang xử lý...'
                : editingWard
                ? 'Cập nhật'
                : 'Thêm mới'}
            </Button>
          </>
        }
      >
        <form onSubmit={formik.handleSubmit} id='ward-form' className='space-y-4'>
          <Input
            label='Tên phường/xã *'
            type='text'
            name='ward_name'
            required
            value={formik.values.ward_name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.ward_name ? formik.errors.ward_name : undefined}
          />
          <Input
            label='Quận/Huyện'
            type='text'
            name='district'
            value={formik.values.district}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.district ? formik.errors.district : undefined}
          />
          <Input
            label='Tỉnh/Thành phố'
            type='text'
            name='province'
            value={formik.values.province}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.province ? formik.errors.province : undefined}
          />
          <div className='grid grid-cols-2 gap-4'>
            <Input
              label='Diện tích (km²) *'
              type='number'
              name='area_km2'
              required
              step='0.01'
              min={0}
              value={formik.values.area_km2}
              onChange={(e) => formik.setFieldValue('area_km2', parseFloat(e.target.value) || 0)}
              onBlur={formik.handleBlur}
              error={formik.touched.area_km2 ? formik.errors.area_km2 : undefined}
            />
            <Input
              label='Mật độ dân số *'
              type='number'
              name='population_density'
              required
              min={0}
              value={formik.values.population_density}
              onChange={(e) => formik.setFieldValue('population_density', parseFloat(e.target.value) || 0)}
              onBlur={formik.handleBlur}
              error={formik.touched.population_density ? formik.errors.population_density : undefined}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>
              Tọa độ (latitude,longitude){' '}
              {editingWard?.geometry?.type === 'MultiPolygon'
                ? '(tùy chọn - giữ nguyên MultiPolygon nếu để trống)'
                : '*'}
            </label>
            {editingWard?.geometry?.type === 'MultiPolygon' && (
              <p className='text-xs text-gray-500 mb-2'>
                Phường này có MultiPolygon. Nhập tọa độ mới để chuyển sang Point, hoặc để trống để giữ nguyên.
              </p>
            )}
            <Textarea
              name='coordinates'
              value={formik.values.coordinates}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              rows={2}
              placeholder='10.7769,106.7009'
              className={`font-mono text-sm ${formik.touched.coordinates && formik.errors.coordinates ? 'border-red-500' : ''}`}
              required={!editingWard || editingWard.geometry?.type === 'Point'}
              error={formik.touched.coordinates ? formik.errors.coordinates : undefined}
            />
          </div>
          <Textarea
            label='Mô tả'
            name='description'
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            rows={2}
            placeholder='Mô tả về phường/xã...'
            error={formik.touched.description ? formik.errors.description : undefined}
          />
        </form>
      </Modal>
    </div>
  );
};

export default WardDataManagement;
