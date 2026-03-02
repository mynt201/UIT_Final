import { useTheme } from '../../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../../utils/themeUtils';
import { Input, Modal, Button, Select } from '../../../../components';
import type { FloodIndicator } from '../../../../services/indicatorValueService';
import type { AdministrativeUnit } from '../../../../services/administrativeUnitService';

interface WardIndicatorFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  form: Record<string, string | number>;
  indicators: FloodIndicator[];
  indicatorCodes: string[];
  allUnits: AdministrativeUnit[];
  unitFallback: Record<string, string>;
  loading: boolean;
  onClose: () => void;
  onChange: (form: Record<string, string | number>) => void;
  onSubmit: () => void;
}

export default function WardIndicatorFormModal({
  isOpen,
  isEdit,
  form,
  indicators,
  indicatorCodes,
  allUnits,
  unitFallback,
  loading,
  onClose,
  onChange,
  onSubmit,
}: WardIndicatorFormModalProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  const unitOptions = [
    { value: '', label: '-- Chọn phường --' },
    ...allUnits.map((u) => ({ value: u._id, label: u.name })),
  ];

  const unitsStr = indicatorCodes
    .map((c) => {
      const ind = indicators.find((i) => i.code === c);
      const u = ind?.unit ?? unitFallback[c];
      return u ? `${c}=${u}` : c;
    })
    .join(', ');

  const title = isEdit
    ? `Chỉnh sửa chỉ số — Đơn vị: ${unitsStr}`
    : `Thêm chỉ số theo phường và năm — Đơn vị: ${unitsStr}`;

  const thuậnCodes = indicatorCodes.filter(
    (c) => (indicators.find((i) => i.code === c)?.direction ?? 1) === 1
  );
  const nghịchCodes = indicatorCodes.filter(
    (c) => (indicators.find((i) => i.code === c)?.direction ?? 1) === 0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth='2xl'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' onClick={onClose}>
            Hủy
          </Button>
          <Button variant='primary' onClick={onSubmit} disabled={loading}>
            Lưu
          </Button>
        </div>
      }
    >
      <div className='space-y-4'>
        <Select
          label='Phường *'
          options={unitOptions}
          value={form.unit_id != null ? String(form.unit_id) : ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            onChange({ ...form, unit_id: e.target.value })
          }
          disabled={isEdit}
        />
        <Input
          label='Năm *'
          type='number'
          min={2000}
          max={2100}
          value={form.data_year != null ? String(form.data_year) : ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onChange({
              ...form,
              data_year: Number(e.target.value) || new Date().getFullYear(),
            })
          }
          disabled={isEdit}
        />
        <div className='grid grid-cols-2 gap-4'>
          {indicatorCodes.map((code) => {
            const ind = indicators.find((i) => i.code === code);
            const unit = ind?.unit ?? unitFallback[code];
            return (
              <Input
                key={code}
                label={`${code}${ind ? ` - ${ind.name}` : ''}${unit ? ` (${unit})` : ''}`}
                value={form[code] != null ? String(form[code]) : ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const v = e.target.value;

                  onChange({ ...form, [code]: v });
                }}
              />
            );
          })}
        </div>
        <p className={`text-xs ${themeClasses.textSecondary}`}>
          {thuậnCodes.length > 0 && (
            <>Thuận ({thuậnCodes.join(', ')}): (giá trị − min) / (max − min).</>
          )}
          {thuậnCodes.length > 0 && nghịchCodes.length > 0 && ' '}
          {nghịchCodes.length > 0 && (
            <>Nghịch ({nghịchCodes.join(', ')}): (max − giá trị) / (max − min).</>
          )}
          {thuậnCodes.length === 0 && nghịchCodes.length === 0 && (
            <>Chuẩn hóa theo direction của từng chỉ số.</>
          )}
        </p>
      </div>
    </Modal>
  );
}
