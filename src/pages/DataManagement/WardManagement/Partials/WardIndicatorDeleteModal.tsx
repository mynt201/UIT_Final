import { Modal, Button } from '../../../../components';
import { useTheme } from '../../../../contexts/ThemeContext';
import { getThemeClasses } from '../../../../utils/themeUtils';
import type { WardYearIndicatorRow } from '../types';

interface WardIndicatorDeleteModalProps {
  row: WardYearIndicatorRow | null;
  indicatorCount: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function WardIndicatorDeleteModal({
  row,
  indicatorCount,
  loading,
  onClose,
  onConfirm,
}: WardIndicatorDeleteModalProps) {
  const { theme } = useTheme();
  const themeClasses = getThemeClasses(theme);

  return (
    <Modal
      isOpen={!!row}
      onClose={onClose}
      title='Xác nhận xóa'
      maxWidth='sm'
      footer={
        <div className='flex justify-end gap-3'>
          <Button variant='secondary' onClick={onClose}>
            Hủy
          </Button>
          <Button variant='danger' onClick={onConfirm} disabled={loading}>
            Xóa
          </Button>
        </div>
      }
    >
      <p className={themeClasses.text}>
        Xóa {indicatorCount} chỉ số của phường <strong>{row?.unit_name}</strong> năm{' '}
        <strong>{row?.data_year}</strong>?
      </p>
    </Modal>
  );
}
