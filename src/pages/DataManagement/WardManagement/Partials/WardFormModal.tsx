import * as yup from 'yup';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../../utils/themeUtils';
import { Input, Modal, Button } from '../../../../components';
import type {
  AdministrativeUnit,
  AdministrativeUnitCreatePayload,
} from '../../../../services/administrativeUnitService';
import { createPolygonFromCenter } from '../utils';

const createWardSchema = yup.object().shape({
  name: yup.string().required('Tên phường là bắt buộc').trim().max(100),
  area_km2: yup.number().min(0).required('Diện tích là bắt buộc'),
  coordinates: yup
    .string()
    .required('Tọa độ bắt buộc (lat,lng)')
    .test('coords', 'Tọa độ không hợp lệ', (v) => {
      if (!v?.trim()) return false;
      const p = v.split(',').map((c) => parseFloat(c.trim()));
      return p.length >= 2 && !isNaN(p[0]) && !isNaN(p[1]);
    }),
});

export interface WardFormData {
  name: string;
  area_km2: number;
  coordinates: string;
}

interface WardFormModalProps {
  isOpen: boolean;
  editingWard: AdministrativeUnit | null;
  form: WardFormData;
  errors: Record<string, string>;
  loading: boolean;
  onClose: () => void;
  onChange: (data: WardFormData) => void;
  onErrorsChange: (errors: Record<string, string>) => void;
  onSubmit: (data: WardFormData, geom: AdministrativeUnitCreatePayload['geom']) => void;
}

export default function WardFormModal({
  isOpen,
  editingWard,
  form,
  errors,
  loading,
  onClose,
  onChange,
  onErrorsChange,
  onSubmit,
}: WardFormModalProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const handleSubmit = async () => {
    const schema = editingWard ? createWardSchema : createWardSchema;
    try {
      await schema.validate(form, { abortEarly: false });
      onErrorsChange({});
    } catch (err) {
      const e: Record<string, string> = {};
      (err as yup.ValidationError).inner?.forEach((x) => {
        if (x.path) e[x.path] = x.message;
      });
      onErrorsChange(e);
      return;
    }
    const [lat, lng] = form.coordinates.split(',').map((c) => parseFloat(c.trim()));
    const geom = createPolygonFromCenter(lat, lng);
    onSubmit(form, geom);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingWard ? 'Chỉnh sửa phường' : 'Thêm phường'}
      maxWidth='sm'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' onClick={onClose}>
            Hủy
          </Button>
          <Button variant='primary' onClick={handleSubmit} disabled={loading}>
            {editingWard ? 'Cập nhật' : 'Thêm'}
          </Button>
        </div>
      }
    >
      <div className='space-y-4'>
        <Input
          label='Tên phường *'
          value={form.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({ ...form, name: e.target.value })
          }
          error={errors.name}
          placeholder='Ví dụ: Phường Linh Trung'
        />
        <Input
          label='Diện tích (km²) *'
          type='number'
          step='0.01'
          min={0}
          value={form.area_km2 || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({
              ...form,
              area_km2: parseFloat(e.target.value) || 0,
            })
          }
          error={errors.area_km2}
        />
        <div>
          <label className={`block text-sm font-medium mb-1 ${themeClasses.text}`}>
            Tọa độ (lat,lng) *
          </label>
          <input
            type='text'
            value={form.coordinates}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange({ ...form, coordinates: e.target.value })
            }
            placeholder='10.7769, 106.7009'
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.coordinates ? 'border-red-500' : ''
            } ${theme === 'light' ? 'bg-white' : 'bg-gray-800'}`}
          />
          {errors.coordinates && <p className='text-sm text-red-500 mt-1'>{errors.coordinates}</p>}
        </div>
      </div>
    </Modal>
  );
}
